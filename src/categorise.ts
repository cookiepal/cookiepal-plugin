import { type CategorySlug, cookies } from '@cookiepal-oss/cookie-db';

export type Category = CategorySlug;

interface Match {
  category: Category;
  vendor: string | null;
  /** False for a name the catalogue does not have, which `category` alone cannot say: the catalogue files cookies as `other` too. */
  known: boolean;
}

const exact = new Map<string, Match>();
/** Catalogue entries marked `wildcard` are name prefixes, such as `_ga_` for `_ga_ABC123`. */
const prefixes: { prefix: string; match: Match }[] = [];

for (const entry of cookies) {
  const match = { category: entry.category, vendor: entry.vendor === 'Unknown' ? null : entry.vendor, known: true };
  const name = entry.name.toLowerCase();
  if (entry.wildcard) prefixes.push({ prefix: name, match });
  else if (!exact.has(name)) exact.set(name, match);
}
// Longest first, so `_gat_` wins over a shorter prefix that also fits.
prefixes.sort((a, b) => b.prefix.length - a.prefix.length);

const UNKNOWN: Match = { category: 'other', vendor: null, known: false };

/**
 * Categorises a cookie on this machine from the public `@cookiepal-oss/cookie-db`
 * catalogue. A name the catalogue does not know is `other`, as `submit_check` expects,
 * and `known: false`, so the local read can still tell it from the catalogue's own `other`.
 */
export const categorise = (name: string): Match => {
  const lower = name.toLowerCase();
  const found = exact.get(lower);
  if (found) return found;
  for (const { prefix, match } of prefixes) {
    if (lower.startsWith(prefix) && lower.length > prefix.length) return match;
  }
  return UNKNOWN;
};
