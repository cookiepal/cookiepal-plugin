import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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
 * How many clean `forget_install` runs it takes before the ID may be deleted.
 * The server finds checks through an index that is eventually consistent, so a
 * check stored seconds before stop-sharing can be missing from the first run,
 * which then truthfully reports nothing remaining. The second run comes a turn
 * later, after the index has caught up, and deletes it. One run is not enough
 * because deleting the ID is what would strand that check for good.
 */
const ERASURES_NEEDED = 2;

/** Clean erasures per install ID. A list from an older version counts each ID as one. */
const readForgotten = (dataDir: string): Record<string, number> => {
  try {
    const saved: unknown = JSON.parse(readFileSync(join(dataDir, FORGOTTEN), 'utf8'));
    if (Array.isArray(saved)) {
      return Object.fromEntries(saved.filter((id): id is string => typeof id === 'string').map((id) => [id, 1]));
    }
    if (!saved || typeof saved !== 'object') return {};
    return Object.fromEntries(
      Object.entries(saved).filter((entry): entry is [string, number] => Number.isInteger(entry[1])),
    );
  } catch {
    return {};
  }
};

const writeForgotten = (dataDir: string, forgotten: Record<string, number>): void => {
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(join(dataDir, FORGOTTEN), `${JSON.stringify(forgotten)}\n`, { mode: 0o600 });
};

/**
 * Records that CookiePal erased the checks stored under this ID, written by the
 * PostToolUse hook on `forget_install` and read by `decline`, which needs
 * `ERASURES_NEEDED` of them. Kept on this machine only, and it holds an ID the
 * machine already has: the point is that deleting the ID locally stops being
 * possible until the erasure has happened.
 */
export const markForgotten = (dataDir: string, installId: string): boolean => {
  if (!INSTALL_ID.test(installId)) return false;
  const forgotten = readForgotten(dataDir);
  forgotten[installId] = (forgotten[installId] ?? 0) + 1;
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
 * still stored whose checks have not been erased twice (see `ERASURES_NEEDED`),
 * returning null. That is a real gate rather than a rule written in the skill,
 * in the way `guard-plan` is for query strings: the order holds even when the
 * steps are not followed. Refused or not, the ID is never sent again: a
 * withdrawal takes effect now, and the ID is kept only to finish the erasure.
 *
 * `force` is the deliberate way past it, for a user who wants to stop sending
 * the ID when the erasure cannot be run at all. Their checks then expire on the
 * server's own clock, which is what happens without this feature anyway.
 */
export const decline = (dataDir: string, { force = false } = {}): ConsentState | null => {
  const { installId } = readConsent(dataDir);
  if (installId && !force && (readForgotten(dataDir)[installId] ?? 0) < ERASURES_NEEDED) {
    save(dataDir, { asked: true, installId, sharing: false });
    return null;
  }
  // The link answer and the erasure record name the ID too, and it is gone from
  // this machine only once every copy is.
  rmSync(join(dataDir, LINK_ANSWER), { force: true });
  if (installId) clearForgotten(dataDir, installId);
  return save(dataDir, { asked: true, installId: null, sharing: false });
};

const LINK_ANSWER = 'link-answer.json';

/**
 * How long an answer to the link question stands: long enough to sign in, or
 * create an account, in the browser and come back, short enough that it is the
 * answer to this connect and not one from weeks ago.
 */
export const LINK_ANSWER_TTL_MS = 30 * 60_000;

/** The user's answer to linking this install ID to the account they connect. */
export interface LinkAnswer {
  installId: string;
  link: boolean;
  at: number;
}

/**
 * Records the answer to the link question, a separate question from sharing
 * the ID: agreeing to send it with checks is not agreeing to tie it to an
 * account. Read by the PreToolUse hook on `connect_account`, so the ID goes
 * with a link answer only when this machine has one from the user. Null when
 * no ID is stored, since there is then nothing to link.
 */
export const recordLinkAnswer = (dataDir: string, link: boolean, now = Date.now()): LinkAnswer | null => {
  const { installId } = readConsent(dataDir);
  if (!installId) return null;
  // A yes is about to put server state under the ID again, as `prepare` does,
  // so an erasure recorded before it no longer covers everything stored.
  if (link) clearForgotten(dataDir, installId);
  const answer = { installId, link, at: now };
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(join(dataDir, LINK_ANSWER), `${JSON.stringify(answer)}\n`, { mode: 0o600 });
  return answer;
};

/** The answer, if one was given for a well-formed ID within the last half hour; otherwise null. */
export const readLinkAnswer = (dataDir: string, now = Date.now()): LinkAnswer | null => {
  try {
    const saved = JSON.parse(readFileSync(join(dataDir, LINK_ANSWER), 'utf8'));
    if (typeof saved.installId !== 'string' || !INSTALL_ID.test(saved.installId)) return null;
    if (typeof saved.link !== 'boolean' || typeof saved.at !== 'number') return null;
    if (saved.at > now || now - saved.at > LINK_ANSWER_TTL_MS) return null;
    return { installId: saved.installId, link: saved.link, at: saved.at };
  } catch {
    return null;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * What the PreToolUse hook on connect_account decides. The install ID goes
 * only as the stored ID, with the link answer this machine recorded for it in
 * the last half hour, so a yes to sharing can never be sent as a yes to
 * linking. Claude records that answer, though, so a yes is also put to the
 * user by Claude Code itself (`ask`): only they can approve the link. A no
 * removes a link and needs nothing more; a call with no install ID links
 * nothing and passes.
 */
export const connectDecision = (dataDir: string | null, input: unknown, now = Date.now()): 'allow' | 'ask' | 'deny' => {
  if (!isRecord(input) || input.installId === undefined) return 'allow';
  if (!dataDir || typeof input.installId !== 'string' || typeof input.linkInstall !== 'boolean') return 'deny';
  const answer = readLinkAnswer(dataDir, now);
  if (answer === null || answer.installId !== input.installId || answer.link !== input.linkInstall) return 'deny';
  return input.linkInstall ? 'ask' : 'allow';
};
