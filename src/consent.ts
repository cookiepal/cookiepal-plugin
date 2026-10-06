import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Whether the user agreed to share a random install ID, which ePrivacy 5(3)
 * requires before one is stored or sent. The file lives in the plugin's data
 * folder (`${CLAUDE_PLUGIN_DATA}`), so uninstalling the plugin removes it.
 */
export interface ConsentState {
  /** False until the user has answered once, so the question is asked only on the first check. */
  asked: boolean;
  installId: string | null;
}

const FILE = 'install-id.json';
const FORGOTTEN = 'forgotten-install-ids.json';
const INSTALL_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export const readConsent = (dataDir: string): ConsentState => {
  try {
    const saved = JSON.parse(readFileSync(join(dataDir, FILE), 'utf8'));
    const installId = typeof saved.installId === 'string' && INSTALL_ID.test(saved.installId) ? saved.installId : null;
    return { asked: saved.asked === true, installId };
  } catch {
    return { asked: false, installId: null };
  }
};

const save = (dataDir: string, state: ConsentState): ConsentState => {
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(join(dataDir, FILE), `${JSON.stringify(state)}\n`, { mode: 0o600 });
  return state;
};

/** Creates the ID only now, after a yes. Answering yes again keeps the existing ID. */
export const share = (dataDir: string): ConsentState =>
  save(dataDir, { asked: true, installId: readConsent(dataDir).installId ?? randomUUID() });

const readForgotten = (dataDir: string): string[] => {
  try {
    const saved: unknown = JSON.parse(readFileSync(join(dataDir, FORGOTTEN), 'utf8'));
    return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

/**
 * Records that CookiePal erased the checks stored under this ID, written by the
 * PostToolUse hook on `forget_install` and read by `decline`. Kept on this
 * machine only, and it holds an ID the machine already has: the point is that
 * deleting the ID locally stops being possible until the erasure has happened.
 */
export const markForgotten = (dataDir: string, installId: string): boolean => {
  if (!INSTALL_ID.test(installId)) return false;
  const forgotten = readForgotten(dataDir);
  if (!forgotten.includes(installId)) forgotten.push(installId);
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(join(dataDir, FORGOTTEN), `${JSON.stringify(forgotten)}\n`, { mode: 0o600 });
  return true;
};

/**
 * Voids the erasure marker for an ID that is about to be sent again. A marker
 * proves the checks stored *up to then* were erased; every later check stores a
 * new row it says nothing about, so handing the ID out has to retire it, or an
 * erasure from last week would open the gate on everything since.
 */
export const clearForgotten = (dataDir: string, installId: string): void => {
  const forgotten = readForgotten(dataDir).filter((id) => id !== installId);
  try {
    mkdirSync(dataDir, { recursive: true });
    writeFileSync(join(dataDir, FORGOTTEN), `${JSON.stringify(forgotten)}\n`, { mode: 0o600 });
  } catch {}
};

/**
 * A no, or a later withdrawal: the answer is kept so the question is not asked
 * again, and any ID is deleted.
 *
 * Deleting the ID is the one irreversible step here -- it is the only thing that
 * can find the checks stored under it -- so this refuses while an ID is still
 * stored whose checks have not been erased, returning null. That is a real gate
 * rather than a rule written in the skill, in the way `guard-plan` is for query
 * strings: the order holds even when the steps are not followed.
 *
 * `force` is the deliberate way past it, for a user who wants to stop sending
 * the ID when the erasure cannot be run at all. Their checks then expire on the
 * server's own clock, which is what happens without this feature anyway.
 */
export const decline = (dataDir: string, { force = false } = {}): ConsentState | null => {
  const { installId } = readConsent(dataDir);
  if (installId && !force && !readForgotten(dataDir).includes(installId)) return null;
  return save(dataDir, { asked: true, installId: null });
};
