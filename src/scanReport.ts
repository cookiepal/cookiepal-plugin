/**
 * The cookies a finished crawl reports, held to what `upload_scan_report`
 * accepts. The server refuses the whole upload over one cookie outside its
 * grammar, and the engine does return some: a cookie seen only in a
 * `Set-Cookie` header, such as one sent to expire it, comes back with an
 * empty domain. The same rule `toSubmitted` applies to a single-page check.
 */

import { categorise } from './categorise.ts';
import { cookieFits } from './result.ts';

/** The server's limits on a scanned cookie. A scan carries no plan, so they are not sent; they match a check's. */
const SCAN_COOKIE_LIMITS = { maxCookieNameLength: 128, maxCookieDomainLength: 253, maxCookiePathLength: 128 };

/** The most cookies one `upload_scan_report` call takes. */
export const MAX_SCAN_COOKIES = 500;

export interface EngineCookie {
  name: string;
  domain: string;
  path: string;
  duration: string;
  originScript?: string;
}

/** The cookies to report, and whether any that fit were left out because the upload is full. */
export const reportCookies = (cookies: EngineCookie[]): { cookies: Record<string, unknown>[]; capped: boolean } => {
  const fitting = cookies.filter((cookie) => cookieFits(cookie, SCAN_COOKIE_LIMITS));
  return {
    cookies: fitting.slice(0, MAX_SCAN_COOKIES).map((cookie) => {
      const { category, vendor } = categorise(cookie.name);
      return {
        name: cookie.name,
        domain: cookie.domain,
        path: cookie.path,
        duration: cookie.duration,
        category,
        ...(vendor ? { description: vendor } : {}),
      };
    }),
    capped: fitting.length > MAX_SCAN_COOKIES,
  };
};
