/**
 * Installing the crawl engine `start_scan` runs. Crawlee and Puppeteer are
 * real browser-automation dependencies, not something this plugin's single
 * esbuild bundle can carry, so they are never bundled: `@cookiepal-oss/cli`
 * is installed into the plugin's own data folder on first use, the same way a
 * project installs any other npm dependency, and never copied into this repo.
 *
 * The install runs with `--ignore-scripts`. No dependency the engine imports
 * needs one, and the two that have one would only do harm here:
 * `better-sqlite3`, which only the CLI's own dashboard uses, has no prebuild
 * for every Node version and falls back to compiling, which fails without a
 * C++ toolchain; and Puppeteer's would download a Chromium nothing uses, since
 * the crawl runs the user's own browser, the one `findBrowser` finds.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CheckError } from './browser.ts';

/**
 * The crawl engine version this plugin installs, bumped in lockstep with
 * `@cookiepal-oss/cli`'s own releases. 1.3.1 is the first whose crawl can
 * keep Chrome's sandbox on, which `scan.ts` asks for.
 */
export const ENGINE_VERSION = '1.3.1';

export const engineDir = (dataDir: string): string => join(dataDir, 'engine');

const enginePackageJson = (dataDir: string): string =>
  join(engineDir(dataDir), 'node_modules', '@cookiepal-oss', 'cli', 'package.json');

/** Where the installed engine's `/engine` export lands, for `scan.ts` to import. */
export const engineEntry = (dataDir: string): string =>
  join(engineDir(dataDir), 'node_modules', '@cookiepal-oss', 'cli', 'dist', 'engine.js');

const installedVersion = (dataDir: string): string | null => {
  try {
    const parsed: unknown = JSON.parse(readFileSync(enginePackageJson(dataDir), 'utf8'));
    return typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as { version?: unknown }).version === 'string'
      ? (parsed as { version: string }).version
      : null;
  } catch {
    return null;
  }
};

/** The `npm install` arguments for the pinned engine, into the plugin's data folder. */
export const installArgs = (dataDir: string): string[] => [
  'install',
  '--prefix',
  engineDir(dataDir),
  '--no-audit',
  '--no-fund',
  '--ignore-scripts',
  `@cookiepal-oss/cli@${ENGINE_VERSION}`,
];

/**
 * Installs the pinned engine version into the plugin's data folder, unless it
 * is already there. Every failure is a `CheckError` with a plain sentence: no
 * `npm`, no network, or an install that did not leave the version this expects.
 */
export const ensureEngine = (dataDir: string): void => {
  if (installedVersion(dataDir) === ENGINE_VERSION) return;

  if (!existsSync(engineDir(dataDir))) mkdirSync(engineDir(dataDir), { recursive: true });

  const result = spawnSync('npm', installArgs(dataDir), { encoding: 'utf8' });

  if (result.error) {
    throw new CheckError(`Could not run npm to install the crawl engine: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const lastLines = (result.stderr ?? '').trim().split('\n').slice(-5).join('\n');
    throw new CheckError(
      `Installing the crawl engine failed.${lastLines ? ` ${lastLines}` : ''} Check this machine has npm and a network connection, then try again.`,
    );
  }
  if (installedVersion(dataDir) !== ENGINE_VERSION) {
    throw new CheckError('The crawl engine did not install correctly. Try again.');
  }
};
