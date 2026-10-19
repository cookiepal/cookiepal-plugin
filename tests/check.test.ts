import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, readFileSync, rmSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, test } from 'node:test';
import { isThirdParty } from '../src/browser.ts';
import { categorise } from '../src/categorise.ts';
import { decline, readConsent, share } from '../src/consent.ts';
import { MAX_PAGE_TEXT, pageText } from '../src/pageText.ts';
import { type Limits, parsePlan } from '../src/plan.ts';
import { buildSubmission, type CapturedCookie } from '../src/result.ts';
import { savePlan, saveTarget, sweep, takePlanFor, takeTarget } from '../src/savedPlans.ts';
import { prepareUrl } from '../src/url.ts';

describe('prepareUrl', () => {
  test('removes crawl=true and cookiepal-crawl=true and the fragment, and keeps the rest', () => {
    const prepared = prepareUrl('https://Example.com/shop/?crawl=true&cookiepal-crawl=true&q=1#top');
    assert.deepEqual(prepared, {
      ok: true,
      target: 'https://example.com/shop/?q=1',
      page: 'https://example.com/shop',
      removed: ['crawl', 'cookiepal-crawl'],
    });
  });

  test('leaves a URL without markers exactly as given', () => {
    const prepared = prepareUrl('http://localhost:3000/a?b=c%20d');
    assert.equal(prepared.ok && prepared.target, 'http://localhost:3000/a?b=c%20d');
    assert.deepEqual(prepared.ok && prepared.removed, []);
  });

  test('refuses a URL that is not http or https', () => {
    for (const url of ['file:///etc/passwd', 'javascript:alert(1)', 'chrome://settings', 'ftp://example.com']) {
      assert.equal(prepareUrl(url).ok, false, url);
    }
  });

  test('refuses text that is not a URL, credentials, and a marker outside the query', () => {
    assert.equal(prepareUrl('example.com').ok, false);
    assert.equal(prepareUrl('https://user:pass@example.com').ok, false);
    assert.equal(prepareUrl('https://example.com/crawl=true').ok, false);
  });
});

describe('categorise', () => {
  test('uses the local @cookiepal-oss/cookie-db catalogue', () => {
    assert.equal(categorise('_ga').category, 'analytics');
    assert.equal(categorise('_GA').category, 'analytics');
    assert.equal(categorise('_ga_ABC123').category, 'analytics');
    assert.equal(categorise('_gcl_au').category, 'advertisement');
  });

  test('an unknown cookie is other', () => {
    assert.deepEqual(categorise('definitely_not_a_known_cookie'), { category: 'other', vendor: null });
  });

  test('a wildcard entry matches names that start with it', () => {
    assert.equal(categorise('_hjSession_123').category, 'analytics');
    assert.equal(categorise('_hjSession_123').vendor, 'Hotjar');
  });
});

describe('parsePlan', () => {
  const plan = {
    planVersion: 1,
    checkId: '0192f3a4-1b2c-7d3e-8f40-123456789abc',
    ranFrom: { country: 'GB' },
    target: { url: 'https://example.com/', page: 'https://example.com/' },
    load: { waitUntil: 'load', settleMs: 3000, timeoutMs: 30_000 },
    limits: {
      maxCookies: 200,
      maxCookieNameLength: 128,
      maxCookieDomainLength: 253,
      maxCookiePathLength: 128,
      maxThirdPartyHosts: 200,
      maxHostLength: 253,
    },
    submit: { tool: 'submit_check', resultVersion: 1 },
  };

  test('reads a version 1 plan', () => {
    const parsed = parsePlan(plan);
    assert.ok(parsed.ok);
    assert.equal(parsed.plan.country, 'GB');
    assert.equal(parsed.plan.settleMs, 3000);
  });

  test('an unknown planVersion stops the check and says to update the plugin', () => {
    const parsed = parsePlan({ ...plan, planVersion: 2 });
    assert.equal(parsed.ok, false);
    assert.match(!parsed.ok ? parsed.error : '', /Update the plugin/);
  });

  test('a plan cannot stretch the load past the skill’s own bounds', () => {
    const parsed = parsePlan({ ...plan, load: { settleMs: 1e9, timeoutMs: 1e9 } });
    assert.ok(parsed.ok);
    assert.equal(parsed.plan.settleMs, 10_000);
    assert.equal(parsed.plan.timeoutMs, 60_000);
  });

  test('an unknown resultVersion stops the check and says to update the plugin', () => {
    const parsed = parsePlan({ ...plan, submit: { tool: 'submit_check', resultVersion: 2 } });
    assert.equal(parsed.ok, false);
    assert.match(!parsed.ok ? parsed.error : '', /Update the plugin/);
  });

  test('a plan past its expiresAt is refused', () => {
    const parsed = parsePlan({ ...plan, expiresAt: new Date(Date.now() - 1000).toISOString() });
    assert.equal(parsed.ok, false);
    assert.match(!parsed.ok ? parsed.error : '', /expired/);
    assert.equal(parsePlan({ ...plan, expiresAt: new Date(Date.now() + 60_000).toISOString() }).ok, true);
  });

  test('a missing country reads as unknown', () => {
    const parsed = parsePlan({ ...plan, ranFrom: { country: null } });
    assert.equal(parsed.ok && parsed.plan.country, null);
  });
});

describe('buildSubmission', () => {
  const limits: Limits = {
    maxCookies: 3,
    maxCookieNameLength: 20,
    maxCookieDomainLength: 253,
    maxCookiePathLength: 128,
    maxThirdPartyHosts: 2,
    maxHostLength: 253,
  };
  const cookie = (name: string, extra: Partial<CapturedCookie> = {}): CapturedCookie => ({
    name,
    domain: '.example.com',
    path: '/',
    expires: -1,
    httpOnly: false,
    secure: true,
    ...extra,
  });
  const checkId = '0192f3a4-1b2c-7d3e-8f40-123456789abc';

  test('categorises each cookie and never carries its value', () => {
    const withValue = { ...cookie('_ga'), value: 'GA1.1.SECRET-VALUE' } as CapturedCookie;
    const { submission } = buildSubmission(checkId, [withValue], [], limits);
    assert.equal(submission.cookies[0].category, 'analytics');
    assert.doesNotMatch(JSON.stringify(submission), /SECRET-VALUE/);
    assert.equal(submission.truncated, false);
  });

  test('a cookie the server would refuse is left out and the result marked truncated', () => {
    const built = buildSubmission(
      checkId,
      [
        cookie('ok'),
        cookie('has space'),
        cookie('x'.repeat(21)),
        cookie('café'),
        cookie('bad-path', { path: 'no-slash' }),
      ],
      [],
      limits,
    );
    assert.deepEqual(
      built.submission.cookies.map((c) => c.name),
      ['ok'],
    );
    assert.equal(built.droppedCookies, 4);
    assert.equal(built.submission.truncated, true);
  });

  test('cookies and hosts past the plan’s limits are left out and marked truncated', () => {
    const built = buildSubmission(
      checkId,
      ['a', 'b', 'c', 'd'].map((name) => cookie(name)),
      ['one.test', 'TWO.test', 'two.test', 'three.test'],
      limits,
    );
    assert.equal(built.submission.cookies.length, 3);
    assert.deepEqual(built.submission.thirdPartyHosts, ['one.test', 'two.test']);
    assert.equal(built.submission.truncated, true);
  });

  test('hosts are deduplicated case-insensitively, and a host-only overflow is marked truncated', () => {
    const built = buildSubmission(checkId, [], ['one.test', 'ONE.test', 'two.test', 'three.test'], limits);
    assert.deepEqual(built.submission.thirdPartyHosts, ['one.test', 'two.test']);
    assert.equal(built.droppedHosts, 1);
    assert.equal(built.submission.truncated, true);
  });

  test('expiry is whole seconds, -1 for a session cookie, and sameSite only when valid', () => {
    const { submission } = buildSubmission(
      checkId,
      [cookie('a', { expires: 1_800_000_000.75, sameSite: 'Lax' }), cookie('b', { sameSite: 'Weird' })],
      [],
      limits,
    );
    assert.equal(submission.cookies[0].expires, 1_800_000_000);
    assert.equal(submission.cookies[0].sameSite, 'Lax');
    assert.equal(submission.cookies[1].expires, -1);
    assert.equal('sameSite' in submission.cookies[1], false);
  });
});

describe('pageText', () => {
  test('caps length and strips hidden characters', () => {
    const hidden = String.fromCodePoint(0x202e, 0x200b, 0xe0041);
    const text = pageText(`Hello${hidden}\n\n world ${'x'.repeat(500)}`);
    assert.ok(text);
    assert.equal([...text].length, MAX_PAGE_TEXT);
    assert.ok(text.startsWith('Hello world'));
    assert.ok(![...text].some((char) => hidden.includes(char)));
  });

  test('empty or non-string text is null', () => {
    assert.equal(pageText('   '), null);
    assert.equal(pageText(undefined), null);
  });
});

describe('isThirdParty', () => {
  test('the page host, its www-less root and its subdomains are first-party', () => {
    assert.equal(isThirdParty('www.example.com', 'www.example.com'), false);
    assert.equal(isThirdParty('example.com', 'www.example.com'), false);
    assert.equal(isThirdParty('cdn.example.com', 'www.example.com'), false);
    assert.equal(isThirdParty('www.google-analytics.com', 'www.example.com'), true);
    assert.equal(isThirdParty('notexample.com', 'example.com'), true);
    assert.equal(isThirdParty('127.0.0.1', 'localhost'), true);
  });

  test('sibling subdomains share the registrable domain', () => {
    assert.equal(isThirdParty('mcp.cookiepal.io', 'app.cookiepal.io'), false);
    assert.equal(isThirdParty('cookiepal.io', 'app.cookiepal.io'), false);
    assert.equal(isThirdParty('static.example.co.uk', 'www.example.co.uk'), false);
    assert.equal(isThirdParty('other.co.uk', 'www.example.co.uk'), true);
  });

  test('a private suffix keeps each site apart', () => {
    assert.equal(isThirdParty('other.github.io', 'jack.github.io'), true);
    assert.equal(isThirdParty('cdn.jack.github.io', 'jack.github.io'), false);
  });

  test('a page with no registrable domain owns its host and subdomains only', () => {
    assert.equal(isThirdParty('localhost', 'localhost'), false);
    assert.equal(isThirdParty('api.localhost', 'localhost'), false);
    assert.equal(isThirdParty('127.0.0.1', '127.0.0.1'), false);
    assert.equal(isThirdParty('example.com', '127.0.0.1'), true);
  });
});

describe('install ID consent', () => {
  const dirs: string[] = [];
  const dataDir = () => {
    const dir = mkdtempSync(join(tmpdir(), 'cookiepal-data-'));
    dirs.push(dir);
    return dir;
  };
  after(() => {
    for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
  });

  test('nothing is asked or stored before the first answer', () => {
    assert.deepEqual(readConsent(dataDir()), { asked: false, installId: null });
  });

  test('a no is remembered and creates no ID', () => {
    const dir = dataDir();
    assert.deepEqual(decline(dir), { asked: true, installId: null });
    assert.doesNotMatch(readFileSync(join(dir, 'install-id.json'), 'utf8'), /[0-9a-f]{8}-/);
  });

  test('a yes creates a random UUID v4 once, and withdrawing deletes it', () => {
    const dir = dataDir();
    const { installId } = share(dir);
    assert.match(installId ?? '', /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    assert.equal(share(dir).installId, installId);
    decline(dir);
    assert.deepEqual(readConsent(dir), { asked: true, installId: null });
    assert.doesNotMatch(readFileSync(join(dir, 'install-id.json'), 'utf8'), new RegExp(installId ?? 'x'));
  });
});

describe('saved plans and targets', () => {
  const dirs: string[] = [];
  const dataDir = () => {
    const dir = mkdtempSync(join(tmpdir(), 'cookiepal-plans-'));
    dirs.push(dir);
    return dir;
  };
  after(() => {
    for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
  });

  const plan = { planVersion: 1, checkId: '0192f3a4-1b2c-7d3e-8f40-123456789abc' };
  const url = 'https://example.com/';

  test('reads the plan from each shape an MCP tool result can take', () => {
    const text = JSON.stringify(plan);
    const shapes = [
      text,
      [{ type: 'text', text }],
      { content: [{ type: 'text', text }] },
      { structuredContent: plan, content: [{ type: 'text', text: 'ignored' }] },
    ];
    for (const shape of shapes) {
      const dir = dataDir();
      assert.equal(savePlan(dir, { tool_input: { url }, tool_response: shape }), true, JSON.stringify(shape));
      const taken = takePlanFor(dir, url, 0);
      assert.deepEqual([taken?.url, taken?.plan], [url, plan]);
    }
  });

  test('ignores a result that is not a plan', () => {
    const dir = dataDir();
    for (const response of ['Unknown check ID.', { checkId: '../../etc/passwd' }, null]) {
      assert.equal(savePlan(dir, { tool_input: { url }, tool_response: response }), false);
    }
    assert.equal(takePlanFor(dir, url, 0), null);
  });

  test('takes the newest plan for the page, once', () => {
    const dir = dataDir();
    const older = { ...plan, checkId: '0192f3a4-1b2c-7d3e-8f40-000000000001' };
    savePlan(dir, { tool_input: { url }, tool_response: JSON.stringify(older) });
    const old = new Date(Date.now() - 60_000);
    utimesSync(join(dir, 'plans', `${older.checkId}.json`), old, old);
    savePlan(dir, { tool_input: { url }, tool_response: JSON.stringify(plan) });

    assert.equal(takePlanFor(dir, url, 0)?.plan.checkId, plan.checkId);
    assert.equal(takePlanFor(dir, url, 0)?.plan.checkId, older.checkId);
    assert.equal(takePlanFor(dir, url, 0), null);
  });

  test('never takes a plan saved before this check was prepared', () => {
    const dir = dataDir();
    savePlan(dir, { tool_input: { url }, tool_response: JSON.stringify(plan) });
    assert.equal(takePlanFor(dir, url, Date.now() + 1000), null);
    assert.equal(takePlanFor(dir, url, 0)?.plan.checkId, plan.checkId);
  });

  // Another session sharing the data folder, or an interrupted check, can leave a newer plan for
  // another page: it must never be loaded as this check.
  test('never takes a plan for another page, however new', () => {
    const dir = dataDir();
    savePlan(dir, { tool_input: { url }, tool_response: JSON.stringify(plan) });
    const other = { ...plan, checkId: '0192f3a4-1b2c-7d3e-8f40-000000000002' };
    savePlan(dir, { tool_input: { url: 'https://other.test/' }, tool_response: JSON.stringify(other) });

    assert.equal(takePlanFor(dir, url, 0)?.plan.checkId, plan.checkId);
    assert.equal(takePlanFor(dir, 'https://other.test/', 0)?.plan.checkId, other.checkId);
  });

  test('keeps each full URL under its own ref, once', () => {
    const dir = dataDir();
    const a = saveTarget(dir, { page: 'https://example.com/a', target: 'https://example.com/a?share=1' });
    const b = saveTarget(dir, { page: 'https://example.com/a', target: 'https://example.com/a?share=2' });
    assert.notEqual(a, b);
    assert.equal(takeTarget(dir, b)?.target, 'https://example.com/a?share=2');
    assert.equal(takeTarget(dir, a)?.target, 'https://example.com/a?share=1');
    assert.equal(takeTarget(dir, a), null);
    assert.equal(takeTarget(dir, '../../etc/passwd'), null);
  });

  test('a saved URL past the 30-minute window is not returned, and a sweep deletes it', () => {
    const dir = dataDir();
    const old = new Date(Date.now() - 31 * 60_000);
    const expired = saveTarget(dir, { page: url, target: `${url}?token=1` });
    utimesSync(join(dir, 'targets', `${expired}.json`), old, old);
    assert.equal(takeTarget(dir, expired), null);

    const lingering = saveTarget(dir, { page: url, target: `${url}?token=2` });
    utimesSync(join(dir, 'targets', `${lingering}.json`), old, old);
    sweep(dir);
    assert.deepEqual(readdirSync(join(dir, 'targets')), []);
  });
});
