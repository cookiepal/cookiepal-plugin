/** The plan and result versions this version of the plugin understands. */
export const PLAN_VERSION = 1;
export const RESULT_VERSION = 2;

export const UPDATE_HINT = 'Update the plugin with /plugin marketplace update cookiepal, then restart Claude Code.';

export interface Limits {
  maxCookies: number;
  maxCookieNameLength: number;
  maxCookieDomainLength: number;
  maxCookiePathLength: number;
  maxThirdPartyHosts: number;
  maxHostLength: number;
}

/** Matchers for one consent button, in the order they are tried. */
export interface ButtonMatchers {
  /** `data-cookiepal-tag` values on CookiePal's own banner. */
  tags: string[];
  ids: string[];
  classes: string[];
  /** Lowercase labels, matched as a substring of a button's own text. Last resort. */
  texts: string[];
}

export interface ConsentPlan {
  afterClickSettleMs: number;
  banner: { ids: string[]; classes: string[]; keywords: string[] };
  accept: ButtonMatchers;
  reject: ButtonMatchers;
}

export interface Plan {
  checkId: string;
  country: string | null;
  page: string;
  settleMs: number;
  timeoutMs: number;
  limits: Limits;
  /** Null when the plan asks for the arrival-only check, or its matchers are unusable. */
  consent: ConsentPlan | null;
}

// A plan tunes the load within these bounds. It cannot turn off the skill's own
// rules (a fresh profile, no values, no links followed), which are not in it.
const MAX_SETTLE_MS = 10_000;
const MAX_TIMEOUT_MS = 60_000;
const MAX_AFTER_CLICK_SETTLE_MS = 10_000;

// What a matcher from the server may be. Not a CSS selector: no brackets,
// quotes, colons, parentheses or whitespace, so a matcher can never become a
// selector, a script or a URL, however the server changes.
const MATCHER = /^[A-Za-z0-9_\x2D]{1,64}$/;
const MAX_MATCHERS = 64;
const MAX_TEXT_LENGTH = 64;
// A text matcher is compared with `includes`, never compiled, but it is placed
// in the script sent to the page as JSON: control characters and the line and
// paragraph separators are refused so it cannot end the string it sits in.
const isPlainText = (text: string) =>
  [...text].every((char) => {
    const point = char.codePointAt(0) ?? 0;
    return point > 0x1f && point !== 0x7f && point !== 0x2028 && point !== 0x2029;
  });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Parsed = { ok: true; plan: Plan } | { ok: false; error: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const bounded = (value: unknown, max: number): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.min(Math.floor(value), max) : null;

/**
 * Reads the plan `plan_check` returned. An unknown `planVersion` stops the check,
 * since fields this version cannot read might change what the check has to do.
 */
export const parsePlan = (raw: unknown): Parsed => {
  if (!isRecord(raw)) return { ok: false, error: 'The plan from plan_check is missing or not an object.' };
  if (raw.planVersion !== PLAN_VERSION) {
    return {
      ok: false,
      error: `CookiePal sent a check plan (version ${String(raw.planVersion)}) this version of the plugin does not understand. ${UPDATE_HINT}`,
    };
  }

  const { checkId, expiresAt, ranFrom, target, load, limits, submit } = raw;
  if (typeof expiresAt === 'string' && Date.parse(expiresAt) <= Date.now()) {
    return { ok: false, error: 'This check plan has expired. Start the check again.' };
  }
  if (typeof checkId !== 'string' || !UUID.test(checkId)) {
    return { ok: false, error: 'The plan has no valid check ID.' };
  }
  if (!isRecord(submit) || submit.resultVersion !== RESULT_VERSION) {
    return { ok: false, error: `The plan asks for a result version this plugin cannot send. ${UPDATE_HINT}` };
  }
  if (!isRecord(target) || typeof target.page !== 'string') return { ok: false, error: 'The plan has no page.' };
  if (!isRecord(load) || !isRecord(limits)) return { ok: false, error: 'The plan has no load settings or limits.' };

  const settleMs = bounded(load.settleMs, MAX_SETTLE_MS);
  const timeoutMs = bounded(load.timeoutMs, MAX_TIMEOUT_MS);
  if (settleMs === null || timeoutMs === null || timeoutMs === 0) {
    return { ok: false, error: 'The plan has invalid load settings.' };
  }

  const keys = [
    'maxCookies',
    'maxCookieNameLength',
    'maxCookieDomainLength',
    'maxCookiePathLength',
    'maxThirdPartyHosts',
    'maxHostLength',
  ] as const;
  const parsedLimits = {} as Limits;
  for (const key of keys) {
    const value = bounded(limits[key], 10_000);
    if (value === null) return { ok: false, error: `The plan has no valid ${key}.` };
    parsedLimits[key] = value;
  }

  const country = isRecord(ranFrom) && typeof ranFrom.country === 'string' ? ranFrom.country : null;
  return {
    ok: true,
    plan: {
      checkId,
      country,
      page: target.page,
      settleMs,
      timeoutMs,
      limits: parsedLimits,
      consent: parseConsent(raw.consent),
    },
  };
};

/** Keeps the entries that are plain identifiers, and only as many as the cap allows. */
const identifiers = (value: unknown): string[] =>
  (Array.isArray(value) ? value : [])
    .filter((entry): entry is string => typeof entry === 'string' && MATCHER.test(entry))
    .slice(0, MAX_MATCHERS);

/** Text is matched by `includes`, never compiled, so it only needs to be short and lowercase. */
const labels = (value: unknown): string[] =>
  (Array.isArray(value) ? value : [])
    .filter(
      (entry): entry is string =>
        typeof entry === 'string' && entry.length > 0 && entry.length <= MAX_TEXT_LENGTH && isPlainText(entry),
    )
    .map((entry) => entry.toLowerCase())
    .slice(0, MAX_MATCHERS);

const buttonMatchers = (value: unknown): ButtonMatchers => {
  const raw = isRecord(value) ? value : {};
  return {
    tags: identifiers(raw.tags),
    ids: identifiers(raw.ids),
    classes: identifiers(raw.classes),
    texts: labels(raw.texts),
  };
};

const anyMatcher = ({ tags, ids, classes, texts }: ButtonMatchers) =>
  tags.length + ids.length + classes.length + texts.length > 0;

/**
 * The banner matchers, held to what the plugin is willing to act on. A plan
 * that does not ask for the consent action, or that carries no usable matcher
 * for either button, leaves the check exactly as it was before CPL-398: the
 * arrival reading, and nothing pressed. A matcher is never a reason to fail a
 * check, so anything unusable is dropped rather than raised.
 */
const parseConsent = (value: unknown): ConsentPlan | null => {
  if (!isRecord(value) || value.action !== 'accept-and-reject') return null;

  const banner = isRecord(value.banner) ? value.banner : {};
  const accept = buttonMatchers(value.accept);
  const reject = buttonMatchers(value.reject);
  if (!anyMatcher(accept) && !anyMatcher(reject)) return null;

  return {
    afterClickSettleMs: bounded(value.afterClickSettleMs, MAX_AFTER_CLICK_SETTLE_MS) ?? 0,
    banner: {
      ids: identifiers(banner.ids),
      classes: identifiers(banner.classes),
      keywords: labels(banner.keywords),
    },
    accept,
    reject,
  };
};
