import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, test } from 'node:test';
import { newestScan, readScan, readScanProgress, saveScan, saveScanProgress } from '../src/savedPlans.ts';

const dirs: string[] = [];
const freshDir = () => {
  const dir = mkdtempSync(join(tmpdir(), 'cookiepal-scan-test-'));
  dirs.push(dir);
  return dir;
};

after(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
});

const scanPayload = (overrides: Record<string, unknown> = {}) => ({
  tool_input: {},
  tool_response: {
    structuredContent: {
      scanId: '018f1e2a-0000-7000-8000-000000000000',
      domainId: 'shop.example',
      url: 'https://shop.example',
      maxPages: 10,
      pagesRemainingThisMonth: 10,
      scanLimit: 4000,
      localScan: true,
      nextStep: 'Run the local crawl now.',
      ...overrides,
    },
  },
});

describe('the scan the hook saves', () => {
  test('stores the domain, url and maxPages the server returned', () => {
    const dir = freshDir();
    assert.equal(saveScan(dir, scanPayload()), true);
    const saved = readScan(dir, '018f1e2a-0000-7000-8000-000000000000');
    assert.equal(saved?.domainId, 'shop.example');
    assert.equal(saved?.url, 'https://shop.example');
    assert.equal(saved?.maxPages, 10);
  });

  test('ignores a response that is not a scan', () => {
    const dir = freshDir();
    assert.equal(saveScan(dir, { tool_response: { structuredContent: { ok: true } } }), false);
    assert.equal(readScan(dir, '018f1e2a-0000-7000-8000-000000000000'), null);
  });

  test('refuses a start URL the hook would crawl without anyone seeing it: non-http, loopback, link-local, private', () => {
    for (const url of [
      'file:///etc/passwd',
      'ftp://shop.example',
      'not a url',
      'http://localhost:8080/',
      'http://127.0.0.1/',
      'http://169.254.169.254/latest/meta-data',
      'http://10.0.0.5/',
      'http://172.16.0.1/',
      'http://192.168.1.1/',
      'http://0.0.0.0/',
      'http://[::1]/',
      'http://printer.local/',
      'http://localhost./',
      'http://foo.local./',
      'http://[::127.0.0.1]/',
      'http://[::ffff:127.0.0.1]/',
      'http://[fd00::1]/',
    ]) {
      const dir = freshDir();
      assert.equal(saveScan(dir, scanPayload({ url })), false, url);
      assert.equal(readScan(dir, '018f1e2a-0000-7000-8000-000000000000'), null, url);
    }
  });

  test('accepts an http or https public host', () => {
    for (const url of ['https://shop.example/', 'http://shop.example', 'https://8.8.8.8/', 'http://172.32.0.1/']) {
      assert.equal(saveScan(freshDir(), scanPayload({ url })), true, url);
    }
  });

  test('a scan and its progress read as null once past the 30-minute window', () => {
    const dir = freshDir();
    const id = '018f1e2a-0000-7000-8000-000000000000';
    saveScan(dir, scanPayload());
    saveScanProgress(dir, id, { status: 'running', pagesVisited: 1 });
    assert.ok(readScan(dir, id));
    assert.ok(readScanProgress(dir, id));

    const old = new Date(Date.now() - 31 * 60 * 1000);
    utimesSync(join(dir, 'scans', `${id}.json`), old, old);
    utimesSync(join(dir, 'scan-progress', `${id}.json`), old, old);

    assert.equal(newestScan(dir), null);
    assert.equal(readScan(dir, id), null);
    assert.equal(readScanProgress(dir, id), null);
  });

  test('newestScan finds the scan just saved', () => {
    const dir = freshDir();
    saveScan(dir, scanPayload());
    const scan = newestScan(dir);
    assert.equal(scan?.scanId, '018f1e2a-0000-7000-8000-000000000000');
  });

  test('readScan refuses anything that is not a scan ID', () => {
    const dir = freshDir();
    assert.equal(readScan(dir, 'not-a-scan-id'), null);
    assert.equal(readScan(dir, '../etc/passwd'), null);
  });
});

describe('scan progress, which scan status reports', () => {
  const scanId = '018f1e2a-0000-7000-8000-000000000001';

  test('a running scan reports pages visited so far', () => {
    const dir = freshDir();
    saveScanProgress(dir, scanId, { status: 'running', pagesVisited: 3 });
    const progress = readScanProgress(dir, scanId);
    assert.equal(progress?.status, 'running');
    assert.equal((progress as { pagesVisited: number }).pagesVisited, 3);
  });

  test('a finished scan reports the result unchanged', () => {
    const dir = freshDir();
    const done = {
      status: 'done' as const,
      pagesScanned: 4,
      cookies: [{ name: '_ga', domain: 'shop.example', category: 'analytics' }],
      thirdPartyHosts: [],
      truncated: false,
    };
    saveScanProgress(dir, scanId, done);
    const progress = readScanProgress(dir, scanId);
    assert.equal(progress?.status, 'done');
    if (progress?.status !== 'done') throw new Error('expected a done scan');
    assert.deepEqual(progress.cookies, done.cookies);
    assert.equal(progress.pagesScanned, 4);
  });

  test('a scan blocked by robots.txt reports the blocked URL, and no cookies', () => {
    const dir = freshDir();
    saveScanProgress(dir, scanId, { status: 'blocked', blockedUrl: 'https://shop.example/robots.txt' });
    const progress = readScanProgress(dir, scanId);
    assert.equal(progress?.status, 'blocked');
    assert.equal((progress as { blockedUrl: string }).blockedUrl, 'https://shop.example/robots.txt');
  });

  test('overwrites the previous progress as the crawl goes', () => {
    const dir = freshDir();
    saveScanProgress(dir, scanId, { status: 'running', pagesVisited: 1 });
    saveScanProgress(dir, scanId, { status: 'running', pagesVisited: 2 });
    const progress = readScanProgress(dir, scanId);
    assert.equal((progress as { pagesVisited: number }).pagesVisited, 2);
  });

  test('nothing saved for an ID reads as null', () => {
    const dir = freshDir();
    assert.equal(readScanProgress(dir, '018f1e2a-0000-7000-8000-00000000ffff'), null);
  });
});
