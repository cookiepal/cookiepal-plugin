/**
 * The decision behind the PreToolUse hook on `upload_scan_report`. Fails
 * closed: a report that does not match what `scan status` actually produced
 * for that scan ID is refused before anything is sent — the same posture
 * `install.ts`'s `verifyDecision` takes toward a fabricated install reading.
 */

import { readScanProgress } from './savedPlans.ts';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const UPLOAD_GUARD_REASON =
  'upload_scan_report takes only the result scan status reported for this scan ID. Call scan status for ' +
  'the scanId, and send its pagesScanned, cookies, thirdPartyHosts and truncated unchanged; send ' +
  'blockedByRobots only when scan status reported the scan as blocked.';

/**
 * Compares two values the way the model actually retypes them into a tool
 * call: equal regardless of a nested object's key order, since the same
 * reading can arrive with its keys in another order, but equal only in the
 * same element order for an array — this is a list the model passes through,
 * not a set it is free to reshuffle.
 */
export const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
};

/**
 * Refuses an `upload_scan_report` call whose report does not match what
 * `scan status` actually produced for that scan ID, so the model cannot
 * fabricate a crawl result.
 */
export const uploadDecision = (dir: string | null, input: unknown): 'allow' | 'deny' => {
  if (!dir || !isRecord(input) || typeof input.scanId !== 'string') return 'deny';
  const progress = readScanProgress(dir, input.scanId);
  if (!progress) return 'deny';

  if (progress.status === 'blocked') return input.blockedByRobots === true ? 'allow' : 'deny';
  if (progress.status !== 'done') return 'deny';
  if (input.blockedByRobots === true) return 'deny';
  if (input.pagesScanned !== progress.pagesScanned) return 'deny';
  if (stableStringify(input.cookies) !== stableStringify(progress.cookies)) return 'deny';
  if (stableStringify(input.thirdPartyHosts ?? []) !== stableStringify(progress.thirdPartyHosts)) return 'deny';
  if ((input.truncated ?? false) !== progress.truncated) return 'deny';
  return 'allow';
};
