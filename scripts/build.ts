import { rmSync, writeFileSync } from 'node:fs';
import { cookies } from '@cookiepal-oss/cookie-db';
import { type BuildOptions, build, type Plugin } from 'esbuild';

const shared: BuildOptions = {
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  legalComments: 'inline',
  outdir: 'dist',
  outExtension: { '.js': '.mjs' },
  banner: { js: '// Built from src/ by pnpm build. Do not edit: CI fails when this file is out of date.' },
};

/**
 * tldts goes in its own `dist/tldts.mjs`, beside the bundles that import it. Its
 * public suffix list is most of the size of whichever bundle carries it, and the
 * plugin directory holds any file over 256 KiB for a reviewer.
 */
const tldtsBeside: Plugin = {
  name: 'tldts-beside',
  setup: (plugin) => {
    plugin.onResolve({ filter: /^tldts$/ }, () => ({ path: './tldts.mjs', external: true }));
  },
};

// Cleared first, so a file the build stops writing fails the dist/ freshness check rather than staying committed.
rmSync('dist', { recursive: true, force: true });
await build({ ...shared, entryPoints: ['src/check.ts', 'src/scan.ts'], plugins: [tldtsBeside] });
// tldts' `main` is CommonJS, which bundles without its named exports.
await build({ ...shared, entryPoints: { tldts: 'tldts' }, mainFields: ['module', 'main'] });

// Only the fields `src/categorise.ts` reads: the descriptions are nearly half the catalogue.
const lookup = cookies.map(({ name, vendor, category, wildcard }) => ({ name, vendor, category, wildcard }));
writeFileSync('dist/cookies.json', `${JSON.stringify(lookup)}\n`);
