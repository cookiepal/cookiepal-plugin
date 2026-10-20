import { categorise } from './categorise.ts';
import {
  EXPLANATIONS,
  type FindingKind,
  LAW_KEYS,
  LAW25_CAVEAT,
  LAWS,
  type LawKey,
  NO_VERDICT,
  NOT_A_FINDING,
  SCOPE,
  UNKNOWN_CAVEAT,
} from './laws.ts';

/**
 * The local risk read (CPL-396). It takes the result `submit_check` returned,
 * which the PostToolUse hook saved on this machine, and turns it into one
 * explanation per law from the fixed wording in `laws.ts`.
 *
 * Everything here is a pure function of that result. Nothing is requested from
 * CookiePal, nothing is generated, and no sentence about a law exists outside
 * `laws.ts` — so the read cannot drift from the text that was reviewed.
 *
 * It never concludes. It pairs what the check found with what each law asks
 * for, and leaves the two side by side.
 */

/** The categories `@cookiepal-oss/cookie-db` assigns, as `submit_check` returns them. */
const CATEGORIES = ['necessary', 'functional', 'analytics', 'performance', 'advertisement', 'other'] as const;

type Category = (typeof CATEGORIES)[number];

export interface AssessedCookie {
  name: string;
  domain: string;
  category: Category;
}

export interface LawRead {
  law: LawKey;
  name: string;
  /** False when this finding is not a problem under this law; `text` then says why. */
  applies: boolean;
  text: string;
}

/**
 * The shape of what was found, which is the part worth reading when there is
 * too much of it to list. 89 cookie names say less than "57 not recognised,
 * then Microsoft Clarity 6, Twitter/X 5". The full list is in the inventory.
 */
export interface Group {
  label: string;
  count: number;
}

export interface Finding {
  kind: FindingKind;
  title: string;
  /** What was found, in counts. Never a judgement. */
  detail: string;
  /** One line under the detail when the finding has a shape worth naming. */
  shape?: string;
  /** Biggest first. Holds every group; the renderer shows the top few and sends the rest to the inventory. */
  groups: Group[];
  /** What the groups are counting, so a renderer can head the two columns correctly. */
  groupLabel?: { of: string; unit: string };
  cookies: AssessedCookie[];
  hosts: string[];
  byLaw: LawRead[];
}

/** Everything the check saw, in full, for the appendix. Nothing is dropped here. */
export interface Inventory {
  cookies: (AssessedCookie & { vendor: string | null })[];
  hosts: { host: string; domain: string }[];
}

export interface Assessment {
  page: string;
  country: string | null;
  checkedAt: string | null;
  checked: {
    cookies: number;
    thirdPartyHosts: number;
    consentTested: boolean;
    /** Whether reject itself was pressed: the consent action can be tested with only accept pressed. */
    rejectPressed: boolean;
    bannerFound: boolean;
  };
  findings: Finding[];
  /** True when the check found nothing to explain. Still gets the scope and the laws. */
  clean: boolean;
  /** One line per law, always present, whether or not anything was found. */
  laws: { law: LawKey; name: string; where: string; basis: string; asks: string }[];
  /** Things worth knowing about the result that are not findings. */
  notes: string[];
  /** The full lists, so nothing in a finding has to be truncated. */
  inventory: Inventory;
  scope: string;
  noVerdict: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isCategory = (value: unknown): value is Category =>
  typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value);

const str = (value: unknown): string | null => (typeof value === 'string' && value.length > 0 ? value : null);

const cookiesOf = (value: unknown): AssessedCookie[] =>
  (Array.isArray(value) ? value : []).flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const name = str(entry.name) ?? '';
    const domain = str(entry.domain);
    if (!domain || !isCategory(entry.category)) return [];
    return [{ name, domain, category: entry.category }];
  });

const hostsOf = (value: unknown): string[] =>
  (Array.isArray(value) ? value : []).flatMap((entry) => {
    const host = str(entry);
    return host ? [host] : [];
  });

/** The bucket for a cookie whose category the catalogue knows but whose vendor it does not. */
const NO_VENDOR = 'No vendor named';

const notNecessary = (cookies: AssessedCookie[]) => cookies.filter(({ category }) => category !== 'necessary');

/** In the catalogue, under any category. `category` alone cannot say: unknown cookies are sent as `other` too. */
const isKnown = ({ name }: AssessedCookie) => categorise(name).known;

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

const was = (n: number) => (n === 1 ? 'was' : 'were');

/** Kept in one place so the count and the verb after it never disagree. */
const notNecessaryPhrase = (n: number) =>
  n === 1 ? '1 cookie that is not strictly necessary' : `${n} cookies that are not strictly necessary`;

const list = (items: string[]): string =>
  items.length <= 1 ? (items[0] ?? '') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

/** The categories present, named, so the detail line says what kind of tracking it was. */
const describe = (cookies: AssessedCookie[]): string => {
  const named = CATEGORIES.filter(
    (category) =>
      category !== 'other' && category !== 'necessary' && cookies.some((cookie) => cookie.category === category),
  );
  return named.length > 0 ? ` (${list(named)})` : '';
};

/**
 * Registrable domain, near enough for grouping: the last two labels, or three
 * where the last two are a known public suffix. It is a display heuristic and
 * not ownership \u2014 globo.com and glbimg.com are one company and this cannot
 * know that \u2014 so it only ever groups rows, never drops one.
 */
const MULTI_PART_SUFFIXES = new Set([
  'com.br',
  'net.br',
  'org.br',
  'gov.br',
  'co.uk',
  'org.uk',
  'gov.uk',
  'com.au',
  'net.au',
  'co.jp',
  'co.nz',
  'com.mx',
  'com.ar',
  'com.co',
  'co.in',
  'com.tr',
  'com.sg',
  'com.hk',
]);

export const registrableDomain = (host: string): string => {
  const parts = host.toLowerCase().split('.').filter(Boolean);
  if (parts.length < 2) return host.toLowerCase();
  if (parts.length >= 3 && MULTI_PART_SUFFIXES.has(parts.slice(-2).join('.'))) {
    return parts.slice(-3).join('.');
  }
  return parts.slice(-2).join('.');
};

/** Counts by label, biggest first, ties broken by name so the order never wobbles. */
const group = (labels: (string | null)[]): Group[] => {
  const counts = new Map<string, number>();
  for (const label of labels) {
    if (label) counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
};

/** Builds one finding, with every law's reading of it attached. */
const finding = (
  kind: FindingKind,
  title: string,
  detail: string,
  cookies: AssessedCookie[],
  hosts: string[],
  extra: { shape?: string; groups?: Group[]; groupLabel?: { of: string; unit: string } } = {},
): Finding => ({
  kind,
  title,
  detail,
  ...(extra.shape ? { shape: extra.shape } : {}),
  groups: extra.groups ?? [],
  ...(extra.groupLabel ? { groupLabel: extra.groupLabel } : {}),
  cookies,
  hosts,
  byLaw: LAW_KEYS.map((law): LawRead => {
    const text = EXPLANATIONS[kind][law];
    if (text) return { law, name: LAWS[law].name, applies: true, text };
    return {
      law,
      name: LAWS[law].name,
      applies: false,
      text: NOT_A_FINDING[kind][law] ?? `Not a finding under ${LAWS[law].name}.`,
    };
  }),
});

/**
 * What a clean result can say about the banner's buttons. Only a reject that
 * was actually pressed can be said to have left nothing running.
 */
export const consentLine = ({ checked }: Pick<Assessment, 'checked'>): string => {
  if (checked.rejectPressed) return 'Pressing the banner’s reject button left nothing running.';
  if (checked.consentTested) return 'The reject button was not pressed, so what it does is not covered.';
  return 'The consent action was not tested, so what the banner’s buttons do is not covered.';
};

/**
 * Reads the `submit_check` result. Anything missing or the wrong shape is read
 * as absent rather than raised: a partial result still deserves the explanation
 * of the part that is there, and this never decides whether a check succeeded.
 */
export const assess = (raw: unknown): Assessment => {
  const result = isRecord(raw) ? raw : {};
  const cookies = cookiesOf(result.cookies);
  const hosts = hostsOf(result.thirdPartyHosts);
  const summary = isRecord(result.summary) ? result.summary : {};
  const consent = isRecord(result.consent) ? result.consent : {};
  const reject = isRecord(consent.reject) ? consent.reject : {};
  const tested = consent.tested === true;

  const findings: Finding[] = [];
  const notes: string[] = [];

  // Not knowing a cookie says nothing about whether it is necessary, so an unknown
  // one goes only to `unidentified-cookies`. One the catalogue files as `other` is known.
  const tracking = notNecessary(cookies.filter(isKnown));
  const unidentified = cookies.filter((cookie) => !isKnown(cookie));
  if (tracking.length > 0) {
    // Grouped by the vendor the catalogue names, which is the fact worth reading
    // when there are more cookies than anyone will read one by one. A cookie whose
    // category is known but whose vendor is not still has to appear, or the counts
    // add up to less than the finding says and the table quietly lies.
    const identifiable = group(tracking.map(({ name }) => categorise(name).vendor));
    const unattributed = tracking.filter(({ name }) => !categorise(name).vendor).length;
    const vendors = [...identifiable, ...(unattributed > 0 ? [{ label: NO_VENDOR, count: unattributed }] : [])];
    const domains = new Set(tracking.map(({ domain }) => domain)).size;
    findings.push(
      finding(
        'tracking-before-consent',
        'Cookies were set before the visitor agreed to anything',
        `${notNecessaryPhrase(tracking.length)} ${was(tracking.length)} already set when the page finished ` +
          `loading${describe(tracking)}.`,
        tracking,
        [],
        {
          groups: vendors,
          groupLabel: { of: 'Vendor', unit: 'Cookies' },
          shape:
            (identifiable.length > 0
              ? `From ${plural(identifiable.length, 'identifiable vendor')}, across ` +
                `${plural(domains, 'cookie domain')}.`
              : `Across ${plural(domains, 'cookie domain')}. The catalogue names no vendor for any of them.`) +
            // Says where the unknown ones went, so they are not read as left out.
            (unidentified.length > 0
              ? ` Another ${unidentified.length} the catalogue does not know ` +
                `${unidentified.length === 1 ? 'is' : 'are'} counted under the next finding.`
              : ''),
        },
      ),
    );
  }

  // The catalogue not knowing a cookie is its own finding: a site has to be able
  // to account for what it sets, and here nobody reading the check can.
  if (unidentified.length > 0) {
    findings.push(
      finding(
        'unidentified-cookies',
        'Some cookies could not be identified',
        `${unidentified.length} of the ${plural(cookies.length, 'cookie')} set before consent ` +
          `${was(unidentified.length)} not in the open-source catalogue, so what ` +
          `${unidentified.length === 1 ? 'it does' : 'they do'} on this page is unknown.`,
        unidentified,
        [],
        {
          shape: UNKNOWN_CAVEAT,
          groups: group(unidentified.map(({ domain }) => domain)),
          groupLabel: { of: 'Cookie domain', unit: 'Cookies' },
        },
      ),
    );
  }

  if (hosts.length > 0) {
    const domains = group(hosts.map(registrableDomain));
    findings.push(
      finding(
        'hosts-before-consent',
        'Other companies were contacted before the visitor agreed to anything',
        `The page contacted ${plural(hosts.length, 'third-party host')} before any consent was given, ` +
          `belonging to ${plural(domains.length, 'domain')}.`,
        [],
        hosts,
        {
          groups: domains,
          groupLabel: { of: 'Domain', unit: 'Hosts' },
          shape:
            'Domains are grouped by name, which is not the same as by owner: two domains can belong to one ' +
            'company, and this cannot tell.',
        },
      ),
    );
  }

  const afterReject = isRecord(summary.afterReject) ? summary.afterReject : null;
  if (afterReject) {
    // The reject run's own list rather than the summary's counts, so the finding
    // names the cookies it is about.
    const surviving = notNecessary(cookiesOf(reject.cookiesAfterClick).filter(isKnown));
    const stillContacted = hostsOf(afterReject.stillContactedHosts);
    if (surviving.length > 0 || stillContacted.length > 0) {
      const found = [
        surviving.length > 0
          ? `${notNecessaryPhrase(surviving.length)}${describe(surviving)} ${was(surviving.length)} still set`
          : null,
        stillContacted.length > 0
          ? `${plural(stillContacted.length, 'third-party host')} ${was(stillContacted.length)} still being contacted`
          : null,
      ].filter((part): part is string => part !== null);
      findings.push(
        finding(
          'active-after-reject',
          'Tracking was still active after the visitor pressed reject',
          `After the check pressed the banner’s reject button, ${list(found)}.`,
          surviving,
          stillContacted,
        ),
      );
    }
  }

  // `newAfterClick`, not everything still set: this finding is about a banner
  // that sets tracking when a visitor declines, which is worse than one that
  // merely fails to clear what was already there. `active-after-reject` above
  // covers the latter. The delta is the run's own, against its own arrival.
  const addedAfterReject = notNecessary(cookiesOf(reject.newAfterClick).filter(isKnown));
  if (addedAfterReject.length > 0) {
    findings.push(
      finding(
        'set-after-reject',
        'New cookies were set by pressing reject',
        `${notNecessaryPhrase(addedAfterReject.length)} appeared only after the reject button was ` +
          `pressed${describe(addedAfterReject)}.`,
        addedAfterReject,
        [],
      ),
    );
  }

  if (!tested) {
    notes.push(
      consent.bannerFound === true
        ? 'The consent action was not tested on this page, so nothing here says what the banner’s ' +
            'buttons actually do. Only the state on arrival was read.'
        : 'No consent action was tested on this page. Everything here describes the state on arrival, ' +
            'before any button was pressed.',
    );
  }

  if (result.truncated === true) {
    notes.push('The check hit its size limits, so some cookies or hosts are missing from this read.');
  }

  if (findings.some(({ kind }) => EXPLANATIONS[kind].law25 !== null)) notes.push(LAW25_CAVEAT);

  return {
    page: str(result.page) ?? '',
    country: str(result.country),
    checkedAt: str(result.checkedAt),
    checked: {
      cookies: cookies.length,
      thirdPartyHosts: hosts.length,
      consentTested: tested,
      rejectPressed: reject.pressed === true,
      bannerFound: consent.bannerFound === true,
    },
    findings,
    clean: findings.length === 0,
    laws: LAW_KEYS.map((law) => ({
      law,
      name: LAWS[law].name,
      where: LAWS[law].where,
      basis: LAWS[law].basis === 'opt-in' ? 'asks first' : 'lets people opt out',
      asks: LAWS[law].asks,
    })),
    notes,
    inventory: {
      cookies: cookies.map((cookie) => ({ ...cookie, vendor: categorise(cookie.name).vendor })),
      hosts: hosts.map((host) => ({ host, domain: registrableDomain(host) })),
    },
    scope: SCOPE,
    noVerdict: NO_VERDICT,
  };
};
