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
  /**
   * Whether the ID goes out with checks. False after a no, and after a stop-sharing
   * whose erasure has not finished: the ID is then kept only so the erasure can
   * be run again, and is never sent.
   */
  sharing: boolean;
}

const FILE = 'install-id.json';
const FORGOTTEN = 'forgotten-install-ids.json';
const INSTALL_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export const readConsent = (dataDir: string): ConsentState => {
  try {
    const saved = JSON.parse(readFileSync(join(dataDir, FILE), 'utf8'));
    const installId = typeof saved.installId === 'string' && INSTALL_ID.test(saved.installId) ? saved.installId : null;
    // A file from before `sharing` existed shares whatever ID it holds.
    return { asked: saved.asked === true, installId, sharing: installId !== null && saved.sharing !== false };
  } catch {
    return { asked: false, installId: null, sharing: false };
  }
};

const save = (dataDir: string, state: ConsentState): ConsentState => {
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(join(dataDir, FILE), `${JSON.stringify(state)}\n`, { mode: 0o600 });
  return state;
};

/** Creates the ID only now, after a yes. Answering yes again keeps the existing ID. */
export const share = (dataDir: string): ConsentState =>
  save(dataDir, { asked: true, installId: readConsent(dataDir).installId ?? randomUUID(), sharing: true });

/**
 * How far apart two clean `forget_install` runs must be before the ID may be
 * deleted. The server finds checks through an index that is eventually
 * consistent, so a check stored seconds before stop-sharing can be missing from
 * the first run, which then truthfully reports nothing remaining. A second run
 * deletes it, but only once the index has caught up: two runs made at the same
 * moment prove no more than one. Deleting the ID is what would strand that
 * check for good, so the gap is enforced here rather than asked of the skill.
 */
export const ERASURE_GAP_MS = 5_000;

/** When each clean erasure of each install ID was recorded, oldest first. */
const readForgotten = (dataDir: string): Record<string, number[]> => {
  try {
    const saved: unknown = JSON.parse(readFileSync(join(dataDir, FORGOTTEN), 'utf8'));
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
    return Object.fromEntries(
      Object.entries(saved).filter(
        (entry): entry is [string, number[]] =>
          Array.isArray(entry[1]) && entry[1].every((time) => Number.isFinite(time)),
      ),
    );
  } catch {
    return {};
  }
};

/** Two clean erasures, the later at least `ERASURE_GAP_MS` after the first. */
const erasedTwice = (times: number[] = []) =>
  times.length >= 2 && Math.max(...times) - Math.min(...times) >= ERASURE_GAP_MS;

const writeForgotten = (dataDir: string, forgotten: Record<string, number[]>): void => {
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(join(dataDir, FORGOTTEN), `${JSON.stringify(forgotten)}\n`, { mode: 0o600 });
};

/**
 * Records that CookiePal erased the checks stored under this ID, written by the
 * PostToolUse hook on `forget_install` and read by `decline`, which needs two
 * of them `ERASURE_GAP_MS` apart. Kept on this machine only, and it holds an ID the
 * machine already has: the point is that deleting the ID locally stops being
 * possible until the erasure has happened.
 */
export const markForgotten = (dataDir: string, installId: string, now = Date.now()): boolean => {
  if (!INSTALL_ID.test(installId)) return false;
  const forgotten = readForgotten(dataDir);
  forgotten[installId] = [...(forgotten[installId] ?? []), now];
  writeForgotten(dataDir, forgotten);
  return true;
};

/**
 * Voids the erasure marker for an ID that is about to be sent again. A marker
 * proves the checks stored *up to then* were erased; every later check stores a
 * new row it says nothing about, so handing the ID out has to retire it, or an
 * erasure from last week would open the gate on everything since.
 */
export const clearForgotten = (dataDir: string, installId: string): void => {
  const { [installId]: _retired, ...forgotten } = readForgotten(dataDir);
  try {
    writeForgotten(dataDir, forgotten);
  } catch {}
};

/**
 * A no, or a later withdrawal: the answer is kept so the question is not asked
 * again, the ID stops being sent at once, and the ID is deleted.
 *
 * Deleting the ID is the one irreversible step here -- it is the only thing that
 * can find the checks stored under it -- so that part refuses while an ID is
 * still stored whose checks have not been erased twice (see `ERASURE_GAP_MS`),
 * returning null. That is a real gate rather than a rule written in the skill,
 * in the way `guard-plan` is for query strings: the order holds even when the
 * steps are not followed. Refused or not, the ID is never sent again: a
 * withdrawal takes effect now, and the ID is kept only to finish the erasure.
 *
 * `force` is the deliberate way past it, for a user who wants the ID gone from
 * this machine even though the erasure cannot be run. Sending has already
 * stopped by then, so all it changes is that the stored checks become
 * unreachable: they expire on the server's own clock instead.
 */
export const decline = (dataDir: string, { force = false } = {}): ConsentState | null => {
  const { installId } = readConsent(dataDir);
  if (installId && !force && !erasedTwice(readForgotten(dataDir)[installId])) {
    save(dataDir, { asked: true, installId, sharing: false });
    return null;
  }
  // The erasure record names the ID too, so it goes with it.
  if (installId) clearForgotten(dataDir, installId);
  return save(dataDir, { asked: true, installId: null, sharing: false });
};
