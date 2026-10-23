import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, test } from 'node:test';
import { gcmDecision, parseGcmReading } from '../src/gcm.ts';
import { saveGcmReading } from '../src/savedPlans.ts';

describe('parseGcmReading', () => {
  test('reads a well-formed reading', () => {
    const reading = parseGcmReading({
      consentModeFound: true,
      entries: ['ad_storage', 'analytics_storage'],
      entriesMissingDefault: ['analytics_storage'],
      wasSetLate: false,
    });

    assert.deepEqual(reading, {
      consentModeFound: true,
      entries: ['ad_storage', 'analytics_storage'],
      entriesMissingDefault: ['analytics_storage'],
      wasSetLate: false,
    });
  });

  test('reads anything unusable as no consent mode found', () => {
    assert.deepEqual(parseGcmReading(null), {
      consentModeFound: false,
      entries: [],
      entriesMissingDefault: [],
      wasSetLate: false,
    });
    assert.deepEqual(parseGcmReading('not an object'), {
      consentModeFound: false,
      entries: [],
      entriesMissingDefault: [],
      wasSetLate: false,
    });
    assert.deepEqual(parseGcmReading(undefined), {
      consentModeFound: false,
      entries: [],
      entriesMissingDefault: [],
      wasSetLate: false,
    });
  });

  test('drops an entry that is not a plain identifier, so it cannot carry prose', () => {
    const reading = parseGcmReading({
      consentModeFound: true,
      entries: ['ad_storage', '<script>alert(1)</script>', 'a'.repeat(100)],
      entriesMissingDefault: [],
      wasSetLate: false,
    });

    assert.deepEqual(reading.entries, ['ad_storage']);
  });

  test('caps the entry count', () => {
    const many = Array.from({ length: 50 }, (_, i) => `entry_${i}`);
    const reading = parseGcmReading({
      consentModeFound: true,
      entries: many,
      entriesMissingDefault: [],
      wasSetLate: false,
    });

    assert.equal(reading.entries.length, 16);
  });

  test('coerces anything but true to false for the booleans', () => {
    const reading = parseGcmReading({ consentModeFound: 'yes', wasSetLate: 1 });

    assert.equal(reading.consentModeFound, false);
    assert.equal(reading.wasSetLate, false);
  });
});

describe('the check_gcm_status guard', () => {
  const dirs: string[] = [];
  after(() => {
    for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
  });

  /** A data folder holding one local run's reading, as `gcm` saves it. */
  const withRun = () => {
    const dir = mkdtempSync(join(tmpdir(), 'cookiepal-gcm-test-'));
    dirs.push(dir);
    const run = {
      url: 'https://www.shop.example/',
      seenAt: '2026-10-22T10:00:00.000Z',
      reading: { consentModeFound: true, entries: ['ad_storage'], entriesMissingDefault: [], wasSetLate: false },
    };
    saveGcmReading(dir, 'www.shop.example', run);
    return { dir, run };
  };

  test('allows the reading a local run produced, whatever order its keys arrive in', () => {
    const { dir, run } = withRun();
    const reordered = { wasSetLate: false, entriesMissingDefault: [], entries: ['ad_storage'], consentModeFound: true };
    assert.equal(gcmDecision(dir, { domainId: 'shop.example', ...run }), 'allow');
    assert.equal(gcmDecision(dir, { ...run, reading: reordered }), 'allow');
  });

  // The forgery the guard exists for: a reading that says the defaults are set when the run said otherwise.
  test('refuses a reading edited after the run', () => {
    const { dir, run } = withRun();
    assert.equal(gcmDecision(dir, { ...run, reading: { ...run.reading, wasSetLate: true } }), 'deny');
    assert.equal(gcmDecision(dir, { ...run, seenAt: '2026-10-22T10:05:00.000Z' }), 'deny');
  });

  test('refuses a reading for a page no local run read', () => {
    const { dir, run } = withRun();
    assert.equal(gcmDecision(dir, { ...run, url: 'https://other.example/' }), 'deny');
  });

  // The hook itself, as hooks.json runs it: what reaches the server is what this decides.
  test('guard-gcm lets the real reading through and refuses an edited one', () => {
    const { dir, run } = withRun();
    const guard = (input: unknown) =>
      spawnSync(process.execPath, [join(import.meta.dirname, '..', 'dist', 'check.mjs'), 'guard-gcm'], {
        env: { ...process.env, COOKIEPAL_DATA_DIR: dir },
        input: JSON.stringify({ tool_input: input }),
        encoding: 'utf8',
      }).stdout;

    assert.equal(guard(run), '');
    assert.match(
      guard({ ...run, reading: { ...run.reading, entriesMissingDefault: [], wasSetLate: true } }),
      /"permissionDecision":"deny"/,
    );
  });

  test('refuses when there is no data folder or the input is not a reading', () => {
    const { dir } = withRun();
    assert.equal(gcmDecision(null, {}), 'deny');
    assert.equal(gcmDecision(dir, { url: 'not a url' }), 'deny');
    assert.equal(gcmDecision(dir, 'reading'), 'deny');
  });
});
