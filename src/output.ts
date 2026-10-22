import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Where the user wants the risk read: in the terminal, or also as a published
 * artifact. Kept in the plugin's data folder (`${CLAUDE_PLUGIN_DATA}`), so it
 * survives between checks and goes when the plugin is uninstalled.
 *
 * Every form is rendered and written on every run, so this only decides which
 * one is offered first. A check never fails because one was unavailable: not
 * every session can publish an artifact (it needs a signed-in claude.ai
 * account, and it is off in CI and the Agent SDK), so the skill moves down
 * `fallbacksFor` until something works. `terminal` always does.
 *
 * `asked` is false until the user has answered once. Publishing sends the
 * checked page, every cookie name and every third-party host to claude.ai, and
 * the page may be an internal or localhost one, so the skill asks before the
 * first publish rather than after — the same way it asks before creating the
 * install ID. Everything below that first step stays on this machine.
 */
export type OutputMode = 'artifact' | 'html' | 'markdown' | 'terminal';

/**
 * In fallback order. A session that cannot publish an artifact can still open a
 * local page; one that cannot open a browser still has the `.md` file; and the
 * terminal read is in the tool's own result, so it can never be unavailable.
 */
export const OUTPUT_MODES: OutputMode[] = ['artifact', 'html', 'markdown', 'terminal'];

/** What to try after `mode`, if `mode` turns out not to be available. */
export const fallbacksFor = (mode: OutputMode): OutputMode[] => OUTPUT_MODES.slice(OUTPUT_MODES.indexOf(mode) + 1);

const FILE = 'output.json';

/** Publishing the page is the preferred form, once the user has agreed to it once. */
export const DEFAULT_MODE: OutputMode = 'artifact';

export interface OutputState {
  mode: OutputMode;
  /** False until the user has answered once, so the question is asked only before the first publish. */
  asked: boolean;
}

const isMode = (value: unknown): value is OutputMode =>
  typeof value === 'string' && (OUTPUT_MODES as string[]).includes(value);

export const readOutput = (dataDir: string): OutputState => {
  try {
    const saved = JSON.parse(readFileSync(join(dataDir, FILE), 'utf8'));
    return { mode: isMode(saved?.mode) ? saved.mode : DEFAULT_MODE, asked: saved?.asked === true };
  } catch {
    return { mode: DEFAULT_MODE, asked: false };
  }
};

export const setOutput = (dataDir: string, mode: string): OutputState | null => {
  if (!isMode(mode)) return null;
  const state: OutputState = { mode, asked: true };
  mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  writeFileSync(join(dataDir, FILE), `${JSON.stringify(state)}\n`, { mode: 0o600 });
  return state;
};
