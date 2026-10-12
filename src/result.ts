import type { ConsentSkipReason, MatchedBy } from './banner.ts';
import type { ConsentAttempt } from './browser.ts';
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

/** What one consent run saw after its click, read absolutely rather than as a delta. */
export interface SubmittedConsentRun {
  pressed: boolean;
  reason?: ConsentSkipReason;
  matchedBy?: MatchedBy;
  /** Every cookie still set after the press. */
  cookiesAfterClick: SubmittedCookie[];
  /**
   * Of those, the ones this run's own arrival reading did not have: cookies the
   * press itself set. A delta, but against the reading from the same page load,
   * which is what the old one was not.
   */
  newAfterClick: SubmittedCookie[];
  /** Third-party hosts contacted since the press, which the browser tracks separately. */
  hostsAfterClick: string[];
}

export interface SubmittedConsent {
  tested: boolean;
  rejectByDefault?: boolean;
  bannerFound: boolean;
  accept: SubmittedConsentRun;
  reject: SubmittedConsentRun;
}

/** Exactly the arguments `submit_check` takes. */
export interface Submission {
  checkId: string;
  resultVersion: typeof RESULT_VERSION;
  cookies: SubmittedCookie[];
  thirdPartyHosts: string[];
  truncated: boolean;
  /** Left out entirely when the plan did not ask for the consent action. */
  consent?: SubmittedConsent;
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

/** Identifies a cookie the way the browser does: name, domain and path together. */
const key = ({ name, domain, path }: { name: string; domain: string; path: string }) => `${name}\n${domain}\n${path}`;

const NOT_PRESSED = (reason: ConsentSkipReason): SubmittedConsentRun => ({
  pressed: false,
  reason,
  cookiesAfterClick: [],
  newAfterClick: [],
  hostsAfterClick: [],
});

/**
 * What one run saw after its click. Absolute, from this run alone: the server
 * used to reconstruct it by subtracting deltas from a different page load's
 * arrival, so the surviving count moved between runs on one site, and a tracker
 * that ran from arrival through reject could not appear at all.
 *
 * `arrival` is this run's own reading. It is the fallback for `newAfterClick`, which is
 * otherwise counted against the reading taken in the instant before the press; both come
 * from the same page load, so either comparison is safe.
 */
export const buildConsentRun = (
  attempt: ConsentAttempt | null,
  arrival: { cookies: CapturedCookie[]; thirdPartyHosts: string[] },
  limits: Limits,
): SubmittedConsentRun => {
  // No attempt at all means this run's own load failed, so nothing was seen of the page.
  // Saying "no banner" here would report on a page the check never got to look at.
  if (!attempt) return NOT_PRESSED('load-failed');
  if (!attempt.pressed || !attempt.after) return NOT_PRESSED(attempt.reason ?? 'no-button');

  const cookiesAfterClick: SubmittedCookie[] = [];
  for (const cookie of attempt.after.cookies) {
    if (cookiesAfterClick.length >= limits.maxCookies) break;
    const submitted = toSubmitted(cookie, limits);
    if (submitted) cookiesAfterClick.push(submitted);
  }

  // Against what the page had the instant before the press, so "the press set this" means
  // exactly that: a cookie the page set on its own while its banner was still being looked
  // for belongs to the page, not to the button. Falls back to the run's own arrival.
  const before = new Set((attempt.after.before ?? arrival.cookies).map(key));
  const newAfterClick = cookiesAfterClick.filter((cookie) => !before.has(key(cookie)));

  const hostsAfterClick: string[] = [];
  for (const host of new Set(attempt.after.thirdPartyHosts.map((h) => h.toLowerCase()))) {
    if (hostsAfterClick.length >= limits.maxThirdPartyHosts) break;
    if (fits(host, HOSTNAME, limits.maxHostLength)) hostsAfterClick.push(host);
  }

  return {
    pressed: true,
    ...(attempt.matchedBy ? { matchedBy: attempt.matchedBy } : {}),
    cookiesAfterClick,
    newAfterClick,
    hostsAfterClick,
  };
};

export interface ConsentLoad {
  attempt: ConsentAttempt | null;
  arrival: { cookies: CapturedCookie[]; thirdPartyHosts: string[] };
}

/**
 * The consent half of the submission: one run for accept, one for reject.
 *
 * `bannerFound` is what a run that actually loaded saw. A run whose load failed
 * contributes nothing to it, so a failed accept run beside a successful reject
 * run reports the banner the reject run found, and says `load-failed` for the
 * accept — never that the page had no banner.
 */
export const buildConsent = (accept: ConsentLoad, reject: ConsentLoad, limits: Limits): SubmittedConsent => {
  const runs = {
    accept: buildConsentRun(accept.attempt, accept.arrival, limits),
    reject: buildConsentRun(reject.attempt, reject.arrival, limits),
  };
  return {
    tested: runs.accept.pressed || runs.reject.pressed,
    bannerFound: accept.attempt?.bannerFound === true || reject.attempt?.bannerFound === true,
    ...(accept.attempt?.rejectByDefault || reject.attempt?.rejectByDefault ? { rejectByDefault: true } : {}),
    ...runs,
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
