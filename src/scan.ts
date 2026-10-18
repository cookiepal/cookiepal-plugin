#!/usr/bin/env node
/**
 * The detached local crawl `start_scan` begins. Spawned by the PostToolUse
 * hook on `start_scan` (`save-scan`, `handleScanStarted` in `check.ts`), with its stdio ignored and
 * unref'd, so the hook returns at once and this keeps running after Claude
 * Code moves on. `scan status` reports what it finds in `saveScanProgress`'s
 * record as it goes.
 *
 * Invoked as `node scan.mjs <scanId>`. Nothing from the server or the page
 * reaches a command line: the scan's own URL and page budget come from the
 * file `start_scan`'s PostToolUse hook already saved, keyed by the ID this
 * takes as its only argument.
 */

import { rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { CheckError, findBrowser } from './browser.ts';
import { categorise } from './categorise.ts';
import { engineEntry, ensureEngine } from './engine.ts';
import { readScan, saveScanProgress } from './savedPlans.ts';

/** Matches the published CLI's own defaults (`cookiepal crawl`'s `--max-depth`/`--concurrency`). */
const MAX_DEPTH = 3;
const CONCURRENCY = 3;

interface EngineModule {
  crawl: (options: Record<string, unknown>) => Promise<{
    pagesVisited: number;
    cookies: { name: string; domain: string; path: string; duration: string; originScript?: string }[];
    robotsBlocked: string[];
    startBlockedByRobots: boolean;
  }>;
}

const run = async (): Promise<void> => {
  const scanId = process.argv[2];
  const dataDir = process.env.COOKIEPAL_DATA_DIR || null;
  if (!scanId || !dataDir) return;

  const scan = readScan(dataDir, scanId);
  if (!scan) {
    // The hook already wrote `running`; without this the status would sit there until it expires.
    saveScanProgress(dataDir, scanId, {
      status: 'failed',
      error: 'The scan could not be found. Start a new one with start_scan.',
    });
    return;
  }

  const storageDir = `${dataDir}/crawl-storage/${scanId}`;
  try {
    ensureEngine(dataDir);
    // The first-time install can take minutes with no page crawled; keep `scan status` from calling that dead.
    saveScanProgress(dataDir, scanId, { status: 'running', pagesVisited: 0 });

    const browserPath = findBrowser();
    if (!browserPath) {
      throw new CheckError(
        'No Chrome, Edge, Brave or Chromium was found. Install one, or set COOKIEPAL_BROWSER to its executable.',
      );
    }
    process.env.PUPPETEER_EXECUTABLE_PATH = browserPath;

    const engineUrl = pathToFileURL(engineEntry(dataDir)).href;
    const { crawl } = (await import(engineUrl)) as EngineModule;
    saveScanProgress(dataDir, scanId, { status: 'running', pagesVisited: 0 });

    let pagesVisited = 0;
    const result = await crawl({
      url: scan.url,
      maxPages: scan.maxPages,
      maxDepth: MAX_DEPTH,
      concurrency: CONCURRENCY,
      storageDir,
      keepImages: true,
      markRequests: false,
      respectRobots: true,
      onPageCrawled: () => {
        pagesVisited += 1;
        saveScanProgress(dataDir, scanId, { status: 'running', pagesVisited });
      },
    });

    if (result.startBlockedByRobots) {
      saveScanProgress(dataDir, scanId, {
        status: 'blocked',
        blockedUrl: result.robotsBlocked[0] ?? scan.url,
      });
      return;
    }

    const cookies = result.cookies.map((cookie) => {
      const { category, vendor } = categorise(cookie.name);
      return {
        name: cookie.name,
        domain: cookie.domain,
        path: cookie.path,
        duration: cookie.duration,
        category,
        ...(vendor ? { description: vendor } : {}),
      };
    });

    saveScanProgress(dataDir, scanId, {
      status: 'done',
      pagesScanned: result.pagesVisited,
      cookies,
      thirdPartyHosts: [],
      // A heuristic: the engine reports no truncation signal, so a site with exactly maxPages pages reads as truncated too.
      truncated: result.pagesVisited >= scan.maxPages,
    });
  } catch (error) {
    saveScanProgress(dataDir, scanId, {
      status: 'failed',
      error: error instanceof CheckError ? error.message : 'The crawl could not be completed.',
    });
  } finally {
    // The crawl's page data is only needed while it runs; nothing else sweeps this folder.
    rmSync(storageDir, { recursive: true, force: true });
  }
};

run();
