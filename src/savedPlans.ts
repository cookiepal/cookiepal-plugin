import { randomUUID } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { prepareUrl } from './url.ts';

/**
 * What passes between the steps of a check without going through the shell,
 * since Claude Code's Bash guard stops any command with JSON in it as possible
 * obfuscation, and nothing from the server should be pasted into a command:
 *
 * - `prepare` keeps the full URL to load, query included, under a random local
 *   `ref`, so `plan_check` only ever receives the origin and path. `run <ref>`
 *   loads exactly the URL that `prepare` was given.
 * - The PostToolUse hook on `plan_check` stores what Claude sent and what the
 *   server returned, and `run` takes the newest plan for its ref's page saved
 *   after that `prepare`. So a plan left by an interrupted check, or a plan for
 *   another page, is never loaded as this check. Two sessions sharing this data
 *   folder that check the same page at the same moment can still swap plans;
 *   each then loads the page it asked for, under the other's check ID.
 *
 * - The PostToolUse hook on `submit_check` stores the result the server
 *   returned, so `assess` reads the real result from disk rather than having it
 *   retyped into a command. The risk read is only worth anything if the numbers
 *   in it are the ones the check produced.
 *
 * Plans and targets are used once. A result is not: it is only the check's own
 * output coming back, so re-reading it replays nothing, and `assess` can be run
 * again without starting the check over. Everything past the server's 30-minute
 * plan window is ignored and deleted.
 */

const PLANS = 'plans';
const TARGETS = 'targets';
const RESULTS = 'results';
const REPORTS = 'reports';
const SNIPPETS = 'snippets';
const EVIDENCE = 'evidence';
const SCANS = 'scans';
const SCAN_PROGRESS = 'scan-progress';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const MAX_AGE_MS = 30 * 60 * 1000;

export interface SavedPlan {
  /** The URL Claude sent to `plan_check`. */
  url: string;
  plan: Record<string, unknown>;
  /** `Date.now()` when the hook saved it. */
  savedAt: number;
}

const isCheckId = (value: unknown): value is string => typeof value === 'string' && UUID.test(value);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseJson = (text: unknown): unknown => {
  if (typeof text !== 'string') return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

/** The hook gets the tool's text content as a string; the other shapes an MCP result takes are read too. */
/**
 * The structured body of a PostToolUse `tool_response`, whatever shape it took:
 * the hook gets the tool's text content as a string, as a content-block array
 * or as an object, and a caller that reads only one of them silently misreads
 * the others. Null when it is none of them.
 */
export const resultFrom = (response: unknown): Record<string, unknown> | null => {
  if (typeof response === 'string') return resultFrom(parseJson(response));
  if (Array.isArray(response)) {
    const text = response.find((block) => isRecord(block) && block.type === 'text');
    return isRecord(text) ? resultFrom(parseJson(text.text)) : null;
  }
  if (!isRecord(response)) return null;
  if (isRecord(response.structuredContent)) return response.structuredContent;
  if (Array.isArray(response.content)) return resultFrom(response.content);
  return response;
};

const isExpired = (path: string) => Date.now() - statSync(path).mtimeMs > MAX_AGE_MS;

/** The live files in a folder, newest first. Expired ones are deleted on the way. */
const liveFiles = (dir: string): string[] => {
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }
  const live: { path: string; mtime: number }[] = [];
  for (const name of names) {
    const path = join(dir, name);
    try {
      // `recursive` because `reports/` holds one directory per check, not files:
      // without it rmSync throws EISDIR, the catch below swallows it, and the
      // rendered reads are never swept.
      if (isExpired(path)) rmSync(path, { recursive: true, force: true });
      else live.push({ path, mtime: statSync(path).mtimeMs });
    } catch {}
  }
  return live.sort((a, b) => b.mtime - a.mtime).map(({ path }) => path);
};

const write = (dir: string, name: string, value: unknown) => {
  mkdirSync(dir, { recursive: true });
  liveFiles(dir);
  writeFileSync(join(dir, name), JSON.stringify(value), { mode: 0o600 });
};

const isRef = (value: unknown): value is string => typeof value === 'string' && UUID.test(value);

/**
 * What a domain may be when it names a file. One rule, used by every function
 * that reads or writes under a domain's name: a separator or a traversal in it
 * would otherwise choose the path, and a write side loosened without the read
 * side would make saved evidence unfindable, which the guard reads as a forgery.
 */
const isDomainId = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Za-z0-9.\-_]{1,253}$/.test(value);

/** Stores the plan from a PostToolUse payload. Anything that is not a plan is ignored. */
export const savePlan = (dataDir: string, payload: unknown): boolean => {
  if (!isRecord(payload) || !isRecord(payload.tool_input)) return false;
  const { url } = payload.tool_input;
  const plan = resultFrom(payload.tool_response);
  if (typeof url !== 'string' || !plan || !isCheckId(plan.checkId)) return false;
  const saved: SavedPlan = { url, plan, savedAt: Date.now() };
  write(join(dataDir, PLANS), `${plan.checkId}.json`, saved);
  return true;
};

const pageOf = (url: string) => {
  const prepared = prepareUrl(url);
  return prepared.ok ? prepared.page : null;
};

/** The newest plan for this page saved since `notBefore` and in the last 30 minutes, deleted as it is read. */
export const takePlanFor = (dataDir: string, page: string, notBefore: number): SavedPlan | null => {
  for (const path of liveFiles(join(dataDir, PLANS))) {
    let saved: unknown;
    try {
      saved = JSON.parse(readFileSync(path, 'utf8'));
    } catch {
      continue;
    }
    if (!isRecord(saved) || typeof saved.url !== 'string' || !isRecord(saved.plan)) continue;
    if (typeof saved.savedAt !== 'number' || saved.savedAt < notBefore) continue;
    if (pageOf(saved.url) !== page) continue;
    rmSync(path, { force: true });
    return { url: saved.url, plan: saved.plan, savedAt: saved.savedAt };
  }
  return null;
};

/** Deletes every saved plan, URL, result and report past the 30-minute window, so nothing lingers. */
export const sweep = (dataDir: string): void => {
  liveFiles(join(dataDir, PLANS));
  liveFiles(join(dataDir, TARGETS));
  liveFiles(join(dataDir, RESULTS));
  liveFiles(join(dataDir, REPORTS));
  liveFiles(join(dataDir, SNIPPETS));
  liveFiles(join(dataDir, EVIDENCE));
  liveFiles(join(dataDir, SCANS));
  liveFiles(join(dataDir, SCAN_PROGRESS));
};

/** Stores the `submit_check` result from a PostToolUse payload, under its own check ID. */
export const saveResult = (dataDir: string, payload: unknown): boolean => {
  if (!isRecord(payload)) return false;
  const result = resultFrom(payload.tool_response);
  if (!result || !isCheckId(result.checkId)) return false;
  write(join(dataDir, RESULTS), `${result.checkId}.json`, result);
  return true;
};

/**
 * The result the hook saved for this check ID, if it is still inside the
 * 30-minute window. Left in place once read, so the read can be repeated.
 */
export const readResult = (dataDir: string, checkId: string): Record<string, unknown> | null => {
  if (!isCheckId(checkId)) return null;
  const path = join(dataDir, RESULTS, `${checkId}.json`);
  try {
    if (isExpired(path)) {
      rmSync(path, { force: true });
      return null;
    }
    const saved: unknown = JSON.parse(readFileSync(path, 'utf8'));
    return isRecord(saved) ? saved : null;
  } catch {
    return null;
  }
};

/**
 * Writes one rendered form of the read next to the result and returns its path,
 * so the bytes never pass through the model on their way to being published or
 * opened. Every form is written on each run, whichever the user asked for:
 * falling back from one to the next is then only a matter of naming a different
 * path, with nothing to re-render and no second browser run.
 */
export const writeRendered = (dataDir: string, checkId: string, name: string, content: string): string | null => {
  if (!isCheckId(checkId) || !/^[a-z]+\.[a-z]+$/.test(name)) return null;
  const dir = join(dataDir, REPORTS, checkId);
  try {
    mkdirSync(dir, { recursive: true });
    const path = join(dir, name);
    writeFileSync(path, content, { mode: 0o600 });
    return path;
  } catch {
    return null;
  }
};

export interface SavedSnippet {
  /** The domain the snippet is for, as the server named it. */
  domainId: string;
  /** The script URL this domain's tag must load, which is what the install check looks for. */
  scriptUrl: string;
  /** `Date.now()` when the hook saved it. */
  savedAt: number;
}

/**
 * Stores what `get_install_snippet` returned, so the install check compares
 * against the server's own script URL rather than one retyped into a command.
 * The PostToolUse hook on that tool is what calls this.
 */
export const saveSnippet = (dataDir: string, payload: unknown): boolean => {
  if (!isRecord(payload)) return false;
  const result = resultFrom(payload.tool_response);
  if (!result || typeof result.domainId !== 'string' || typeof result.scriptUrl !== 'string') {
    return false;
  }
  // The domain names the file, so it is held to what a domain can be.
  if (!isDomainId(result.domainId)) return false;
  const saved: SavedSnippet = {
    domainId: result.domainId,
    scriptUrl: result.scriptUrl,
    savedAt: Date.now(),
  };
  write(join(dataDir, SNIPPETS), `${result.domainId}.json`, saved);
  return true;
};

/**
 * The newest snippet the hook saved in the last 30 minutes, or the one for a
 * named domain. Left in place once read: one snippet can be verified more than
 * once while a user fixes their tag, and it is only the server's own answer
 * coming back.
 */
export const readSnippet = (dataDir: string, domainId?: string): SavedSnippet | null => {
  // The same rule the write side applies. No caller names a domain today, but
  // the guard belongs with the path, not with whoever happens to call it.
  if (domainId !== undefined && !isDomainId(domainId)) return null;
  const paths = domainId ? [join(dataDir, SNIPPETS, `${domainId}.json`)] : liveFiles(join(dataDir, SNIPPETS));
  for (const path of paths) {
    try {
      if (isExpired(path)) {
        rmSync(path, { force: true });
        continue;
      }
      const saved: unknown = JSON.parse(readFileSync(path, 'utf8'));
      if (!isRecord(saved) || typeof saved.domainId !== 'string') continue;
      if (typeof saved.scriptUrl !== 'string' || typeof saved.savedAt !== 'number') continue;
      return { domainId: saved.domainId, scriptUrl: saved.scriptUrl, savedAt: saved.savedAt };
    } catch {}
  }
  return null;
};

/**
 * What a local install check found, kept so the PreToolUse hook on
 * `verify_installation` can refuse evidence that no local run produced. The
 * server's own copy is the one that counts; this is only how the guard knows
 * the call is reporting a real reading rather than an assembled one.
 */
export const saveEvidence = (dataDir: string, domainId: string, evidence: unknown): boolean => {
  if (!isDomainId(domainId)) return false;
  write(join(dataDir, EVIDENCE), `${domainId}.json`, { domainId, evidence, savedAt: Date.now() });
  return true;
};

/** The evidence a local run saved for this domain in the last 30 minutes. */
export const readEvidence = (dataDir: string, domainId: string): Record<string, unknown> | null => {
  if (!isDomainId(domainId)) return null;
  const path = join(dataDir, EVIDENCE, `${domainId}.json`);
  try {
    if (isExpired(path)) {
      rmSync(path, { force: true });
      return null;
    }
    const saved: unknown = JSON.parse(readFileSync(path, 'utf8'));
    return isRecord(saved) && isRecord(saved.evidence) ? saved.evidence : null;
  } catch {
    return null;
  }
};

export interface SavedTarget {
  page: string;
  target: string;
  /** `Date.now()` when `prepare` saved it: only plans saved after this belong to its check. */
  savedAt: number;
}

/** Keeps the full URL to load, so only its origin and path need to leave the machine. Returns its `ref`. */
export const saveTarget = (dataDir: string, target: Omit<SavedTarget, 'savedAt'>): string => {
  const ref = randomUUID();
  const saved: SavedTarget = { ...target, savedAt: Date.now() };
  write(join(dataDir, TARGETS), `${ref}.json`, saved);
  return ref;
};

/** The URL `prepare` saved under this ref in the last 30 minutes, left in place. */
export const readTarget = (dataDir: string, ref: string): SavedTarget | null => {
  if (!isRef(ref)) return null;
  const path = join(dataDir, TARGETS, `${ref}.json`);
  let saved: unknown;
  try {
    if (isExpired(path)) {
      rmSync(path, { force: true });
      return null;
    }
    saved = JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
  if (!isRecord(saved) || typeof saved.page !== 'string' || typeof saved.target !== 'string') return null;
  if (typeof saved.savedAt !== 'number') return null;
  return { page: saved.page, target: saved.target, savedAt: saved.savedAt };
};

/** Forgets a ref, once it has been used to load the page. */
export const dropTarget = (dataDir: string, ref: string): void => {
  if (!isRef(ref)) return;
  rmSync(join(dataDir, TARGETS, `${ref}.json`), { force: true });
};

/** The URL `prepare` saved under this ref in the last 30 minutes, deleted as it is read. */
export const takeTarget = (dataDir: string, ref: string): SavedTarget | null => {
  const saved = readTarget(dataDir, ref);
  dropTarget(dataDir, ref);
  return saved;
};

export interface SavedScan {
  scanId: string;
  domainId: string;
  url: string;
  maxPages: number;
  /** `Date.now()` when the hook saved it. */
  savedAt: number;
}

const isScanId = (value: unknown): value is string => typeof value === 'string' && UUID.test(value);

/**
 * Whether a scan's start URL may be crawled automatically: http(s) only, and
 * never loopback, link-local or private-range hosts, since the hook crawls it
 * with no step in between where the user could see it.
 */
export const isCrawlableUrl = (value: string): boolean => {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
  const host = url.hostname
    .toLowerCase()
    .replace(/^\x5B|\x5D$/g, '')
    .replace(/\.$/, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    return false;
  }
  // Public IPv6 never starts with `::`, which covers loopback, unspecified, IPv4-compatible and IPv4-mapped.
  if (host.includes(':')) return !/^(::|f[cd]|fe[89abc])/.test(host);
  const octets = host.split('.').map(Number);
  if (octets.length === 4 && octets.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) {
    const [a, b] = octets as [number, number, number, number];
    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    );
  }
  return true;
};

/** Stores what `start_scan` returned, from a PostToolUse payload. */
export const saveScan = (dataDir: string, payload: unknown): boolean => {
  if (!isRecord(payload)) return false;
  const result = resultFrom(payload.tool_response);
  if (!result || !isScanId(result.scanId)) return false;
  if (typeof result.domainId !== 'string' || typeof result.url !== 'string') return false;
  if (typeof result.maxPages !== 'number') return false;
  if (!isCrawlableUrl(result.url)) return false;
  const saved: SavedScan = {
    scanId: result.scanId,
    domainId: result.domainId,
    url: result.url,
    maxPages: result.maxPages,
    savedAt: Date.now(),
  };
  write(join(dataDir, SCANS), `${result.scanId}.json`, saved);
  return true;
};

/** The scan `start_scan` saved under this ID in the last 30 minutes, left in place: the `save-scan` hook reads it to spawn the crawl, and the crawl process reads it again for its own arguments. */
export const readScan = (dataDir: string, scanId: string): SavedScan | null => {
  if (!isScanId(scanId)) return null;
  const path = join(dataDir, SCANS, `${scanId}.json`);
  try {
    if (isExpired(path)) {
      rmSync(path, { force: true });
      return null;
    }
    const saved: unknown = JSON.parse(readFileSync(path, 'utf8'));
    if (!isRecord(saved)) return null;
    const { scanId: id, domainId, url, maxPages, savedAt } = saved;
    if (typeof id !== 'string' || typeof domainId !== 'string' || typeof url !== 'string') return null;
    if (typeof maxPages !== 'number' || typeof savedAt !== 'number') return null;
    return { scanId: id, domainId, url, maxPages, savedAt };
  } catch {
    return null;
  }
};

/** The newest scan saved in the last 30 minutes: what the `save-scan` hook spawns the crawl for, right after it has saved it. */
export const newestScan = (dataDir: string): SavedScan | null => {
  for (const path of liveFiles(join(dataDir, SCANS))) {
    let saved: unknown;
    try {
      saved = JSON.parse(readFileSync(path, 'utf8'));
    } catch {
      continue;
    }
    if (!isRecord(saved) || typeof saved.scanId !== 'string') continue;
    const scan = readScan(dataDir, saved.scanId);
    if (scan) return scan;
  }
  return null;
};

/** What a local crawl is doing, or how it ended. One evolving record per scan ID. */
export type ScanProgress =
  | { status: 'running'; pagesVisited: number }
  | { status: 'blocked'; blockedUrl: string }
  | { status: 'failed'; error: string }
  | {
      status: 'done';
      pagesScanned: number;
      cookies: Record<string, unknown>[];
      thirdPartyHosts: string[];
      truncated: boolean;
    };

/**
 * Records how a scan is going, or how it ended. Overwritten as the crawl
 * progresses, so `scan status` always reports the latest line of it.
 */
export const saveScanProgress = (dataDir: string, scanId: string, progress: ScanProgress): boolean => {
  if (!isScanId(scanId)) return false;
  write(join(dataDir, SCAN_PROGRESS), `${scanId}.json`, { scanId, ...progress, savedAt: Date.now() });
  return true;
};

/** What `scan status` reports: the progress or outcome last saved for this scan ID, in the last 30 minutes. */
export const readScanProgress = (
  dataDir: string,
  scanId: string,
): (ScanProgress & { scanId: string; savedAt: number }) | null => {
  if (!isScanId(scanId)) return null;
  const path = join(dataDir, SCAN_PROGRESS, `${scanId}.json`);
  try {
    if (isExpired(path)) {
      rmSync(path, { force: true });
      return null;
    }
    const saved: unknown = JSON.parse(readFileSync(path, 'utf8'));
    if (!isRecord(saved) || typeof saved.status !== 'string' || typeof saved.scanId !== 'string') return null;
    return saved as ScanProgress & { scanId: string; savedAt: number };
  } catch {
    return null;
  }
};
