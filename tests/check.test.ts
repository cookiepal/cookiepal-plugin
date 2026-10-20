import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, utimesSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, test } from 'node:test';
import { isThirdParty } from '../src/browser.ts';
import { categorise } from '../src/categorise.ts';
import { decline, readConsent, share } from '../src/consent.ts';
import { MAX_PAGE_TEXT, pageText } from '../src/pageText.ts';
import { type Limits, parsePlan } from '../src/plan.ts';
import { buildConsent, buildConsentRun, buildSubmission, type CapturedCookie } from '../src/result.ts';
import {
  readResult,
  savePlan,
  saveResult,
  saveTarget,
  sweep,
  takePlanFor,
  takeTarget,
  writeRendered,
} from '../src/savedPlans.ts';
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

  test('an unknown cookie is other, and not known', () => {
    assert.deepEqual(categorise('definitely_not_a_known_cookie'), { category: 'other', vendor: null, known: false });
  });

  test('a cookie the catalogue files as other is known', () => {
    assert.equal(categorise('__Secure-ENID').category, 'other');
    assert.equal(categorise('__Secure-ENID').known, true);
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
    submit: { tool: 'submit_check', resultVersion: 2 },
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
    const parsed = parsePlan({ ...plan, submit: { tool: 'submit_check', resultVersion: 3 } });
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

  describe('the consent matchers', () => {
    const consent = {
      action: 'accept-and-reject',
      afterClickSettleMs: 2000,
      banner: { ids: ['onetrust-banner-sdk'], classes: ['cky-consent-container'], keywords: ['we use cookies'] },
      accept: { tags: ['accept-button'], ids: ['onetrust-accept-btn-handler'], classes: [], texts: ['Accept All'] },
      reject: { tags: ['reject-button'], ids: [], classes: [], texts: ['reject all'] },
    };
    const parse = (overrides: Record<string, unknown> = {}) => {
      const parsed = parsePlan({ ...plan, consent: { ...consent, ...overrides } });
      assert.ok(parsed.ok);
      return parsed.plan.consent;
    };

    test('reads the matchers and lowercases the button text', () => {
      const parsed = parse();
      assert.deepEqual(parsed?.accept.ids, ['onetrust-accept-btn-handler']);
      assert.deepEqual(parsed?.accept.texts, ['accept all']);
      assert.deepEqual(parsed?.banner.keywords, ['we use cookies']);
      assert.equal(parsed?.afterClickSettleMs, 2000);
    });

    test('anything that is not a plain identifier is dropped, so it cannot become a selector', () => {
      const parsed = parse({
        accept: {
          tags: ['accept-button"], [id^="x'],
          ids: ['a b', 'onetrust-accept-btn-handler', '#id', 'x:y', 'p(1)', 'a.b', ''],
          classes: ['*', 'cky-btn-accept'],
          texts: ['accept all'],
        },
      });
      assert.deepEqual(parsed?.accept.tags, []);
      assert.deepEqual(parsed?.accept.ids, ['onetrust-accept-btn-handler']);
      assert.deepEqual(parsed?.accept.classes, ['cky-btn-accept']);
    });

    test('button text that could end the string it is sent in is dropped', () => {
      const parsed = parse({
        accept: { tags: [], ids: [], classes: [], texts: ['accept all', 'acc ept', 'a\nb', 'x'.repeat(65)] },
      });
      assert.deepEqual(parsed?.accept.texts, ['accept all']);
    });

    test('a plan cannot push more matchers, longer matchers or a longer wait than the plugin allows', () => {
      const parsed = parse({
        afterClickSettleMs: 1e9,
        accept: { tags: [], ids: Array.from({ length: 300 }, (_, i) => `id${i}`), classes: [], texts: [] },
      });
      assert.equal(parsed?.accept.ids.length, 64);
      assert.equal(parsed?.afterClickSettleMs, 10_000);
      assert.equal(
        parse({ accept: { tags: [], ids: ['x'.repeat(65)], classes: [], texts: [] } })?.accept.ids.length,
        0,
      );
    });

    test('a plan that does not ask for the consent action presses nothing', () => {
      assert.equal(parse({ action: 'none' }), null);
      // A plan with no consent block at all, as every plan before CPL-398 was.
      const bare = parsePlan(plan);
      assert.ok(bare.ok);
      assert.equal(bare.plan.consent, null);
    });

    test('a plan with no usable matcher for either button presses nothing', () => {
      const empty = { tags: [], ids: [], classes: [], texts: [] };
      assert.equal(parse({ accept: empty, reject: empty }), null);
      // One usable button is still worth pressing: the other run just reports it was not.
      assert.ok(parse({ accept: empty }));
    });

    test('a consent block that is not an object, or is missing, is ignored rather than failing the check', () => {
      for (const value of [null, 'accept-and-reject', 42, []]) {
        const parsed = parsePlan({ ...plan, consent: value });
        assert.ok(parsed.ok);
        assert.equal(parsed.plan.consent, null);
      }
    });
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

describe('buildConsentRun', () => {
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
  const arrival = (cookies: CapturedCookie[] = [], thirdPartyHosts: string[] = []) => ({ cookies, thirdPartyHosts });
  /** A pressed run that ended with `after`, as `loadPage` reports one. */
  const pressed = (after: { cookies: CapturedCookie[]; thirdPartyHosts: string[] }) => ({
    bannerFound: true,
    rejectByDefault: false,
    pressed: true,
    matchedBy: 'id' as const,
    reason: null,
    label: 'Accept all',
    after,
  });
  const names = (cookies: { name: string }[]) => cookies.map((c) => c.name).sort();

  test('reports what the page looked like after the click, not the difference', () => {
    const run = buildConsentRun(
      pressed(arrival([cookie('_ga'), cookie('_gcl_au')], ['a.example'])),
      arrival([cookie('_ga'), cookie('_fbp')], ['b.example']),
      limits,
    );

    assert.equal(run.pressed, true);
    assert.equal(run.matchedBy, 'id');
    // Everything still set, including _ga, which the arrival reading also had:
    // the server counts these, so a surviving cookie has to be in the list.
    assert.deepEqual(names(run.cookiesAfterClick), ['_ga', '_gcl_au']);
    // And of those, only the one this run's own arrival did not have.
    assert.deepEqual(names(run.newAfterClick), ['_gcl_au']);
    // And the hosts are the run's own post-click set, whatever arrival saw.
    assert.deepEqual(run.hostsAfterClick, ['a.example']);
  });

  /**
   * The whole reason the shape changed: a host contacted on arrival that keeps
   * being contacted after reject is the finding the check exists for, and a
   * difference against arrival could never show it.
   */
  test('keeps a host that was already contacted on arrival and is contacted again', () => {
    const run = buildConsentRun(pressed(arrival([], ['tracker.example'])), arrival([], ['tracker.example']), limits);

    assert.deepEqual(run.hostsAfterClick, ['tracker.example']);
  });

  /**
   * The delta is against this run's own arrival, so a cookie that was already
   * there and survived is not reported as one the press set. That distinction
   * is what `set-after-reject` in the risk read is built on.
   */
  test('a cookie that survived the press is not reported as one the press set', () => {
    const run = buildConsentRun(pressed(arrival([cookie('_ga'), cookie('_gid')])), arrival([cookie('_ga')]), limits);

    assert.deepEqual(names(run.cookiesAfterClick), ['_ga', '_gid']);
    assert.deepEqual(names(run.newAfterClick), ['_gid']);
  });

  test('the surviving cookies are capped at the plan’s maxCookies', () => {
    const many = Array.from({ length: 10 }, (_, i) => cookie(`left${i}`));

    const run = buildConsentRun(pressed(arrival(many)), arrival(), limits);

    assert.equal(run.cookiesAfterClick.length, 3);
  });

  test('the cap never drops a cookie the press set', () => {
    const seen = Array.from({ length: 5 }, (_, i) => cookie(`seen${i}`));

    const run = buildConsentRun(pressed(arrival([...seen, cookie('_gcl_au')])), arrival(seen), limits);

    assert.equal(run.cookiesAfterClick.length, 3);
    assert.ok(names(run.cookiesAfterClick).includes('_gcl_au'));
    assert.deepEqual(names(run.newAfterClick), ['_gcl_au']);
  });

  test('hosts after the click are capped, lowercased and deduplicated', () => {
    const run = buildConsentRun(
      pressed(arrival([], ['B.example', 'b.example', 'c.example', 'd.example'])),
      arrival(),
      limits,
    );

    assert.deepEqual(run.hostsAfterClick, ['b.example', 'c.example']);
  });

  test('a cookie or host the server would refuse is left out here too', () => {
    const run = buildConsentRun(
      pressed(arrival([cookie('x'.repeat(21)), cookie('a=b'), cookie('_ga')], ['https://evil.example/path'])),
      arrival(),
      limits,
    );

    assert.deepEqual(names(run.cookiesAfterClick), ['_ga']);
    assert.deepEqual(run.hostsAfterClick, []);
  });

  test('a run whose own load failed says so, rather than that the page has no banner', () => {
    const run = buildConsentRun(null, arrival(), limits);

    assert.equal(run.pressed, false);
    assert.equal(run.reason, 'load-failed');
    assert.deepEqual(run.cookiesAfterClick, []);
  });

  test('a run that found no button keeps its own reason', () => {
    const run = buildConsentRun(
      {
        bannerFound: true,
        rejectByDefault: false,
        pressed: false,
        matchedBy: null,
        reason: 'ambiguous-button',
        label: null,
        after: null,
      },
      arrival(),
      limits,
    );

    assert.equal(run.reason, 'ambiguous-button');
  });
});

describe('buildConsent', () => {
  const limits: Limits = {
    maxCookies: 10,
    maxCookieNameLength: 128,
    maxCookieDomainLength: 253,
    maxCookiePathLength: 128,
    maxThirdPartyHosts: 10,
    maxHostLength: 253,
  };
  const empty = { cookies: [], thirdPartyHosts: [] };
  const attempt = (over: Record<string, unknown> = {}) => ({
    bannerFound: true,
    rejectByDefault: false,
    pressed: true,
    matchedBy: 'id' as const,
    reason: null,
    label: null,
    after: empty,
    ...over,
  });

  test('a failed run beside a successful one still reports the banner the other found', () => {
    const consent = buildConsent({ attempt: null, arrival: empty }, { attempt: attempt(), arrival: empty }, limits);

    assert.equal(consent.bannerFound, true, 'the reject run saw the banner');
    assert.equal(consent.accept.reason, 'load-failed');
    assert.notEqual(consent.accept.reason, 'no-banner');
    assert.equal(consent.tested, true);
  });

  test('rejectByDefault is carried through from whichever run saw it', () => {
    const consent = buildConsent(
      { attempt: attempt({ rejectByDefault: true }), arrival: empty },
      { attempt: attempt(), arrival: empty },
      limits,
    );

    assert.equal(consent.rejectByDefault, true);
    // Reported, never a reason not to press: the reject run still ran.
    assert.equal(consent.reject.pressed, true);
  });

  test('neither run pressing means the consent action was not tested', () => {
    const consent = buildConsent(
      { attempt: attempt({ pressed: false, reason: 'no-banner', after: null, bannerFound: false }), arrival: empty },
      { attempt: attempt({ pressed: false, reason: 'no-banner', after: null, bannerFound: false }), arrival: empty },
      limits,
    );

    assert.equal(consent.tested, false);
    assert.equal(consent.bannerFound, false);
  });
});

describe('submit_check results and the rendered forms', () => {
  const dataDir = () => mkdtempSync(join(tmpdir(), 'cookiepal-results-'));
  const CHECK_ID = '11111111-2222-4333-8444-555555555555';
  const result = { checkId: CHECK_ID, page: 'https://example.com/', cookies: [], thirdPartyHosts: [] };
  const payload = (over: Record<string, unknown> = {}) => ({
    tool_name: 'submit_check',
    tool_input: { checkId: CHECK_ID },
    tool_response: { structuredContent: result },
    ...over,
  });

  test('the hook stores the result, and it survives being read twice', () => {
    const dir = dataDir();
    assert.equal(saveResult(dir, payload()), true);
    assert.deepEqual(readResult(dir, CHECK_ID), result);
    assert.deepEqual(readResult(dir, CHECK_ID), result, 'a result is not consumed by reading it');
    rmSync(dir, { recursive: true, force: true });
  });

  test('a response with no valid check ID is ignored rather than stored', () => {
    const dir = dataDir();
    assert.equal(saveResult(dir, payload({ tool_response: { structuredContent: { checkId: 'nope' } } })), false);
    assert.equal(saveResult(dir, 'not an object'), false);
    assert.equal(readResult(dir, CHECK_ID), null);
    rmSync(dir, { recursive: true, force: true });
  });

  test('a result past the 30-minute window is not returned, and is deleted', () => {
    const dir = dataDir();
    saveResult(dir, payload());
    const path = join(dir, 'results', `${CHECK_ID}.json`);
    const old = Date.now() / 1000 - 31 * 60;
    utimesSync(path, old, old);
    assert.equal(readResult(dir, CHECK_ID), null);
    assert.equal(existsSync(path), false);
    rmSync(dir, { recursive: true, force: true });
  });

  test('readResult refuses anything that is not a check ID', () => {
    const dir = dataDir();
    saveResult(dir, payload());
    for (const bad of ['', '../../etc/passwd', 'not-a-uuid']) assert.equal(readResult(dir, bad), null);
    rmSync(dir, { recursive: true, force: true });
  });

  test('writeRendered writes each form under the check, and refuses a bad id or name', () => {
    const dir = dataDir();
    const path = writeRendered(dir, CHECK_ID, 'report.html', '<p>hi</p>');
    assert.ok(path);
    assert.equal(readFileSync(path, 'utf8'), '<p>hi</p>');
    assert.equal(path, join(dir, 'reports', CHECK_ID, 'report.html'));
    assert.equal(writeRendered(dir, 'not-a-uuid', 'report.html', 'x'), null);
    for (const bad of ['../escape.html', 'report', 'a/b.html', 'Report.HTML']) {
      assert.equal(writeRendered(dir, CHECK_ID, bad, 'x'), null, bad);
    }
    rmSync(dir, { recursive: true, force: true });
  });

  test('a sweep deletes an expired report directory, not only loose files', () => {
    const dir = dataDir();
    for (const name of ['artifact.html', 'report.html', 'report.md']) writeRendered(dir, CHECK_ID, name, 'x');
    const reportDir = join(dir, 'reports', CHECK_ID);
    assert.equal(existsSync(reportDir), true);
    const old = Date.now() / 1000 - 31 * 60;
    utimesSync(reportDir, old, old);
    sweep(dir);
    assert.equal(existsSync(reportDir), false, 'reports/ holds directories, so the sweep must recurse');
    rmSync(dir, { recursive: true, force: true });
  });

  test('a sweep leaves a report that is still inside the window', () => {
    const dir = dataDir();
    writeRendered(dir, CHECK_ID, 'report.html', 'x');
    sweep(dir);
    assert.equal(existsSync(join(dir, 'reports', CHECK_ID, 'report.html')), true);
    rmSync(dir, { recursive: true, force: true });
  });
});
