import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, test } from 'node:test';
import { findTagExpression, NOT_FOUND, parseFoundTag, verifyDecision } from '../src/install.ts';
import { readSnippet, saveEvidence, saveSnippet } from '../src/savedPlans.ts';

const dirs: string[] = [];
const freshDir = () => {
  const dir = mkdtempSync(join(tmpdir(), 'cookiepal-install-test-'));
  dirs.push(dir);
  return dir;
};

after(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
});

const SCRIPT_URL = 'https://cdn.test/client_data/s3-id-1/script.js';

/** A PostToolUse payload as the hook receives it, with the tool's structured answer. */
const snippetPayload = (overrides: Record<string, unknown> = {}) => ({
  tool_input: {},
  tool_response: {
    structuredContent: { domainId: 'shop.example', scriptUrl: SCRIPT_URL, ...overrides },
  },
});

const evidence = (overrides: Record<string, unknown> = {}) => ({
  url: 'https://shop.example/',
  seenAt: new Date().toISOString(),
  scriptSrc: SCRIPT_URL,
  tag: `<script id="cookiepal" src="${SCRIPT_URL}">`,
  loadError: null,
  ...overrides,
});

describe('the in-page tag finder', () => {
  // Its arguments are this file's own numbers, and the function closes over
  // nothing: its source is sent to the browser as text.
  test('is one self-contained expression with no server or page input in it', () => {
    const expression = findTagExpression();

    assert.match(expression, /^\(function find\(/);
    assert.match(expression, /\)\(2048, 1024, 10\)$/);
    assert.equal(expression.includes('import'), false);
    assert.equal(expression.includes('require'), false);
  });

  // The expected script URL is never passed into the page. A page told which
  // URL would verify it could simply echo that back as its own tag.
  test('is never told which script would verify the domain', () => {
    assert.equal(findTagExpression().includes('client_data/s3-id-1'), false);
  });

  // The id is not a way in: accepting any src that carried it would let a page
  // nominate an arbitrary URL as the evidence this check uploads.
  test('requires the client_data path, not just the cookiepal id', () => {
    assert.match(findTagExpression(), /CLIENT_DATA\.test\(srcOf\(script\)\)/);
    assert.equal(/id === 'cookiepal' && src/.test(findTagExpression()), false);
  });
});

/** What the page returns now: every match, each with its own src and rebuilt tag. */
const page = (matches: { src?: unknown; tag?: unknown }[], count?: number) => ({
  matches,
  count: count ?? matches.length,
});

describe('parseFoundTag', () => {
  test('keeps a reading that found a banner script', () => {
    const found = parseFoundTag(page([{ src: SCRIPT_URL, tag: `<script id="cookiepal" src="${SCRIPT_URL}">` }]));

    assert.equal(found.scriptSrc, SCRIPT_URL);
    assert.equal(found.count, 1);
  });

  // The page decides what it returns, so anything but a usable reading is
  // "no tag found" rather than an error that would stop the verification.
  test('reads anything unusable as no tag found', () => {
    for (const value of [null, undefined, 'a string', [], 42, {}, { matches: 'no' }]) {
      assert.deepEqual(parseFoundTag(value), NOT_FOUND, JSON.stringify(value) ?? 'undefined');
    }
  });

  // Without a `src` the server has nothing to compare, so a tag alone is not an install.
  test('drops a match with no src, keeping the page’s count', () => {
    const found = parseFoundTag(page([{ src: null, tag: '<script id="cookiepal">' }], 2));

    assert.equal(found.scriptSrc, null);
    assert.equal(found.tag, null);
    assert.equal(found.count, 2);
  });

  // The server's evidence schema refuses these, so a page cannot make the
  // upload fail by returning one, and nothing carries prose to the model.
  test('drops a tag that is not printable ASCII on one line', () => {
    for (const tag of ['<script\nsrc="x">', '<script \u202esrc="x">', '<script \udb40\udc41>', '<\u00fc>']) {
      const found = parseFoundTag(page([{ src: SCRIPT_URL, tag }]));
      assert.equal(found.tag, null, tag);
      // The reading itself survives: the `src` is what decides the status.
      assert.equal(found.scriptSrc, SCRIPT_URL);
    }
  });

  test('drops a src that is too long to be one', () => {
    const found = parseFoundTag(page([{ src: `https://x.test/${'a'.repeat(2048)}`, tag: null }]));

    assert.equal(found.scriptSrc, null);
  });

  // "I pasted the wrong tag, then added the right one": the stranger's tag is
  // first in document order, and the domain's own install is still installed.
  test('prefers the domain’s own script over another site’s above it', () => {
    const other = 'https://cdn.test/client_data/someone-else/script.js';
    const found = parseFoundTag(
      page([
        { src: other, tag: `<script id="cookiepal" src="${other}">` },
        { src: SCRIPT_URL, tag: `<script id="cookiepal" src="${SCRIPT_URL}">` },
      ]),
      SCRIPT_URL,
    );

    assert.equal(found.scriptSrc, SCRIPT_URL);
    assert.equal(found.count, 2);
  });

  test('reports the first match when none is the domain’s own', () => {
    const other = 'https://cdn.test/client_data/someone-else/script.js';
    const found = parseFoundTag(page([{ src: other, tag: null }]), SCRIPT_URL);

    assert.equal(found.scriptSrc, other);
  });

  // A cache-buster is the same file; the server compares origin and path too.
  test('matches the domain’s own script ignoring a query or fragment', () => {
    const found = parseFoundTag(
      page([
        { src: 'https://cdn.test/client_data/other/script.js', tag: null },
        { src: `${SCRIPT_URL}?v=3`, tag: null },
      ]),
      SCRIPT_URL,
    );

    assert.equal(found.scriptSrc, `${SCRIPT_URL}?v=3`);
  });

  test('never returns a negative or fractional count', () => {
    assert.equal(parseFoundTag(page([], -5)).count, 0);
    assert.equal(parseFoundTag(page([{ src: SCRIPT_URL, tag: null }], 2.7)).count, 2);
  });
});

describe('the snippet the hook saves', () => {
  test('stores the domain and script URL the server returned', () => {
    const dir = freshDir();

    assert.equal(saveSnippet(dir, snippetPayload()), true);
    assert.deepEqual(
      { ...readSnippet(dir), savedAt: 0 },
      { domainId: 'shop.example', scriptUrl: SCRIPT_URL, savedAt: 0 },
    );
  });

  test('reads a named domain, and nothing for one never saved', () => {
    const dir = freshDir();
    saveSnippet(dir, snippetPayload());

    assert.equal(readSnippet(dir, 'shop.example')?.scriptUrl, SCRIPT_URL);
    assert.equal(readSnippet(dir, 'other.example'), null);
  });

  // The domain names the file, so a separator or a traversal in it would
  // otherwise choose the path written to.
  test('refuses a domain that could name a path', () => {
    const dir = freshDir();

    for (const domainId of ['../escape', 'a/b', '', 'a'.repeat(254), 'shop.example\u0000']) {
      assert.equal(saveSnippet(dir, snippetPayload({ domainId })), false, domainId);
    }
  });

  // The same guard the write side applies, on the function that builds the path.
  test('refuses to read a domain that could name a path', () => {
    const dir = freshDir();
    saveSnippet(dir, snippetPayload());

    for (const domainId of ['../../etc/passwd', 'a/b', 'shop.example\u0000']) {
      assert.equal(readSnippet(dir, domainId), null, domainId);
    }
    // The newest-snippet lookup still works.
    assert.equal(readSnippet(dir)?.domainId, 'shop.example');
  });

  test('ignores a response that is not a snippet', () => {
    const dir = freshDir();

    assert.equal(saveSnippet(dir, { tool_response: { structuredContent: {} } }), false);
    assert.equal(saveSnippet(dir, { tool_response: 'not json' }), false);
    assert.equal(saveSnippet(dir, 'nonsense'), false);
    assert.equal(readSnippet(dir), null);
  });

  test('forgets a snippet older than the 30-minute window', () => {
    const dir = freshDir();
    saveSnippet(dir, snippetPayload());
    const old = Date.now() / 1000 - 31 * 60;
    utimesSync(join(dir, 'snippets', 'shop.example.json'), old, old);

    assert.equal(readSnippet(dir), null);
  });
});

describe('the verify_installation guard', () => {
  const dirWithEvidence = (saved = evidence()) => {
    const dir = freshDir();
    saveEvidence(dir, 'shop.example', saved);
    return dir;
  };

  test('allows the evidence a local run produced', () => {
    const saved = evidence();

    assert.equal(verifyDecision(dirWithEvidence(saved), { evidence: saved }), 'allow');
    assert.equal(verifyDecision(dirWithEvidence(saved), { domainId: 'shop.example', evidence: saved }), 'allow');
  });

  // The whole point: a reading with its `scriptSrc` swapped for the expected
  // one is a verified install the model inferred rather than measured.
  test('denies evidence edited after the run', () => {
    const saved = evidence({ scriptSrc: null, tag: null });
    const dir = dirWithEvidence(saved);

    assert.equal(verifyDecision(dir, { evidence: { ...saved, scriptSrc: SCRIPT_URL } }), 'deny');
    assert.equal(verifyDecision(dir, { evidence: { ...saved, loadError: null, extra: 1 } }), 'deny');
  });

  test('denies evidence for a domain no run covered', () => {
    const dir = dirWithEvidence();

    assert.equal(
      verifyDecision(dir, { domainId: 'other.example', evidence: evidence({ url: 'https://other.example/' }) }),
      'deny',
    );
  });

  // Both directions: the run is saved under whichever name the server used, and
  // the guard may only have the page's host to go on.
  test('matches the run saved without www when the page carries it', () => {
    const saved = evidence({ url: 'https://www.shop.example/' });
    const dir = freshDir();
    saveEvidence(dir, 'shop.example', saved);

    assert.equal(verifyDecision(dir, { evidence: saved }), 'allow');
  });

  test('matches the run saved with www when the page is the apex', () => {
    const saved = evidence({ url: 'https://shop.example/' });
    const dir = freshDir();
    saveEvidence(dir, 'www.shop.example', saved);

    // No domainId, which is what the server's optional field allows.
    assert.equal(verifyDecision(dir, { evidence: saved }), 'allow');
  });

  // The model retypes this object into its tool call, so the same reading can
  // arrive with its keys in another order. That is not a forgery.
  test('allows the same reading with its keys in another order', () => {
    const saved = evidence();
    const dir = dirWithEvidence(saved);
    const reordered = {
      loadError: saved.loadError,
      tag: saved.tag,
      scriptSrc: saved.scriptSrc,
      seenAt: saved.seenAt,
      url: saved.url,
    };

    assert.notEqual(JSON.stringify(reordered), JSON.stringify(saved));
    assert.equal(verifyDecision(dir, { evidence: reordered }), 'allow');
  });

  test('denies a reading missing a field, or carrying one it should not', () => {
    const saved = evidence();
    const dir = dirWithEvidence(saved);
    const { tag: _tag, ...withoutTag } = saved;

    assert.equal(verifyDecision(dir, { evidence: withoutTag }), 'deny');
    assert.equal(verifyDecision(dir, { evidence: { ...saved, extra: 1 } }), 'deny');
  });

  // Fails closed: unreadable input, no data folder and no stored run are all refusals.
  test('denies anything it cannot check', () => {
    const dir = dirWithEvidence();

    assert.equal(verifyDecision(dir, { evidence: {} }), 'deny');
    assert.equal(verifyDecision(dir, { evidence: { url: 'not a url' } }), 'deny');
    assert.equal(verifyDecision(dir, {}), 'deny');
    assert.equal(verifyDecision(dir, 'nonsense'), 'deny');
    assert.equal(verifyDecision(null, { evidence: evidence() }), 'deny');
    assert.equal(verifyDecision(freshDir(), { evidence: evidence() }), 'deny');
  });

  test('denies a run older than the 30-minute window', () => {
    const saved = evidence();
    const dir = dirWithEvidence(saved);
    const old = Date.now() / 1000 - 31 * 60;
    utimesSync(join(dir, 'evidence', 'shop.example.json'), old, old);

    assert.equal(verifyDecision(dir, { evidence: saved }), 'deny');
  });
});
