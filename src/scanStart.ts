/**
 * Where the crawl starts. The engine follows links only on its start URL's
 * exact origin, so a site whose apex redirects to `www.` (or `http:` to
 * `https:`) gets a one-page crawl that reads as complete. Following the
 * redirect first makes that origin the one the site actually serves.
 */

import { getDomain } from 'tldts';
import { CheckError } from './browser.ts';
import { isCrawlableUrl } from './savedPlans.ts';

const START_TIMEOUT_MS = 15_000;

/**
 * The URL the start URL lands on after its redirects. A site that does not
 * answer, or refuses a plain request, keeps its start URL: the crawl's own
 * browser load is what decides whether it can be read.
 */
export const resolveStart = async (url: string, fetchImpl: typeof fetch = fetch): Promise<string> => {
  let landed: string;
  try {
    const response = await fetchImpl(url, { redirect: 'follow', signal: AbortSignal.timeout(START_TIMEOUT_MS) });
    await response.body?.cancel();
    landed = response.url || url;
  } catch {
    return url;
  }
  if (landed === url) return url;

  // Only within the same site, and never to a host the scan would refuse to start on.
  const from = new URL(url).hostname;
  const to = new URL(landed).hostname;
  if (getDomain(to) !== getDomain(from) || !isCrawlableUrl(landed)) {
    throw new CheckError(
      `${from} redirects to another site, so a crawl from it would not cover this domain. Check the domain's URL in CookiePal.`,
    );
  }
  return landed;
};
