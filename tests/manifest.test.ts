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
  // The company is named once, in the README's legal footer. Its public site is allowed;
  // any other westpoint host would be an internal one and still fails.
  const PUBLIC_COMPANY_HOSTS = new Set(['westpoint.io', 'www.westpoint.io']);
  const FORBIDDEN = [/staging/i, /execute-api/i, /amazonaws\.com/i];

  test('the only CookiePal hosts named are the public ones', () => {
    for (const { path, text } of files) {
      for (const [, host] of text.matchAll(/https?:\/\/([^/\s"'`)<>]+)/g)) {
        const lower = host.toLowerCase();
        if (lower === 'cookiepal.io' || lower.endsWith('.cookiepal.io')) {
          assert.ok(PUBLIC_HOSTS.has(lower), `${path} names a non-public host: ${host}`);
        }
        if (lower === 'westpoint.io' || lower.endsWith('.westpoint.io')) {
          assert.ok(PUBLIC_COMPANY_HOSTS.has(lower), `${path} names a non-public host: ${host}`);
        }
      }
    }
  });

  test('every hook matcher fires for both forms of the tool name', () => {
    const hooks = JSON.parse(readFileSync(join(root, 'hooks/hooks.json'), 'utf8'));
    const entries = Object.values(hooks.hooks as Record<string, { matcher: string }[]>).flat();
    assert.ok(entries.length > 0, 'hooks.json registers no hooks');

    for (const { matcher } of entries) {
      const tool = matcher.match(/__([a-z_]+)$/)?.[1];
      assert.ok(tool, `matcher names no tool: ${matcher}`);
      const pattern = new RegExp(matcher);

      // Bundled with the plugin, and registered from a project-level .mcp.json.
      for (const name of [`mcp__plugin_cookiepal_cookiepal__${tool}`, `mcp__cookiepal__${tool}`]) {
        assert.match(name, pattern, `${matcher} does not match ${name}`);
      }
      // It must not reach another server's identically named tool.
      assert.doesNotMatch(`mcp__other__${tool}`, pattern, `${matcher} over-matches mcp__other__${tool}`);
    }
  });

  test('no internal hostnames or AWS endpoints', () => {
    for (const { path, text } of files) {
      for (const pattern of FORBIDDEN) {
        assert.doesNotMatch(text, pattern, `${path} matches ${pattern}`);
      }
    }
  });
});
