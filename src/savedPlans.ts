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
 * plan window is ignored and deleted, except the rendered reads: those are the
 * user's own copy, so the newest `KEPT_REPORTS` are kept whatever their age.
 *
 * Every folder is created 0700 and every file 0600, since they hold the pages
 * checked and what was found on them.
 */

const PLANS = 'plans';
const TARGETS = 'targets';
const RESULTS = 'results';
const REPORTS = 'reports';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const MAX_AGE_MS = 30 * 60 * 1000;
/** How many checks' rendered reads are kept. Older ones are deleted on the next sweep. */
export const KEPT_REPORTS = 20;
const PRIVATE_DIR = { recursive: true, mode: 0o700 } as const;

export interface SavedPlan {
  /** The URL Claude sent to `plan_check`. */
  url: string;
  plan: Record<string, unknown>;
  /** `Date.now()` when the hook saved it. */
  savedAt: number;
}

export const isCheckId = (value: unknown): value is string => typeof value === 'string' && UUID.test(value);

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
      if (isExpired(path)) rmSync(path, { force: true });
      else live.push({ path, mtime: statSync(path).mtimeMs });
    } catch {}
  }
  return live.sort((a, b) => b.mtime - a.mtime).map(({ path }) => path);
};

/** Reads a JSON file once: it is deleted whatever it holds. */
const takeJson = (path: string): unknown => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  } finally {
    rmSync(path, { force: true });
  }
};

const write = (dir: string, name: string, value: unknown) => {
  mkdirSync(dir, PRIVATE_DIR);
  liveFiles(dir);
  writeFileSync(join(dir, name), JSON.stringify(value), { mode: 0o600 });
};

const isRef = (value: unknown): value is string => typeof value === 'string' && UUID.test(value);

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

/** The rendered reads past the newest `KEPT_REPORTS`, deleted. Each check has its own folder. */
const trimReports = (dir: string) => {
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return;
  }
  const folders = names.flatMap((name) => {
    try {
      return [{ path: join(dir, name), mtime: statSync(join(dir, name)).mtimeMs }];
    } catch {
      return [];
    }
  });
  folders.sort((a, b) => b.mtime - a.mtime);
  for (const { path } of folders.slice(KEPT_REPORTS)) rmSync(path, { recursive: true, force: true });
};

/** Deletes every saved plan, URL and result past the 30-minute window, and all but the newest reports. */
export const sweep = (dataDir: string): void => {
  liveFiles(join(dataDir, PLANS));
  liveFiles(join(dataDir, TARGETS));
  liveFiles(join(dataDir, RESULTS));
  trimReports(join(dataDir, REPORTS));
};

/**
 * Stores the `submit_check` result from a PostToolUse payload, under the check
 * ID that was submitted, which is the one the skill later asks `assess` for. A
 * response naming a different check is not stored at all.
 */
export const saveResult = (dataDir: string, payload: unknown): boolean => {
  if (!isRecord(payload) || !isRecord(payload.tool_input)) return false;
  const { checkId } = payload.tool_input;
  const result = resultFrom(payload.tool_response);
  if (!result || !isCheckId(checkId)) return false;
  if (result.checkId !== undefined && result.checkId !== checkId) return false;
  write(join(dataDir, RESULTS), `${checkId}.json`, result);
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
 * so what is published or opened is the rendered file, not a copy the model
 * retyped. Every form is written on each run, whichever the user asked for:
 * falling back from one to the next is then only a matter of naming a different
 * path, with nothing to re-render and no second browser run.
 */
export const writeRendered = (dataDir: string, checkId: string, name: string, content: string): string | null => {
  if (!isCheckId(checkId) || !/^[a-z]+\.[a-z]+$/.test(name)) return null;
  const dir = join(dataDir, REPORTS, checkId);
  try {
    mkdirSync(dir, PRIVATE_DIR);
    const path = join(dir, name);
    writeFileSync(path, content, { mode: 0o600 });
    return path;
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

/** The URL `prepare` saved under this ref in the last 30 minutes, deleted as it is read. */
export const takeTarget = (dataDir: string, ref: string): SavedTarget | null => {
  if (!isRef(ref)) return null;
  const path = join(dataDir, TARGETS, `${ref}.json`);
  try {
    if (isExpired(path)) {
      rmSync(path, { force: true });
      return null;
    }
  } catch {
    return null;
  }
  const saved = takeJson(path);
  if (!isRecord(saved) || typeof saved.page !== 'string' || typeof saved.target !== 'string') return null;
  if (typeof saved.savedAt !== 'number') return null;
  return { page: saved.page, target: saved.target, savedAt: saved.savedAt };
};
