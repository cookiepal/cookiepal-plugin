import { getDomain } from 'tldts';

/**
 * The registrable domain from the public suffix list, private domains included,
 * so `app.cookiepal.io` and `mcp.cookiepal.io` share `cookiepal.io` while
 * `jack.github.io` and `other.github.io` stay apart. Null for an IP or `localhost`.
 */
export const site = (host: string): string | null => getDomain(host, { allowPrivateDomains: true });

/**
 * CookiePal's banner accepts every category when the page URL contains
 * `cookiepal-crawl=true` or `crawl=true` anywhere, so a check of such a URL would
 * read a consented page. The second is a substring of the first, so one marker
 * covers both. This mirrors the server's `parseCheckUrl`, so the URL the skill
 * loads is the one `plan_check` normalises.
 */
const CRAWL_MARKER = 'crawl=true';

export type PreparedUrl =
  | {
      ok: true;
      /** What the browser loads: the URL as given, minus its fragment and crawl markers. */
      target: string;
      /** Origin and path, which is what CookiePal stores and counts. */
      page: string;
      /** The query parameters removed because they carried a crawl marker. */
      removed: string[];
    }
  | { ok: false; error: string };

export const prepareUrl = (raw: string): PreparedUrl => {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { ok: false, error: 'That is not a valid URL. Give a full address, such as https://example.com.' };
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { ok: false, error: 'Only http and https pages can be checked.' };
  }
  if (url.username || url.password) {
    return { ok: false, error: 'The URL must not contain a username or password.' };
  }

  url.hash = '';
  const removed: string[] = [];
  url.searchParams.forEach((value, name) => {
    if (`${name}=${value}`.includes(CRAWL_MARKER)) removed.push(name);
  });
  for (const name of removed) url.searchParams.delete(name);

  const target = url.href;
  if (target.includes(CRAWL_MARKER)) {
    return { ok: false, error: `The URL contains "${CRAWL_MARKER}" outside its query, which would skew the check.` };
  }

  const path = url.pathname.replace(/\/+$/, '') || '/';
  return { ok: true, target, page: `${url.origin}${path}`, removed: [...new Set(removed)] };
};
