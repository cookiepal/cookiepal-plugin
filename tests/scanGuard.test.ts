import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, test } from 'node:test';
import { saveScanProgress } from '../src/savedPlans.ts';
import { stableStringify, uploadDecision } from '../src/scanGuard.ts';

const dirs: string[] = [];
const freshDir = () => {
  const dir = mkdtempSync(join(tmpdir(), 'cookiepal-scanguard-test-'));
  dirs.push(dir);
  return dir;
};

after(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
});

const scanId = '018f1e2a-0000-7000-8000-000000000002';

const doneResult = {
  status: 'done' as const,
  pagesScanned: 4,
  cookies: [
    { name: '_ga', domain: 'shop.example', category: 'analytics' },
    { name: 'kp_uidz', domain: 'shop.example', category: 'necessary' },
  ],
  thirdPartyHosts: ['example-cdn.test'],
  truncated: false,
};

describe('the upload_scan_report guard', () => {
  const dirWithDone = () => {
    const dir = freshDir();
    saveScanProgress(dir, scanId, doneResult);
    return dir;
  };

  test('allows the exact report scan status produced', () => {
    const dir = dirWithDone();

    assert.equal(
      uploadDecision(dir, {
        scanId,
        pagesScanned: doneResult.pagesScanned,
        cookies: doneResult.cookies,
        thirdPartyHosts: doneResult.thirdPartyHosts,
        truncated: doneResult.truncated,
      }),
      'allow',
    );
  });

  // The model retypes this object into its tool call, so the same report can
  // arrive with its keys, or a cookie's keys, in another order. That is not a forgery.
  test('allows the same report with keys reordered', () => {
    const dir = dirWithDone();
    const reordered = doneResult.cookies.map((c) => ({ category: c.category, name: c.name, domain: c.domain }));

    assert.equal(
      uploadDecision(dir, {
        scanId,
        pagesScanned: doneResult.pagesScanned,
        cookies: reordered,
        thirdPartyHosts: doneResult.thirdPartyHosts,
        truncated: doneResult.truncated,
      }),
      'allow',
    );
  });

  test('denies a report with one cookie changed', () => {
    const dir = dirWithDone();
    const edited = [
      ...doneResult.cookies.slice(0, 1),
      { name: '_fbp', domain: 'shop.example', category: 'advertisement' },
    ];

    assert.equal(
      uploadDecision(dir, {
        scanId,
        pagesScanned: doneResult.pagesScanned,
        cookies: edited,
        thirdPartyHosts: doneResult.thirdPartyHosts,
        truncated: doneResult.truncated,
      }),
      'deny',
    );
  });

  test('denies a different pagesScanned', () => {
    const dir = dirWithDone();

    assert.equal(
      uploadDecision(dir, {
        scanId,
        pagesScanned: 999,
        cookies: doneResult.cookies,
        thirdPartyHosts: doneResult.thirdPartyHosts,
        truncated: doneResult.truncated,
      }),
      'deny',
    );
  });

  test('denies a truncated flag that differs from the scan, or is omitted when the scan was truncated', () => {
    const dir = freshDir();
    saveScanProgress(dir, scanId, { ...doneResult, truncated: true });
    const report = {
      scanId,
      pagesScanned: doneResult.pagesScanned,
      cookies: doneResult.cookies,
      thirdPartyHosts: doneResult.thirdPartyHosts,
    };

    assert.equal(uploadDecision(dir, { ...report, truncated: false }), 'deny');
    assert.equal(uploadDecision(dir, report), 'deny');
    assert.equal(uploadDecision(dir, { ...report, truncated: true }), 'allow');
  });

  test('allows an omitted truncated flag when the scan was not truncated', () => {
    const dir = dirWithDone();

    assert.equal(
      uploadDecision(dir, {
        scanId,
        pagesScanned: doneResult.pagesScanned,
        cookies: doneResult.cookies,
        thirdPartyHosts: doneResult.thirdPartyHosts,
      }),
      'allow',
    );
  });

  test('denies blockedByRobots on a finished, unblocked scan', () => {
    const dir = dirWithDone();

    assert.equal(
      uploadDecision(dir, {
        scanId,
        pagesScanned: doneResult.pagesScanned,
        cookies: doneResult.cookies,
        thirdPartyHosts: doneResult.thirdPartyHosts,
        truncated: doneResult.truncated,
        blockedByRobots: true,
      }),
      'deny',
    );
  });

  test('allows blockedByRobots true for a scan status reported as blocked, and denies false', () => {
    const dir = freshDir();
    saveScanProgress(dir, scanId, { status: 'blocked', blockedUrl: 'https://shop.example/robots.txt' });

    assert.equal(uploadDecision(dir, { scanId, blockedByRobots: true }), 'allow');
    assert.equal(uploadDecision(dir, { scanId, blockedByRobots: false }), 'deny');
  });

  test('denies a scan still running', () => {
    const dir = freshDir();
    saveScanProgress(dir, scanId, { status: 'running', pagesVisited: 2 });

    assert.equal(
      uploadDecision(dir, { scanId, pagesScanned: 2, cookies: [], thirdPartyHosts: [], truncated: false }),
      'deny',
    );
  });

  test('denies anything it cannot check', () => {
    const dir = dirWithDone();

    assert.equal(uploadDecision(null, { scanId, pagesScanned: 4, cookies: [] }), 'deny');
    assert.equal(uploadDecision(dir, { pagesScanned: 4, cookies: [] }), 'deny');
    assert.equal(uploadDecision(dir, { scanId: 'other-scan', pagesScanned: 4, cookies: [] }), 'deny');
    assert.equal(uploadDecision(dir, null), 'deny');
  });
});

describe('stableStringify', () => {
  test('is equal for objects whose keys are reordered', () => {
    assert.equal(stableStringify({ a: 1, b: 2 }), stableStringify({ b: 2, a: 1 }));
  });

  test('is not equal when array element order differs', () => {
    assert.notEqual(stableStringify([1, 2]), stableStringify([2, 1]));
  });

  test('is not equal when a value differs', () => {
    assert.notEqual(stableStringify({ a: 1 }), stableStringify({ a: 2 }));
  });
});
