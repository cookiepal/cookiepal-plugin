import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
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

  // The plugin name is the command namespace, so renaming it breaks /cookiepal:check-one-page.
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

describe('the skills are the commands', () => {
  const skills = readdirSync(join(root, 'skills'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const frontmatters = new Map(
    skills.map((skill) => {
      const text = readFileSync(join(root, 'skills', skill, 'SKILL.md'), 'utf8');
      return [skill, text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)?.[1] ?? ''];
    }),
  );
  const field = (skill: string, key: string) =>
    frontmatters.get(skill)?.match(new RegExp(`^${key}: (.*?)\\r?$`, 'm'))?.[1];

  // A command file with a skill's name stands in for the skill: asking for the
  // skill then returns "already loaded above" and its SKILL.md never loads.
  test('no command file has the name of a skill', () => {
    const commands = existsSync(join(root, 'commands')) ? readdirSync(join(root, 'commands')) : [];
    for (const file of commands) {
      const name = file.replace(/\.md$/, '');
      assert.ok(!skills.includes(name), `commands/${file} hides skills/${name}`);
    }
  });

  // The name is the /cookiepal:<name> command, so changing it renames the command.
  test('every skill is named after its folder', () => {
    for (const skill of skills) assert.equal(field(skill, 'name'), skill);
  });

  test('every skill that takes an argument has an argument-hint', () => {
    for (const skill of [
      'check-one-page',
      'check-gcm',
      'install-banner',
      'run-scan',
      'verify-installation',
      'match-site-design',
    ]) {
      assert.ok(field(skill, 'argument-hint'), `skills/${skill}/SKILL.md has no argument-hint`);
    }
  });

  // Unquoted, `[domain]` is a YAML list, not the hint shown after the command.
  test('every argument-hint is quoted', () => {
    for (const skill of skills) {
      const hint = field(skill, 'argument-hint');
      if (hint === undefined) continue;
      assert.match(hint, /^(?:'(?:[^']|'')+'|"[^"]+")$/, `skills/${skill}/SKILL.md`);
    }
  });
});

describe('the logo', () => {
  const inlined = readFileSync(join(root, 'src/report.ts'), 'utf8');
  const flat = (svg: string) => svg.replace(/\s*\n\s*/g, '');

  // The page cannot load an external image, so the lockups are inlined. These
  // assertions are what stops the inline copies and the files the README shows
  // from drifting apart the next time the brand mark changes.
  for (const [file, cls] of [
    ['assets/logo.svg', 'logo-light'],
    ['assets/logo-dark.svg', 'logo-dark'],
  ]) {
    test(`${file} is the lockup inlined as .${cls}`, () => {
      const asset = flat(readFileSync(join(root, file), 'utf8'));
      const body = asset.slice(asset.indexOf('>') + 1);
      assert.ok(inlined.includes(`class="logo ${cls}"`), `${cls} must be inlined`);
      for (const tag of body.match(/<(path|circle|rect)[^>]*>/g) ?? []) {
        assert.ok(inlined.includes(tag), `${file}: ${tag.slice(0, 60)}… is missing from src/report.ts`);
      }
    });
  }
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
  // The company is named in exactly two ways: the repository it is published from,
  // and the README's legal footer. Anything else naming it, an internal host, a
  // person's address or a ticket tracker, still fails.
  const PUBLIC_COMPANY_NAMES = [new RegExp(REPO, 'g'), /\[Westpoint\]\(https:\/\/westpoint\.io\)/g];

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

  test('every hook matcher fires for both forms of the tool name', () => {
    const hooks = JSON.parse(readFileSync(join(root, 'hooks/hooks.json'), 'utf8'));
    const entries = Object.values(hooks.hooks as Record<string, { matcher: string }[]>).flat();
    assert.ok(entries.length > 0, 'hooks.json registers no hooks');

    for (const { matcher } of entries) {
      const tool = matcher.match(/__([a-z_]+)\$$/)?.[1];
      assert.ok(matcher.startsWith('^') && matcher.endsWith('$'), `${matcher} must be anchored`);
      assert.ok(tool, `matcher names no tool: ${matcher}`);
      const pattern = new RegExp(matcher);

      // Bundled with the plugin, and registered from a project-level .mcp.json.
      for (const name of [`mcp__plugin_cookiepal_cookiepal__${tool}`, `mcp__cookiepal__${tool}`]) {
        assert.match(name, pattern, `${matcher} does not match ${name}`);
      }
      // It must not reach another server's identically named tool, or a longer tool name.
      assert.doesNotMatch(`mcp__other__${tool}`, pattern, `${matcher} over-matches mcp__other__${tool}`);
      assert.doesNotMatch(`mcp__cookiepal__${tool}_status`, pattern, `${matcher} over-matches a longer name`);
    }
  });

  // The public suffix list that tldts bundles names thousands of other companies'
  // hosts, `amazonaws.com` and `*-staging` among them. It is public data, not
  // ours, so its section of dist/tldts.mjs is the one part left out of this check.
  const PUBLIC_SUFFIX_LIST = /\/\/ node_modules\/\.pnpm\/tldts@[^\n]*\n[\s\S]*?(?=\n\/\/ (?:node_modules|src)\/|$)/g;

  test('no internal hostnames or AWS endpoints', () => {
    for (const { path, text } of files) {
      const withoutSuffixList = PUBLIC_COMPANY_NAMES.reduce(
        (rest, allowed) => rest.replace(allowed, ''),
        text.replace(PUBLIC_SUFFIX_LIST, ''),
      );
      for (const pattern of FORBIDDEN) {
        assert.doesNotMatch(withoutSuffixList, pattern, `${path} matches ${pattern}`);
      }
    }
  });

  // The plugin directory holds a submission for a reviewer when a file is over 256 KiB.
  test('every dist/ file is under 240 KiB', () => {
    for (const name of readdirSync(join(root, 'dist'))) {
      const { size } = statSync(join(root, 'dist', name));
      assert.ok(size <= 240 * 1024, `dist/${name} is ${size} bytes; move data or a dependency out of the bundle`);
    }
  });

  // It holds any file that is not text too, and esbuild writes some escapes, such as `\u0001`, as the raw byte.
  test('every dist/ file is text', () => {
    for (const name of readdirSync(join(root, 'dist'))) {
      const text = readFileSync(join(root, 'dist', name), 'utf8');
      // biome-ignore lint/suspicious/noControlCharactersInRegex: control characters are what this looks for.
      const control = text.match(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/);
      assert.equal(control, null, `dist/${name} has a raw control character; escape it differently in src/`);
    }
  });
});
