import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, test } from 'node:test';

const root = join(import.meta.dirname, '..');
const readJson = (path: string) => JSON.parse(readFileSync(join(root, path), 'utf8'));

const SERVER_URL = 'https://mcp.cookiepal.io/mcp';
const REPO = 'westpoint-io/claude-code-plugin';
const SEMVER = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

describe('.mcp.json', () => {
  const { mcpServers, ...rest } = readJson('.mcp.json');

  test('declares exactly one server and nothing else', () => {
    assert.deepEqual(Object.keys(rest), []);
    assert.deepEqual(Object.keys(mcpServers), ['cookiepal']);
  });

  // Anything beyond type and url (headers, env, command, args) is where a credential would go.
  test('the server is the public URL with no credentials', () => {
    assert.deepEqual(mcpServers.cookiepal, { type: 'http', url: SERVER_URL });
  });
});

describe('plugin and marketplace manifests', () => {
  const plugin = readJson('.claude-plugin/plugin.json');
  const marketplace = readJson('.claude-plugin/marketplace.json');

  // The plugin name is the command namespace, so renaming it breaks /cookiepal:check.
  test('plugin is named cookiepal with a semver version', () => {
    assert.equal(plugin.name, 'cookiepal');
    assert.match(plugin.version, SEMVER);
  });

  test('plugin points at this repository', () => {
    assert.equal(plugin.repository, `https://github.com/${REPO}`);
  });

  test('marketplace is named cookiepal and lists this repo as its one plugin', () => {
    assert.equal(marketplace.name, 'cookiepal');
    assert.equal(marketplace.plugins.length, 1);
    assert.equal(marketplace.plugins[0].name, 'cookiepal');
    assert.equal(marketplace.plugins[0].source, './');
  });

  // plugin.json wins over the marketplace entry, so a second version would only drift.
  test('the version lives only in plugin.json', () => {
    assert.equal(marketplace.plugins[0].version, undefined);
  });
});

describe('repository contents', () => {
  const skipDirs = new Set(['.git', 'node_modules']);
  const self = relative(root, import.meta.filename);

  const listFiles = (dir: string): string[] =>
    readdirSync(join(root, dir), { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return skipDirs.has(entry.name) ? [] : listFiles(path);
      return path === self ? [] : [path];
    });

  const files = listFiles('.').map((path) => ({ path, text: readFileSync(join(root, path), 'utf8') }));

  const PUBLIC_HOSTS = new Set(['cookiepal.io', 'www.cookiepal.io', 'mcp.cookiepal.io']);
  const FORBIDDEN = [/staging/i, /execute-api/i, /amazonaws\.com/i, /westpoint/i];

  test('the only CookiePal hosts named are the public ones', () => {
    for (const { path, text } of files) {
      for (const [, host] of text.matchAll(/https?:\/\/([^/\s"'`)<>]+)/g)) {
        const lower = host.toLowerCase();
        if (lower === 'cookiepal.io' || lower.endsWith('.cookiepal.io')) {
          assert.ok(PUBLIC_HOSTS.has(lower), `${path} names a non-public host: ${host}`);
        }
      }
    }
  });

  // The repository's own path is the one company name allowed, since it is in every install command.
  test('no internal hostnames, AWS endpoints or company names', () => {
    for (const { path, text } of files) {
      const withoutRepo = text.replaceAll(REPO, '');
      for (const pattern of FORBIDDEN) {
        assert.doesNotMatch(withoutRepo, pattern, `${path} matches ${pattern}`);
      }
    }
  });
});
