/**
 * Finding the CookiePal banner tag in a page, for `verify_installation`.
 *
 * This decides nothing. It reports which CookiePal banner script the page
 * loads, and the server compares that against the script the domain's own tag
 * must load — a tag copied from another site is a real CookiePal tag and still
 * not this domain's install, and only the server knows the difference.
 *
 * Everything it returns is page content: untrusted text that goes to the server
 * as evidence and is never acted on here. Nothing is clicked, nothing is
 * navigated, and no link is followed.
 */

import { readEvidence } from './savedPlans.ts';

/**
 * How long a `src` or a tag may be. A banner script URL is a CDN host plus
 * `/client_data/<id>/script.js`, so this is generous; it is a cap, not a shape.
 */
const MAX_SRC = 2048;
const MAX_TAG = 1024;
/** How many matching scripts are worth reporting. A page with more is already broken. */
const MAX_MATCHES = 10;

export interface FoundTag {
  /** The `src` of the CookiePal banner script the page loads, or null when it loads none. */
  scriptSrc: string | null;
  /** That script's opening tag as it appears in the page, or null. */
  tag: string | null;
  /** How many CookiePal banner scripts were found: more than one is worth telling the user about. */
  count: number;
}

export const NOT_FOUND: FoundTag = { scriptSrc: null, tag: null, count: 0 };

/**
 * Runs in the page. One self-contained function with no imports and no closure
 * over anything, because its source is sent to the browser as text — the same
 * shape as `banner.ts`'s locate function.
 *
 * It looks for scripts whose `src` is a CookiePal banner script, by the
 * `/client_data/<id>/script.js` path the CDN serves them under. That path is
 * required: `id="cookiepal"` is what the dashboard's tag carries, but accepting
 * any `src` that happened to carry the id would let a page nominate an
 * arbitrary URL as the evidence this check uploads, and hand it a field of free
 * text on the way. The id decides nothing here.
 *
 * Every match is returned, not the first in document order. A page that has
 * someone else's CookiePal tag above its own — exactly what "I pasted the wrong
 * one, then added the right one" looks like — would otherwise report the wrong
 * script and read as not installed.
 */
const FIND = function find(maxSrc: number, maxTag: number, maxMatches: number) {
  const CLIENT_DATA = /\/client_data\/[^/]+\/script\.js(?:[?#]|$)/;

  const srcOf = (element: Element): string => {
    // The attribute rather than `.src`, which the browser resolves against the
    // page: the server compares this with an absolute URL it built itself, and
    // a relative tag is not that. The query and fragment go: they are no part
    // of which file is fetched, the server compares origin and path only, and
    // the plugin never uploads a query string.
    const raw = element.getAttribute('src') ?? '';
    if (!raw) return '';
    try {
      const url = new URL(raw, document.baseURI);
      url.search = '';
      url.hash = '';
      return url.href;
    } catch {
      return '';
    }
  };

  const scripts = Array.prototype.slice.call(document.querySelectorAll('script[src]')) as Element[];
  const found = scripts.filter((script) => CLIENT_DATA.test(srcOf(script)));

  if (found.length === 0) return { matches: [], count: 0 };

  /**
   * Each tag is rebuilt from the attributes that are evidence, never sliced out
   * of `outerHTML`.
   *
   * What makes a banner tag is its `src`, its `id` and whether it defers; an
   * arbitrary `data-` attribute says nothing about the install. Echoing the
   * page's own bytes would hand a page up to a kilobyte of free prose in a
   * field that reaches the model, so only these attributes are read, each short
   * and each refused if it could close the tag it is written into.
   */
  const describe = (element: Element) => {
    const src = srcOf(element);
    const quoted = (name: string): string => {
      const value = (element.getAttribute(name) ?? '').slice(0, 64);
      return !value || /["'<>]/.test(value) ? '' : ` ${name}="${value}"`;
    };
    const tag =
      `<script${quoted('id')}${quoted('type')}` +
      `${src ? ` src="${src.slice(0, maxSrc)}"` : ''}` +
      `${element.hasAttribute('defer') ? ' defer' : ''}` +
      `${element.hasAttribute('async') ? ' async' : ''}>`;
    return { src: src.slice(0, maxSrc), tag: tag.slice(0, maxTag) };
  };

  return {
    matches: found.slice(0, maxMatches).map(describe),
    count: found.length,
  };
};

/** The expression evaluated in the page. Its only arguments are this file's own numbers. */
export const findTagExpression = (): string => `(${FIND.toString()})(${MAX_SRC}, ${MAX_TAG}, ${MAX_MATCHES})`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Two script URLs are the same file when their origin and path match. */
const sameScript = (a: string, b: string): boolean => {
  try {
    const found = new URL(a);
    const expected = new URL(b);
    return found.origin === expected.origin && found.pathname === expected.pathname;
  } catch {
    return false;
  }
};

/**
 * Reads what the page returned, holding it to the shape and the grammar the
 * server's evidence schema accepts: printable ASCII on one line, within the
 * caps above. A page that returns anything else reads as no tag found rather
 * than as a failed parse, because a page can return whatever it likes.
 *
 * `expectedScriptUrl` is this domain's own script, from the server. When the
 * page carries several banner tags, the one that matches it is the one
 * reported: the question is whether this domain's banner is on the page, and a
 * stranger's tag sitting above it does not make the answer no. The server still
 * decides — it compares the reported `src` against its own copy — this only
 * stops the wrong one of several being the one it sees.
 */
export const parseFoundTag = (value: unknown, expectedScriptUrl?: string): FoundTag => {
  if (!isRecord(value) || !Array.isArray(value.matches)) return NOT_FOUND;

  const text = (field: unknown, max: number): string | null => {
    if (typeof field !== 'string' || field.length === 0 || field.length > max) return null;
    // The schema's own grammar: printable ASCII only, so no line break, bidi
    // override or invisible tag character can carry prose to the model.
    return /^[\x20-\x7E]*$/.test(field) ? field : null;
  };

  const raw = typeof value.count === 'number' && Number.isFinite(value.count) ? value.count : 0;
  const count = Math.max(0, Math.trunc(raw));

  // Without a `src` there is nothing for the server to compare, so such a match
  // is dropped rather than reported as a tag with no source.
  const matches = value.matches
    .map((match) =>
      isRecord(match)
        ? { scriptSrc: text(match.src, MAX_SRC), tag: text(match.tag, MAX_TAG) }
        : { scriptSrc: null, tag: null },
    )
    .filter((match): match is { scriptSrc: string; tag: string | null } => match.scriptSrc !== null);

  if (matches.length === 0) return { ...NOT_FOUND, count };

  const chosen = (expectedScriptUrl && matches.find((m) => sameScript(m.scriptSrc, expectedScriptUrl))) || matches[0];

  return { ...chosen, count: Math.max(count, matches.length) };
};

/**
 * The decision behind the PreToolUse hook on `verify_installation`. Fails
 * closed: evidence that no local run produced, for a domain no run covered, or
 * edited after a run, is refused before anything is sent.
 *
 * This is not what makes the evidence trustworthy — it comes from the user's own
 * machine, and whoever controls that machine can forge it, which is why the
 * server records it as indicative. What it does prevent is a verified install
 * the model inferred rather than measured.
 */
export const verifyDecision = (dir: string | null, input: unknown): 'allow' | 'deny' => {
  if (!dir || !isRecord(input) || !isRecord(input.evidence)) return 'deny';
  const { evidence } = input;
  if (typeof evidence.url !== 'string') return 'deny';

  // Which domain's run to compare against: the one the call names, or the site
  // of the page it says was read.
  let domainId: string;
  if (typeof input.domainId === 'string' && input.domainId.length > 0) {
    domainId = input.domainId;
  } else {
    try {
      domainId = new URL(evidence.url).hostname;
    } catch {
      return 'deny';
    }
  }

  // Both spellings, in both directions: the server may name the domain with
  // `www.` while the page read was the apex, or the other way round, and the run
  // is saved under whichever name the server used.
  const bare = domainId.replace(/^www\./i, '');
  const saved = readEvidence(dir, domainId) ?? readEvidence(dir, bare) ?? readEvidence(dir, `www.${bare}`);
  if (!saved) return 'deny';

  // Field by field, not by comparing serialised objects: the model retypes this
  // object into its tool call, so the same reading can arrive with its keys in
  // another order, and `JSON.stringify` would call that a forgery. The extra-key
  // check is what keeps this as strict as the string comparison was.
  const fields = ['url', 'seenAt', 'scriptSrc', 'tag', 'loadError'] as const;
  const sameShape = Object.keys(evidence).length === fields.length && Object.keys(saved).length === fields.length;
  const sameValues = fields.every((field) => saved[field] === evidence[field]);

  return sameShape && sameValues ? 'allow' : 'deny';
};
