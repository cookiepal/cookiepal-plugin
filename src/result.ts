import { type Category, categorise } from './categorise.ts';
import { type Limits, RESULT_VERSION } from './plan.ts';

/** A cookie as the browser reports it. Its value is never read into this shape. */
export interface CapturedCookie {
  name: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: string;
}

export interface SubmittedCookie {
  name: string;
  domain: string;
  path: string;
  expires: number | null;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  category: Category;
}

/** Exactly the arguments `submit_check` takes. */
export interface Submission {
  checkId: string;
  resultVersion: typeof RESULT_VERSION;
  cookies: SubmittedCookie[];
  thirdPartyHosts: string[];
  truncated: boolean;
}

// The grammar `submit_check` holds each string to. A cookie outside it is left
// out here, because the server refuses the whole check over one bad cookie.
const COOKIE_NAME = /^[\x21-\x3A\x3C\x3E-\x7E]*$/;
const COOKIE_DOMAIN = /^\.?[A-Za-z0-9_.:\x5B\x5D\x2D]+$/;
const COOKIE_PATH = /^\/[\x21-\x3A\x3C-\x7E]*$/;
const HOSTNAME = /^[A-Za-z0-9_.:\x5B\x5D\x2D]+$/;
const MAX_EXPIRES = 253_402_300_799;
const SAME_SITE = new Set(['Strict', 'Lax', 'None']);

const fits = (value: string, pattern: RegExp, max: number, min = 1) =>
  value.length >= min && value.length <= max && pattern.test(value);

const toSubmitted = (cookie: CapturedCookie, limits: Limits): SubmittedCookie | null => {
  const { name, domain, path } = cookie;
  if (!fits(name, COOKIE_NAME, limits.maxCookieNameLength, 0)) return null;
  if (!fits(domain, COOKIE_DOMAIN, limits.maxCookieDomainLength)) return null;
  if (!fits(path, COOKIE_PATH, limits.maxCookiePathLength)) return null;

  let expires: number | null = null;
  if (cookie.expires === -1) {
    expires = -1;
  } else if (Number.isFinite(cookie.expires) && cookie.expires >= 0) {
    expires = Math.floor(Math.min(cookie.expires, MAX_EXPIRES));
  }

  return {
    name,
    domain,
    path,
    expires,
    httpOnly: cookie.httpOnly === true,
    secure: cookie.secure === true,
    ...(cookie.sameSite && SAME_SITE.has(cookie.sameSite)
      ? { sameSite: cookie.sameSite as SubmittedCookie['sameSite'] }
      : {}),
    category: categorise(name).category,
  };
};

export interface Built {
  submission: Submission;
  /** Local-only detail for the summary; never sent. */
  vendors: Record<string, string>;
  droppedCookies: number;
  droppedHosts: number;
}

export const buildSubmission = (
  checkId: string,
  captured: CapturedCookie[],
  hosts: string[],
  limits: Limits,
): Built => {
  const cookies: SubmittedCookie[] = [];
  const vendors: Record<string, string> = {};
  let droppedCookies = 0;
  for (const cookie of captured) {
    const submitted = cookies.length < limits.maxCookies ? toSubmitted(cookie, limits) : null;
    if (!submitted) {
      droppedCookies++;
      continue;
    }
    cookies.push(submitted);
    const { vendor } = categorise(submitted.name);
    if (vendor) vendors[submitted.name] = vendor;
  }

  const thirdPartyHosts: string[] = [];
  let droppedHosts = 0;
  for (const host of new Set(hosts.map((h) => h.toLowerCase()))) {
    if (thirdPartyHosts.length < limits.maxThirdPartyHosts && fits(host, HOSTNAME, limits.maxHostLength)) {
      thirdPartyHosts.push(host);
    } else {
      droppedHosts++;
    }
  }

  return {
    submission: {
      checkId,
      resultVersion: RESULT_VERSION,
      cookies,
      thirdPartyHosts,
      truncated: droppedCookies > 0 || droppedHosts > 0,
    },
    vendors,
    droppedCookies,
    droppedHosts,
  };
};
