import { readFileSync } from 'node:fs';
import type { CategorySlug, CookieDbEntry } from '@cookiepal-oss/cookie-db';

export type Category = CategorySlug;

interface Match {
  category: Category;
  vendor: string | null;
  /** False for a name the catalogue does not have, which `category` alone cannot say: the catalogue files cookies as `other` too. */
  known: boolean;
}

interface Catalogue {
  exact: Map<string, Match>;
  /** Catalogue entries marked `wildcard` are name prefixes, such as `_ga_` for `_ga_ABC123`. */
  prefixes: { prefix: string; match: Match }[];
}

let catalogue: Catalogue | undefined;

/**
 * `pnpm build` writes the `@cookiepal-oss/cookie-db` catalogue to `dist/cookies.json` with
 * only these fields, rather than bundling all of it. The path resolves the same from `src/`
 * and from `dist/`. Read on first use, so the hooks that never categorise never load it.
 */
const loadCatalogue = (): Catalogue => {
  const cookies: Pick<CookieDbEntry, 'name' | 'vendor' | 'category' | 'wildcard'>[] = JSON.parse(
    readFileSync(new URL('../dist/cookies.json', import.meta.url), 'utf8'),
  );
  const exact = new Map<string, Match>();
  const prefixes: Catalogue['prefixes'] = [];
  for (const entry of cookies) {
    const match = { category: entry.category, vendor: entry.vendor === 'Unknown' ? null : entry.vendor, known: true };
    const name = entry.name.toLowerCase();
    if (entry.wildcard) prefixes.push({ prefix: name, match });
    else if (!exact.has(name)) exact.set(name, match);
  }
  // Longest first, so `_gat_` wins over a shorter prefix that also fits.
  prefixes.sort((a, b) => b.prefix.length - a.prefix.length);
  return { exact, prefixes };
};

const UNKNOWN: Match = { category: 'other', vendor: null, known: false };

/**
 * Categorises a cookie on this machine from the public `@cookiepal-oss/cookie-db`
 * catalogue. A name the catalogue does not know is `other`, as `submit_check` expects,
 * and `known: false`, so the local read can still tell it from the catalogue's own `other`.
 */
export const categorise = (name: string): Match => {
  catalogue ??= loadCatalogue();
  const lower = name.toLowerCase();
  const found = catalogue.exact.get(lower);
  if (found) return found;
  for (const { prefix, match } of catalogue.prefixes) {
    if (lower.startsWith(prefix) && lower.length > prefix.length) return match;
  }
  return UNKNOWN;
};
