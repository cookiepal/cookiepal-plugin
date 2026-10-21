/** The plan and result versions this version of the plugin understands. */
export const PLAN_VERSION = 1;
export const RESULT_VERSION = 1;

export const UPDATE_HINT = 'Update the plugin with /plugin marketplace update cookiepal, then restart Claude Code.';

export interface Limits {
  maxCookies: number;
  maxCookieNameLength: number;
  maxCookieDomainLength: number;
  maxCookiePathLength: number;
  maxThirdPartyHosts: number;
  maxHostLength: number;
}

export interface Plan {
  checkId: string;
  country: string | null;
  page: string;
  settleMs: number;
  timeoutMs: number;
  limits: Limits;
}

// A plan tunes the load within these bounds. It cannot turn off the skill's own
// rules (a fresh profile, no values, no links followed), which are not in it.
const MAX_SETTLE_MS = 10_000;
const MAX_TIMEOUT_MS = 60_000;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Parsed = { ok: true; plan: Plan } | { ok: false; error: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const bounded = (value: unknown, max: number): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.min(Math.floor(value), max) : null;

/**
 * Reads the plan `plan_check` returned. An unknown `planVersion` stops the check,
 * since fields this version cannot read might change what the check has to do.
 */
export const parsePlan = (raw: unknown): Parsed => {
  if (!isRecord(raw)) return { ok: false, error: 'The plan from plan_check is missing or not an object.' };
  if (raw.planVersion !== PLAN_VERSION) {
    return {
      ok: false,
      error: `CookiePal sent a check plan (version ${String(raw.planVersion)}) this version of the plugin does not understand. ${UPDATE_HINT}`,
    };
  }

  const { checkId, expiresAt, ranFrom, target, load, limits, submit } = raw;
  if (typeof expiresAt === 'string' && Date.parse(expiresAt) <= Date.now()) {
    return { ok: false, error: 'This check plan has expired. Start the check again.' };
  }
  if (typeof checkId !== 'string' || !UUID.test(checkId)) {
    return { ok: false, error: 'The plan has no valid check ID.' };
  }
  if (!isRecord(submit) || submit.resultVersion !== RESULT_VERSION) {
    return { ok: false, error: `The plan asks for a result version this plugin cannot send. ${UPDATE_HINT}` };
  }
  if (!isRecord(target) || typeof target.page !== 'string') return { ok: false, error: 'The plan has no page.' };
  if (!isRecord(load) || !isRecord(limits)) return { ok: false, error: 'The plan has no load settings or limits.' };

  const settleMs = bounded(load.settleMs, MAX_SETTLE_MS);
  const timeoutMs = bounded(load.timeoutMs, MAX_TIMEOUT_MS);
  if (settleMs === null || timeoutMs === null || timeoutMs === 0) {
    return { ok: false, error: 'The plan has invalid load settings.' };
  }

  const keys = [
    'maxCookies',
    'maxCookieNameLength',
    'maxCookieDomainLength',
    'maxCookiePathLength',
    'maxThirdPartyHosts',
    'maxHostLength',
  ] as const;
  const parsedLimits = {} as Limits;
  for (const key of keys) {
    const value = bounded(limits[key], 10_000);
    if (value === null) return { ok: false, error: `The plan has no valid ${key}.` };
    parsedLimits[key] = value;
  }

  const country = isRecord(ranFrom) && typeof ranFrom.country === 'string' ? ranFrom.country : null;
  return { ok: true, plan: { checkId, country, page: target.page, settleMs, timeoutMs, limits: parsedLimits } };
};
