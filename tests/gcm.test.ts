import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { parseGcmReading } from '../src/gcm.ts';

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
