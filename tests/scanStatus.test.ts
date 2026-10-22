import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, test } from 'node:test';
import { saveScanProgress } from '../src/savedPlans.ts';

const CLI = join(import.meta.dirname, '..', 'dist', 'check.mjs');
const dataDir = mkdtempSync(join(tmpdir(), 'cookiepal-scan-status-test-'));

after(() => rmSync(dataDir, { recursive: true, force: true }));

const scanStatus = (scanId: string) => {
  const { stdout } = spawnSync(process.execPath, [CLI, 'scan', 'status', scanId], {
    env: { ...process.env, COOKIEPAL_DATA_DIR: dataDir },
    encoding: 'utf8',
  });
  return JSON.parse(stdout) as { status?: string; message?: string };
};

describe('scan status for a scan robots.txt blocked', () => {
  // The engine reads robots.txt's `*` group. There is no CookiePal agent to allow, and
  // start_scan takes no start page, so the only advice the user can follow is about `*`.
  test('says what to change in robots.txt, and only what can be changed', () => {
    const scanId = '018f1e2a-0000-7000-8000-000000000001';
    saveScanProgress(dataDir, scanId, { status: 'blocked', blockedUrl: 'https://shop.example/' });

    const { status, message } = scanStatus(scanId);
    assert.equal(status, 'blocked');
    assert.match(message ?? '', /User-agent: \*/);
    assert.doesNotMatch(message ?? '', /CookiePal's local crawler|scan from a page/);
  });
});
