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
const planFrom = (response: unknown): Record<string, unknown> | null => {
  if (typeof response === 'string') return planFrom(parseJson(response));
  if (Array.isArray(response)) {
    const text = response.find((block) => isRecord(block) && block.type === 'text');
    return isRecord(text) ? planFrom(parseJson(text.text)) : null;
  }
  if (!isRecord(response)) return null;
  if (isRecord(response.structuredContent)) return response.structuredContent;
  if (Array.isArray(response.content)) return planFrom(response.content);
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
  mkdirSync(dir, { recursive: true });
  liveFiles(dir);
  writeFileSync(join(dir, name), JSON.stringify(value), { mode: 0o600 });
};

const isRef = (value: unknown): value is string => typeof value === 'string' && UUID.test(value);

/** Stores the plan from a PostToolUse payload. Anything that is not a plan is ignored. */
export const savePlan = (dataDir: string, payload: unknown): boolean => {
  if (!isRecord(payload) || !isRecord(payload.tool_input)) return false;
  const { url } = payload.tool_input;
  const plan = planFrom(payload.tool_response);
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
};

/** Stores the `submit_check` result from a PostToolUse payload, under its own check ID. */
export const saveResult = (dataDir: string, payload: unknown): boolean => {
  if (!isRecord(payload)) return false;
  const result = planFrom(payload.tool_response);
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
