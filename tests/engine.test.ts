import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, test } from 'node:test';
import { CheckError } from '../src/browser.ts';
import { ENGINE_VERSION, engineDir, ensureEngine } from '../src/engine.ts';

const dirs: string[] = [];
const freshDir = () => {
  const dir = mkdtempSync(join(tmpdir(), 'cookiepal-engine-test-'));
  dirs.push(dir);
  return dir;
};

after(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
});

/** A real installed-looking copy, so `ensureEngine` can see the pinned version is already there. */
const fakeInstall = (dataDir: string, version: string) => {
  const pkgDir = join(engineDir(dataDir), 'node_modules', '@cookiepal-oss', 'cli');
  mkdirSync(pkgDir, { recursive: true });
  writeFileSync(join(pkgDir, 'package.json'), JSON.stringify({ name: '@cookiepal-oss/cli', version }));
};

describe('ensureEngine', () => {
  // With PATH emptied, `npm` cannot be found, so any attempt to install fails
  // with a CheckError. That tells "skipped the install" from "tried to install"
  // without reaching the registry or mocking `spawnSync`.
  const withoutNpm = (fn: () => void) => {
    const path = process.env.PATH;
    process.env.PATH = '';
    try {
      fn();
    } finally {
      if (path === undefined) delete process.env.PATH;
      else process.env.PATH = path;
    }
  };

  test('does not install when the pinned version is already there', () => {
    const dir = freshDir();
    fakeInstall(dir, ENGINE_VERSION);

    withoutNpm(() => ensureEngine(dir));
  });

  test('tries to install when a different version is there, and says so plainly when npm is missing', () => {
    const dir = freshDir();
    fakeInstall(dir, '0.0.1');

    withoutNpm(() =>
      assert.throws(
        () => ensureEngine(dir),
        (error) => error instanceof CheckError && /npm/.test(error.message),
      ),
    );
  });

  test('tries to install when nothing is there', () => {
    const dir = freshDir();

    withoutNpm(() => assert.throws(() => ensureEngine(dir), CheckError));
  });

  test('engineDir is the plugin data folder plus "engine", namespacing it from everything else stored there', () => {
    const dir = freshDir();
    assert.equal(engineDir(dir), join(dir, 'engine'));
  });
});
