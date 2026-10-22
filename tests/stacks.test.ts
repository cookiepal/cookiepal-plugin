import assert from 'node:assert/strict';
import { globSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, test } from 'node:test';

const root = join(import.meta.dirname, '..');
const RULES = join(root, 'skills/detect-stack/references/stacks.md');
const FIXTURES = join(root, 'tests/fixtures/stacks');

/**
 * The one fact three files have to agree on. `FIND`'s own `CLIENT_DATA` regex in
 * `src/install.ts` cannot import it — that function is stringified and sent to the
 * browser with no closure over anything — so instead of sharing a constant, this
 * asserts that the regex, the skills' rules file and the fixtures still spell the
 * path the same way. Change the CDN path in one of them and the suite fails.
 */
const CLIENT_DATA_PATH = '/client_data/';

/** The fixture id that stands for "this account's own domain". */
const OWN_ID = 'fixture-id';

interface Rule {
  order: number;
  stack: string;
  signals: string;
  headFile: string;
}

interface Expected {
  stack: string;
  headFile?: string;
  headFiles?: string[];
  ambiguous?: boolean;
  installState: 'none' | 'installed' | 'comment-only' | 'other-domain';
}

const rulesText = readFileSync(RULES, 'utf8');

/** The body of one `## ` section of stacks.md, so one table's rows never leak into another's. */
const section = (heading: string): string => {
  const body = rulesText.split(`\n## ${heading}\n`)[1];
  assert.ok(body, `stacks.md has no "## ${heading}" section`);
  return body.split('\n## ')[0];
};

const tableRows = (heading: string): string[][] =>
  section(heading)
    .split('\n')
    .filter((line) => /^\|\s*\d+\s*\|/.test(line))
    .map((line) => line.split('|').map((cell) => cell.trim().replaceAll('`', '')));

/** The rules table, in its row order. Parsing it is what stops the test drifting from the skill. */
const readRules = (): Rule[] =>
  tableRows('The table').map(([, order, stack, signals, headFile]) => ({
    order: Number(order),
    stack,
    signals,
    headFile,
  }));

/** Stacks where two groups of globs both matching means "ask the user", not "pick the first". */
const readPreChecks = (): Map<number, [string, string]> =>
  new Map(tableRows('Ambiguity pre-checks').map(([, order, , a, b]) => [Number(order), [a, b]]));

const deps = (dir: string): Set<string> => {
  try {
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
    return new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})]);
  } catch {
    return new Set();
  }
};

const termHolds = (dir: string, term: string): boolean => {
  if (term === 'any') return true;
  if (term.startsWith('dep:')) return deps(dir).has(term.slice(4));
  if (term.startsWith('file:')) return globSync(term.slice(5), { cwd: dir }).length > 0;
  throw new Error(`unknown signal term: ${term}`);
};

const signalsHold = (dir: string, signals: string): boolean =>
  signals.split(' OR ').some((alt) => alt.split(' + ').every((term) => termHolds(dir, term.trim())));

/** Every file matching any glob in a ` OR `-separated group, `#has:<text>` filters applied. */
const matchGroup = (dir: string, group: string): string[] => {
  const hits = group.split(' OR ').flatMap((spec) => {
    const [glob, has] = spec.split('#has:');
    return globSync(glob.trim(), { cwd: dir }).filter(
      (path) => !has || readFileSync(join(dir, path), 'utf8').includes(has),
    );
  });
  return [...new Set(hits)].sort();
};

/** First glob with a match wins; `#has:<text>` keeps only files whose contents contain it. */
const resolveHead = (dir: string, headFile: string): string[] => {
  for (const spec of headFile.split(' OR ')) {
    const matched = matchGroup(dir, spec);
    if (matched.length > 0) return matched;
  }
  return [];
};

/**
 * The file every candidate imports the first child of its `<head>` from, when that is the
 * same file for all of them. `<head(?:\s[^>]*)?>` and not `<head`, which `<header>` starts with.
 */
const sharedHead = (dir: string, files: string[]): string | null => {
  const sources = files.map((file) => {
    const text = readFileSync(join(dir, file), 'utf8');
    const component = text.match(/<head(?:\s[^>]*)?>\s*<([A-Z][\w.]*)/)?.[1];
    if (!component) return null;
    const from = text.match(new RegExp(`import\\s+${component}\\s+from\\s+['"]([^'"]+)['"]`))?.[1];
    return from ? join(dirname(file), from) : null;
  });
  return sources[0] && sources.every((source) => source === sources[0]) ? sources[0] : null;
};

const detect = (dir: string, rules: Rule[], preChecks: Map<number, [string, string]>) => {
  const rule = rules.find((candidate) => signalsHold(dir, candidate.signals));
  if (!rule) return null;

  // Several candidates that all open their <head> with one component are one answer, not a question.
  const resolved = (headFiles: string[]) => {
    const shared = headFiles.length > 1 ? sharedHead(dir, headFiles) : null;
    if (shared) return { stack: rule.stack, headFiles: [shared], ambiguous: false };
    return { stack: rule.stack, headFiles, ambiguous: headFiles.length > 1 };
  };

  // The pre-check runs first: first-glob-wins would otherwise silently answer a
  // question with two real answers, picking whichever group sits further left.
  const groups = preChecks.get(rule.order);
  if (groups) {
    const [a, b] = groups.map((group) => matchGroup(dir, group));
    if (a.length > 0 && b.length > 0) return resolved([...a, ...b].sort());
  }

  return resolved(resolveHead(dir, rule.headFile));
};

/**
 * Which of stacks.md's four outcomes a repo is in. Comments are stripped first,
 * because a commented-out tag must read as "not installed" — the opposite of what
 * a bare text search reports.
 */
const classify = (texts: string[]): Expected['installState'] => {
  const idsIn = (text: string): string[] =>
    [...text.matchAll(/\/client_data\/([^/\s"'`]+)\/script\.js/g)].map((match) => match[1]);

  const uncommented = (text: string): string =>
    text
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\{#[\s\S]*?#\}/g, '')
      .replace(/\{%\s*comment\s*%\}[\s\S]*?\{%\s*endcomment\s*%\}/g, '')
      // A `//` line comment only at the start of a line or after whitespace. Keying off
      // "not preceded by a colon" instead would spare `https://` but still eat a
      // protocol-relative `src="//cdn…/script.js"`, reading a live tag as commented out —
      // and install-banner would then add a second banner beside it.
      .replace(/(^|\s)\/\/.*$/gm, '$1');

  const live = texts.flatMap((text) => idsIn(uncommented(text)));
  if (live.length === 0) {
    return texts.flatMap(idsIn).length > 0 ? 'comment-only' : 'none';
  }
  return live.includes(OWN_ID) ? 'installed' : 'other-domain';
};

const fixtureNames = readdirSync(FIXTURES, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const expectedOf = (name: string): Expected => JSON.parse(readFileSync(join(FIXTURES, name, 'expected.json'), 'utf8'));

const headFilesOf = (expected: Expected): string[] => expected.headFiles ?? [expected.headFile as string];

/**
 * The directories stacks.md tells the skill to skip, read from stacks.md itself rather
 * than retyped here — a second copy would drift exactly as the three copies of the
 * `/client_data/` path nearly did.
 */
const readSkipList = (): string[] => {
  const block = rulesText.match(/```skip\n([\s\S]*?)```/);
  assert.ok(block, 'stacks.md no longer carries a ```skip``` block');
  return block[1]
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
};

const SKIP = readSkipList();

/** Every file in a fixture, minus the skipped directories — the skill's own search scope. */
const filesOf = (dir: string): string[] =>
  globSync('**/*', { cwd: dir })
    .filter((path) => !path.split('/').some((segment) => SKIP.includes(segment)))
    .filter((path) => {
      try {
        return statSync(join(dir, path)).isFile();
      } catch {
        return false;
      }
    });

describe('the detection rules table', () => {
  const rules = readRules();

  test('is numbered 1..N with no gaps, and every row has stack, signals and head file', () => {
    assert.deepEqual(
      rules.map((rule) => rule.order),
      rules.map((_, index) => index + 1),
    );
    for (const rule of rules) {
      assert.ok(rule.stack, `row ${rule.order} has no stack name`);
      assert.ok(rule.signals, `row ${rule.order} has no signals`);
      assert.ok(rule.headFile, `row ${rule.order} has no head file`);
    }
  });

  test('the last row is the fallback: its signals are exactly `any`', () => {
    assert.equal(rules.at(-1)?.signals, 'any');
    for (const rule of rules.slice(0, -1)) {
      assert.notEqual(rule.signals, 'any', `row ${rule.order} (${rule.stack}) short-circuits every row below it`);
    }
  });

  test('every row has a per-stack insertion rule for install-banner to apply', () => {
    const documented = new Set(
      [...section('Per-stack insertion rules').matchAll(/^### (\d+)[a-z]?\./gm)].map((match) => Number(match[1])),
    );
    assert.deepEqual(
      [...documented].sort((a, b) => a - b),
      rules.map((rule) => rule.order),
    );
  });

  test('every ambiguity pre-check names a real row, and its groups are that row’s own globs', () => {
    const byOrder = new Map(rules.map((rule) => [rule.order, rule]));
    for (const [order, groups] of readPreChecks()) {
      const rule = byOrder.get(order);
      assert.ok(rule, `pre-check names row ${order}, which the table does not have`);
      const combined = groups.flatMap((group) => group.split(' OR ')).sort();
      assert.deepEqual(combined, rule.headFile.split(' OR ').sort(), `row ${order}: pre-check groups drifted`);
    }
  });

  /*
   * Next's row has twice shipped asymmetric — `app/layout.ts` present while
   * `pages/_document.ts` was missing, so an ordinary repo got "head file not found".
   * One fixture per glob would mean fourteen near-identical repos; asserting the set is
   * the full cross-product kills the whole bug class instead, and fails if any single
   * spelling is dropped. Next resolves all four extensions by default `pageExtensions`.
   */
  test('the Next.js row lists every router × directory × extension, with none missing', () => {
    const next = rules.find((rule) => rule.stack === 'Next.js');
    assert.ok(next, 'the table no longer has a Next.js row');
    const expected = ['app/layout', 'src/app/layout', 'pages/_document', 'src/pages/_document'].flatMap((stem) =>
      ['tsx', 'jsx', 'ts', 'js'].map((extension) => `${stem}.${extension}`),
    );
    assert.deepEqual(
      next.headFile
        .split(' OR ')
        .map((glob) => glob.trim())
        .sort(),
      expected.sort(),
    );
  });

  // One fixture per *shape* — the thing that actually changes where the tag goes.
  test('each Next.js router and directory shape has a fixture', () => {
    const covered = fixtureNames
      .filter((name) => expectedOf(name).stack === 'Next.js')
      .flatMap((name) => headFilesOf(expectedOf(name)));
    for (const stem of ['app/layout', 'src/app/layout', 'pages/_document', 'src/pages/_document']) {
      assert.ok(
        covered.some((path) => path.startsWith(`${stem}.`)),
        `no fixture covers ${stem}.*`,
      );
    }
  });

  test('every stack in the table has a fixture, and every fixture names a stack in the table', () => {
    const tableStacks = new Set(rules.map((rule) => rule.stack));
    const fixtureStacks = new Set(fixtureNames.map((name) => expectedOf(name).stack));
    assert.deepEqual([...fixtureStacks].sort(), [...tableStacks].sort());
  });
});

describe('each fixture, run through the table', () => {
  const rules = readRules();
  const preChecks = readPreChecks();

  for (const name of fixtureNames) {
    const dir = join(FIXTURES, name);
    const expected = expectedOf(name);
    const result = detect(dir, rules, preChecks);

    test(`${name} is detected as ${expected.stack}`, () => {
      assert.ok(result, `${name}: no row matched`);
      assert.equal(result?.stack, expected.stack);
    });

    test(`${name} resolves its head file(s)`, () => {
      assert.deepEqual(result?.headFiles, headFilesOf(expected));
      assert.equal(result?.ambiguous, expected.ambiguous === true);
    });
  }

  test('an ambiguous fixture exists, so the “ask the user” branch is reachable', () => {
    const ambiguous = fixtureNames.filter((name) => expectedOf(name).ambiguous === true);
    assert.ok(ambiguous.length > 0, 'no fixture produces more than one head file');
  });
});

describe('the already-installed check', () => {
  for (const name of fixtureNames) {
    const dir = join(FIXTURES, name);
    const expected = expectedOf(name);

    test(`${name} classifies as ${expected.installState}`, () => {
      const texts = filesOf(dir).map((path) => readFileSync(join(dir, path), 'utf8'));
      assert.equal(classify(texts), expected.installState);
    });
  }

  test('each of the four outcomes has a fixture', () => {
    const states = new Set(fixtureNames.map((name) => expectedOf(name).installState));
    assert.deepEqual([...states].sort(), ['comment-only', 'installed', 'none', 'other-domain']);
  });
});

describe('the skills that act on the rules', () => {
  const detectSkill = readFileSync(join(root, 'skills/detect-stack/SKILL.md'), 'utf8');
  const installSkill = readFileSync(join(root, 'skills/install-banner/SKILL.md'), 'utf8');

  // The table can say what is ambiguous and the suite can model it, and the run still
  // picks the leftmost file unless the skill is told to run the pre-check first.
  test('detect-stack tells the model to run the ambiguity pre-check', () => {
    assert.match(detectSkill, /Ambiguity pre-checks/);
  });

  // The suite resolves a shared head component before it reports ambiguity, so the skill must too.
  test('detect-stack checks for a shared head component before it asks', () => {
    assert.match(detectSkill, /One shared head component is one answer/);
  });

  test('detect-stack names the fallback by position, not a row number that can shift', () => {
    assert.doesNotMatch(detectSkill, /row \d+/);
  });

  // Two of the four already-installed outcomes compare against the snippet's own src,
  // so the tag has to be fetched before the check, not after it.
  test('install-banner gets the tag before it checks whether one is already there', () => {
    const headings = [...installSkill.matchAll(/^### (\d+)\. (.+)$/gm)].map((match) => match[2]);
    const tag = headings.findIndex((heading) => /Get the tag/i.test(heading));
    const check = headings.findIndex((heading) => /already there/i.test(heading));
    assert.ok(tag >= 0 && check >= 0, `install-banner is missing a step: ${headings.join(' | ')}`);
    assert.ok(tag < check, 'the already-installed check runs before the snippet it compares against');
  });

  test('both skills point at stacks.md by a path that resolves from the plugin root', () => {
    for (const [name, text] of [
      ['detect-stack', detectSkill],
      ['install-banner', installSkill],
    ] as const) {
      for (const [, prefix] of text.matchAll(/(\S*)references\/stacks\.md/g)) {
        assert.match(prefix, /CLAUDE_PLUGIN_ROOT.*skills\/detect-stack\//, `${name}: bare references/stacks.md`);
      }
    }
  });

  test('install-banner handles every outcome detect-stack can return', () => {
    for (const outcome of ['Ambiguous', 'Already installed', 'another domain', 'No head file']) {
      assert.ok(installSkill.includes(outcome), `install-banner has no "${outcome}" branch`);
    }
  });

  test('install-banner carries the untrusted-repo-content rules its siblings do', () => {
    assert.match(installSkill, /never instructions|never, instructions|data, never/i);
    assert.match(installSkill, /[Nn]ever open, fetch or check a URL/);
  });
});

describe('the banner script path', () => {
  test('src/install.ts, stacks.md and the fixtures all spell it the same way', () => {
    const escaped = CLIENT_DATA_PATH.replaceAll('/', '\\/');

    const install = readFileSync(join(root, 'src/install.ts'), 'utf8');
    const matcher = install.split('\n').find((line) => line.includes('const CLIENT_DATA'));
    assert.ok(matcher, 'src/install.ts no longer defines CLIENT_DATA');
    assert.ok(matcher.includes(escaped), `CLIENT_DATA no longer matches ${CLIENT_DATA_PATH}`);

    assert.ok(rulesText.includes(escaped), `stacks.md no longer documents ${CLIENT_DATA_PATH}`);

    const installed = readFileSync(join(FIXTURES, 'already-installed/index.html'), 'utf8');
    assert.ok(installed.includes(`${CLIENT_DATA_PATH}${OWN_ID}/script.js`), 'the installed fixture drifted');
  });
});
