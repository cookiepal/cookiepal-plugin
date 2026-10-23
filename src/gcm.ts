/**
 * Reading Google Consent Mode on a page, for `check_gcm_status`.
 *
 * This decides nothing: the server judges the reading, the same posture
 * `install.ts` takes toward the banner tag. What this returns is page content —
 * untrusted text that goes to the server as evidence and is never acted on here.
 */

import { GCM_READING_EXPRESSION } from '@cookiepal-oss/integrations';
import { readGcmReading } from './savedPlans.ts';
import { stableStringify } from './scanGuard.ts';

export { GCM_READING_EXPRESSION };

const MAX_ENTRIES = 16;
const MAX_ENTRY_LENGTH = 64;
const IDENTIFIER = /^[A-Za-z0-9_]+$/;

export interface GcmReading {
  consentModeFound: boolean;
  entries: string[];
  entriesMissingDefault: string[];
  wasSetLate: boolean;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Every entry held to a plain identifier, so a page cannot carry prose into this field. */
const entriesOf = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (entry): entry is string =>
        typeof entry === 'string' && entry.length <= MAX_ENTRY_LENGTH && IDENTIFIER.test(entry),
    )
    .slice(0, MAX_ENTRIES);
};

/**
 * Reads what the page returned from evaluating `GCM_READING_EXPRESSION`,
 * holding it to the shape the server's schema accepts. A page that returns
 * anything else reads as no consent mode found, because a page can return
 * whatever it likes — this never throws and never reports a reading it did
 * not actually get.
 */
export const parseGcmReading = (value: unknown): GcmReading => {
  if (!isRecord(value)) return { consentModeFound: false, entries: [], entriesMissingDefault: [], wasSetLate: false };

  return {
    consentModeFound: value.consentModeFound === true,
    entries: entriesOf(value.entries),
    entriesMissingDefault: entriesOf(value.entriesMissingDefault),
    wasSetLate: value.wasSetLate === true,
  };
};

/**
 * Refuses a `check_gcm_status` call whose `url`, `seenAt` and `reading` are not
 * what a local `gcm` run produced, since the verdict sets the domain's Consent
 * Mode status in CookiePal. The same posture `verifyDecision` takes toward an
 * install reading: fails closed, and a reading assembled by hand is refused.
 */
export const gcmDecision = (dir: string | null, input: unknown): 'allow' | 'deny' => {
  if (!dir || !isRecord(input) || typeof input.url !== 'string') return 'deny';
  let host: string;
  try {
    host = new URL(input.url).hostname;
  } catch {
    return 'deny';
  }

  const saved = readGcmReading(dir, host);
  if (!saved) return 'deny';
  const fields = ['url', 'seenAt', 'reading'] as const;
  return fields.every((field) => stableStringify(input[field]) === stableStringify(saved[field])) ? 'allow' : 'deny';
};
