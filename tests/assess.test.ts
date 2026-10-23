import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, test } from 'node:test';
import { assess } from '../src/assess.ts';
import { LAW_KEYS } from '../src/laws.ts';
import { renderInventory, renderMarkdownDocument, renderTerminal } from '../src/markdown.ts';
import { fallbacksFor, OUTPUT_MODES, readOutput, setOutput } from '../src/output.ts';
import { renderDocument, renderReport } from '../src/report.ts';

const cookie = (name: string, category: string, domain = '.example.com') => ({
  name,
  domain,
  path: '/',
  expires: 1_800_000_000,
  httpOnly: false,
  secure: true,
  category,
});

const byCategory = (counts: Record<string, number>) => ({
  necessary: 0,
  functional: 0,
  analytics: 0,
  performance: 0,
  advertisement: 0,
  other: 0,
  ...counts,
});

/** A result shaped exactly as `submit_check` returns it. */
const result = (over: Record<string, unknown> = {}) => ({
  resultVersion: 1,
  checkId: '11111111-2222-4333-8444-555555555555',
  page: 'https://example.com/pricing',
  country: 'Brazil',
  checkedAt: '2026-10-02T12:00:00.000Z',
  cookies: [cookie('sessionid', 'necessary', 'example.com')],
  thirdPartyHosts: [],
  truncated: false,
  summary: { total: 1, byCategory: byCategory({ necessary: 1 }), afterReject: undefined },
  consent: { tested: false, bannerFound: false },
  ...over,
});

const tracked = () =>
  result({
    cookies: [cookie('sessionid', 'necessary', 'example.com'), cookie('_ga', 'analytics')],
    summary: { total: 2, byCategory: byCategory({ necessary: 1, analytics: 1 }) },
  });

/** A tested consent action whose reject press left `cookies` set, `added` among them, and `hosts` contacted. */
const afterReject = (cookies: unknown[], added: unknown[], hosts: string[] = []) =>
  result({
    summary: {
      total: 1,
      byCategory: byCategory({ necessary: 1 }),
      afterReject: { total: cookies.length, byCategory: byCategory({}), stillContactedHosts: hosts },
    },
    consent: {
      tested: true,
      bannerFound: true,
      accept: { pressed: true, cookiesAfterClick: [], newAfterClick: [], hostsAfterClick: [] },
      reject: { pressed: true, cookiesAfterClick: cookies, newAfterClick: added, hostsAfterClick: hosts },
    },
  });

const findingOf = (raw: unknown, kind: string) => {
  const found = assess(raw).findings.find((entry) => entry.kind === kind);
  assert.ok(found, `expected a ${kind} finding`);
  return found;
};

describe('assess', () => {
  test('every finding carries a separate explanation for GDPR, CCPA, LGPD and Law 25', () => {
    const assessment = assess(
      tracked() && {
        ...tracked(),
        thirdPartyHosts: ['www.google-analytics.com'],
      },
    );
    assert.ok(assessment.findings.length > 0);
    for (const finding of assessment.findings) {
      assert.deepEqual(
        finding.byLaw.map(({ law }) => law),
        [...LAW_KEYS],
      );
      const texts = finding.byLaw.map(({ text }) => text);
      assert.equal(new Set(texts).size, texts.length, 'each law gets its own wording, never one shared line');
      for (const text of texts) assert.ok(text.length > 20);
    }
  });

  test('a cookie set before consent is explained under each law it matters for', () => {
    const finding = findingOf(tracked(), 'tracking-before-consent');
    const applies = Object.fromEntries(finding.byLaw.map(({ law, applies: on }) => [law, on]));
    assert.deepEqual(applies, { gdpr: true, lgpd: true, law25: true, ccpa: false });
  });

  test('a finding that only matters under opt-in laws is not a problem under the CCPA', () => {
    const ccpa = findingOf(tracked(), 'tracking-before-consent').byLaw.find(({ law }) => law === 'ccpa');
    assert.equal(ccpa?.applies, false);
    assert.match(ccpa?.text ?? '', /not a finding under california law/i);
    assert.match(ccpa?.text ?? '', /does not ask for permission before tracking/i);
  });

  test('tracking still active after reject is explained, and is a finding under the CCPA too', () => {
    const raw = () =>
      result({
        cookies: [cookie('_ga', 'analytics')],
        summary: {
          total: 1,
          byCategory: byCategory({ analytics: 1 }),
          afterReject: {
            total: 1,
            byCategory: byCategory({ analytics: 1 }),
            stillContactedHosts: ['www.google-analytics.com'],
          },
        },
        consent: {
          tested: true,
          bannerFound: true,
          accept: { pressed: true, cookiesAfterClick: [], newAfterClick: [], hostsAfterClick: [] },
          reject: {
            pressed: true,
            cookiesAfterClick: [cookie('_ga', 'analytics')],
            newAfterClick: [],
            hostsAfterClick: ['www.google-analytics.com'],
          },
        },
      });
    const finding = findingOf(raw(), 'active-after-reject');
    assert.ok(finding.byLaw.every(({ applies }) => applies));
    assert.match(finding.detail, /still set/);
    assert.deepEqual(
      finding.cookies.map(({ name }) => name),
      ['_ga'],
    );
    // A host is its own, milder finding: it may be the banner recording the refusal.
    assert.deepEqual(finding.hosts, []);
    const contacted = findingOf(raw(), 'contacted-after-reject');
    assert.deepEqual(contacted.hosts, ['www.google-analytics.com']);
    assert.match(contacted.shape ?? '', /cannot tell which of them carry tracking/);
  });

  test('a host contacted after reject never reads as tracking still active', () => {
    const assessment = assess(afterReject([], [], ['consent.cookiebot.com']));
    assert.ok(!assessment.findings.some(({ kind }) => kind === 'active-after-reject'));
    assert.ok(assessment.findings.some(({ kind }) => kind === 'contacted-after-reject'));
  });

  /**
   * The whole point of keeping a delta: a cookie that was already there and
   * survived the reject is reported by `active-after-reject`, not as one the
   * press set. Reading `cookiesAfterClick` here instead would accuse every
   * banner that fails to clear a cookie of actively setting it.
   */
  test('a cookie that merely survived reject is not reported as set by it', () => {
    const assessment = assess(
      result({
        cookies: [cookie('_ga', 'analytics')],
        // What the server computes from the reject run's own reading.
        summary: {
          total: 1,
          byCategory: byCategory({ analytics: 1 }),
          afterReject: { total: 1, byCategory: byCategory({ analytics: 1 }), stillContactedHosts: [] },
        },
        consent: {
          tested: true,
          bannerFound: true,
          accept: { pressed: true, cookiesAfterClick: [], newAfterClick: [], hostsAfterClick: [] },
          reject: {
            pressed: true,
            // Still set after the press, but it was there on arrival too.
            cookiesAfterClick: [cookie('_ga', 'analytics')],
            newAfterClick: [],
            hostsAfterClick: [],
          },
        },
      }),
    );

    assert.equal(
      assessment.findings.some(({ kind }) => kind === 'set-after-reject'),
      false,
    );
    // And the broader finding does fire, so the page is still reported.
    assert.ok(assessment.findings.some(({ kind }) => kind === 'active-after-reject'));
  });

  test('a cookie set by pressing reject is its own finding', () => {
    const finding = findingOf(
      result({
        consent: {
          tested: true,
          bannerFound: true,
          accept: { pressed: true, cookiesAfterClick: [], newAfterClick: [], hostsAfterClick: [] },
          reject: {
            pressed: true,
            cookiesAfterClick: [cookie('_gid', 'analytics')],
            newAfterClick: [cookie('_gid', 'analytics')],
            hostsAfterClick: [],
          },
        },
      }),
      'set-after-reject',
    );
    assert.deepEqual(
      finding.cookies.map(({ name }) => name),
      ['_gid'],
    );
    assert.ok(finding.byLaw.every(({ applies }) => applies));
  });

  test('an unknown cookie set by pressing reject is counted under the unidentified finding', () => {
    const assessment = assess(afterReject([cookie('wpx_tok', 'other')], [cookie('wpx_tok', 'other')]));
    assert.equal(assessment.clean, false, 'reject did set something, so the read is not clean');
    const finding = findingOf(
      afterReject([cookie('wpx_tok', 'other')], [cookie('wpx_tok', 'other')]),
      'unidentified-cookies',
    );
    assert.match(
      finding.detail,
      /^1 cookie present after the reject button was pressed was not in the open-source catalogue/,
    );
    assert.deepEqual(
      finding.listed.cookies.map(({ name }) => name),
      ['wpx_tok'],
    );
  });

  test('beside known ones, an unknown cookie set by reject is pointed to, not left out', () => {
    const raw = afterReject(
      [cookie('_gid', 'analytics'), cookie('wpx_tok', 'other')],
      [cookie('_gid', 'analytics'), cookie('wpx_tok', 'other')],
    );
    assert.match(findingOf(raw, 'set-after-reject').shape ?? '', /Another 1 the catalogue does not know is counted/);
    assert.match(findingOf(raw, 'unidentified-cookies').detail, /^1 cookie present after the reject button/);
  });

  test('an unknown cookie still set after reject is counted, even when arrival never had it', () => {
    // The reject run is its own load: it had wpx_track before the press, the main arrival did not.
    const assessment = assess(afterReject([cookie('wpx_track', 'other')], []));
    assert.equal(assessment.clean, false);
    const finding = findingOf(afterReject([cookie('wpx_track', 'other')], []), 'unidentified-cookies');
    assert.deepEqual(
      finding.listed.cookies.map(({ name }) => name),
      ['wpx_track'],
    );
  });

  test('an unknown cookie on arrival that survives reject is counted once, and said to survive', () => {
    const raw = result({
      cookies: [cookie('wpx', 'other')],
      consent: {
        tested: true,
        bannerFound: true,
        reject: { pressed: true, cookiesAfterClick: [cookie('wpx', 'other')], newAfterClick: [cookie('wpx', 'other')] },
      },
    });
    const finding = findingOf(raw, 'unidentified-cookies');
    assert.equal(finding.cookies.length, 1);
    assert.equal(
      finding.groups.reduce((total, { count }) => total + count, 0),
      1,
    );
    assert.match(finding.detail, /After the reject button was pressed, 1 unknown cookie was present\./);
  });

  test('a cookie the arrival had is still set after reject, never also set by it', () => {
    // The reject run's own arrival lacked _gid, so its delta says new; the read's arrival had it.
    const raw = result({
      cookies: [cookie('_gid', 'analytics')],
      consent: {
        tested: true,
        bannerFound: true,
        reject: {
          pressed: true,
          cookiesAfterClick: [cookie('_gid', 'analytics')],
          newAfterClick: [cookie('_gid', 'analytics')],
        },
      },
    });
    const assessment = assess(raw);
    assert.ok(!assessment.findings.some(({ kind }) => kind === 'set-after-reject'));
    assert.ok(assessment.findings.some(({ kind }) => kind === 'active-after-reject'));
  });

  test('a cookie the press set is not also reported as still set', () => {
    const assessment = assess(afterReject([cookie('_gid', 'analytics')], [cookie('_gid', 'analytics')]));
    assert.ok(assessment.findings.some(({ kind }) => kind === 'set-after-reject'));
    assert.ok(!assessment.findings.some(({ kind }) => kind === 'active-after-reject'));
  });

  test('a truncated clean result says it covers only what the check could read', () => {
    const assessment = assess(result({ truncated: true }));
    assert.equal(assessment.clean, true);
    for (const text of [renderTerminal(assessment), renderReport(assessment)]) {
      assert.match(text, /hit its size limits, so this covers only what it could read/);
    }
  });

  test('a clean result says what was checked and what was not', () => {
    const assessment = assess(result());
    assert.equal(assessment.clean, true);
    assert.deepEqual(assessment.findings, []);
    assert.match(assessment.scope, /one page, loaded once, from one country/);
    assert.equal(assessment.laws.length, 4);
    assert.ok(assessment.notes.some((note) => /consent action/i.test(note)));
  });

  test('an untested consent action is a note, never a finding', () => {
    const assessment = assess(tracked());
    assert.ok(!assessment.findings.some(({ kind }) => kind.includes('reject')));
    assert.ok(assessment.notes.some((note) => /before any button was pressed/i.test(note)));
  });

  test('unidentified cookies are their own finding, and never an accusation', () => {
    const finding = findingOf(
      result({
        cookies: [cookie('wpx_tok', 'other'), cookie('_ga', 'analytics')],
        summary: { total: 2, byCategory: byCategory({ other: 1, analytics: 1 }) },
      }),
      'unidentified-cookies',
    );
    assert.match(finding.detail, /1 of the 2 cookies set before consent was not in the open-source catalogue/);
    assert.match(finding.shape ?? '', /limit of the open-source catalogue, not evidence that the cookie tracks/);
    assert.ok(
      finding.byLaw.every(({ applies }) => applies),
      'every law expects a site to account for what it sets',
    );
  });

  test('a cookie the catalogue does not know is not counted as not strictly necessary', () => {
    const assessment = assess(
      result({ cookies: [cookie('wpx_tok', 'other')], summary: { total: 1, byCategory: byCategory({ other: 1 }) } }),
    );
    assert.ok(!assessment.findings.some(({ kind }) => kind === 'tracking-before-consent'));
    assert.ok(assessment.findings.some(({ kind }) => kind === 'unidentified-cookies'));
  });

  test('a cookie the catalogue files as other is known, so it is not unidentified', () => {
    const assessment = assess(
      result({
        cookies: [cookie('__Secure-ENID', 'other')],
        summary: { total: 1, byCategory: byCategory({ other: 1 }) },
      }),
    );
    assert.ok(assessment.findings.some(({ kind }) => kind === 'tracking-before-consent'));
    assert.ok(!assessment.findings.some(({ kind }) => kind === 'unidentified-cookies'));
  });

  test('findings carry the shape of what was found, so nothing has to be truncated', () => {
    const many = Array.from({ length: 30 }, (_, i) => cookie(`_ga_${i}`, 'analytics'));
    const finding = findingOf(
      result({ cookies: many, summary: { total: 30, byCategory: byCategory({ analytics: 30 }) } }),
      'tracking-before-consent',
    );
    assert.ok(finding.groups.length > 0);
    assert.equal(
      finding.groups.reduce((total, { count }) => total + count, 0),
      30,
      'the groups must account for every cookie, not a sample',
    );
    assert.equal(finding.cookies.length, 30, 'the finding still carries them all for the inventory');
  });

  test('hosts are grouped by the public suffix list, private suffixes included', () => {
    const finding = findingOf(
      result({ thirdPartyHosts: ['jack.github.io', 'other.github.io', 'cdn.example.co.uk'] }),
      'hosts-before-consent',
    );
    assert.deepEqual(finding.groups, [
      { label: 'example.co.uk', count: 1 },
      { label: 'jack.github.io', count: 1 },
      { label: 'other.github.io', count: 1 },
    ]);
  });

  test('the GDPR line carries the ePrivacy device storage rule, labelled as ePrivacy', () => {
    const gdpr = findingOf(tracked(), 'tracking-before-consent').byLaw.find(({ law }) => law === 'gdpr');
    assert.match(gdpr?.text ?? '', /Under the ePrivacy Directive art\. 5\(3\), which applies alongside the GDPR/);
    assert.match(
      assess(result()).laws.find(({ law }) => law === 'gdpr')?.asks ?? '',
      /ePrivacy Directive art\. 5\(3\)/,
    );
  });

  test('hosts are grouped by registrable domain, including multi-part suffixes', () => {
    const finding = findingOf(
      result({ thirdPartyHosts: ['a.pubmatic.com', 'b.pubmatic.com', 'x.uol.com.br'] }),
      'hosts-before-consent',
    );
    assert.deepEqual(finding.groups, [
      { label: 'pubmatic.com', count: 2 },
      { label: 'uol.com.br', count: 1 },
    ]);
    assert.match(finding.shape ?? '', /not the same as by owner/);
  });

  test('the inventory holds every cookie and host, with vendors resolved locally', () => {
    const assessment = assess(
      result({
        cookies: [cookie('_ga', 'analytics'), cookie('sessionid', 'necessary', 'example.com')],
        thirdPartyHosts: ['www.google-analytics.com'],
        summary: { total: 2, byCategory: byCategory({ analytics: 1, necessary: 1 }) },
      }),
    );
    assert.equal(assessment.inventory.cookies.length, 2, 'necessary cookies are in the inventory too');
    assert.equal(assessment.inventory.cookies.find(({ name }) => name === '_ga')?.vendor, 'Google Analytics');
    assert.deepEqual(assessment.inventory.hosts, [
      { host: 'www.google-analytics.com', domain: 'google-analytics.com' },
    ]);
  });

  test('the Law 25 caveat rides along with any Law 25 finding', () => {
    assert.ok(assess(tracked()).notes.some((note) => /Law 25 does not use the word/.test(note)));
  });

  test('a missing, partial or hostile result is read as absent rather than thrown', () => {
    for (const raw of [null, undefined, 'text', [], {}, { cookies: 'no', summary: 7, consent: null }]) {
      const assessment = assess(raw);
      assert.equal(assessment.clean, true);
      assert.equal(assessment.laws.length, 4);
    }
    const assessment = assess({ cookies: [{ name: '_ga', domain: '.x.com', category: 'invented' }] });
    assert.equal(assessment.checked.cookies, 0, 'a category outside the catalogue is dropped, not trusted');
  });

  test('no output calls a site compliant or non-compliant', () => {
    const assessment = assess(tracked());
    const everything = JSON.stringify(assessment) + renderReport(assessment);
    assert.ok(!/\bcompliant\b/i.test(everything));
    assert.ok(!/\bnon-compliant\b/i.test(everything));
    assert.match(assessment.noVerdict, /not a compliance verdict and not legal advice/);
  });

  test('the risk read reaches no network', () => {
    for (const file of ['src/assess.ts', 'src/laws.ts', 'src/report.ts', 'src/markdown.ts', 'src/output.ts']) {
      const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
      assert.ok(!/\bfetch\s*\(|node:https?|XMLHttpRequest|require\(['"]https?/.test(source), file);
      assert.ok(!/https?:\/\/(?!fonts\.(googleapis|gstatic)\.com|www\.w3\.org|cai\.gouv\.qc\.ca)/.test(source), file);
    }
  });
});

describe('what reject left behind', () => {
  const raw = () =>
    afterReject(
      [cookie('_ga', 'analytics'), cookie('_gid', 'analytics')],
      [cookie('_gid', 'analytics')],
      ['www.google-analytics.com'],
    );

  test('every file names the cookies and hosts, which the arrival inventory does not hold', () => {
    const assessment = assess(raw());
    for (const [form, text] of [
      ['markdown', renderMarkdownDocument(assessment)],
      ['artifact', renderReport(assessment)],
      ['html', renderDocument(assessment)],
    ]) {
      assert.match(text, /Read after the reject button was pressed/, form);
      for (const name of ['_ga', '_gid', 'www.google-analytics.com'])
        assert.ok(text.includes(name), `${form}: ${name}`);
    }
  });

  // The terminal reads them by vendor, as it does the arrival, and says where the rows are.
  test('the terminal groups them by vendor, names the hosts and points to the files for the rows', () => {
    const text = renderTerminal(assess(raw()));
    assert.match(text, /\| Vendor \| Cookies \|/);
    assert.match(text, /listed in full in the HTML and Markdown read/);
    assert.ok(text.includes('www.google-analytics.com'));
  });

  test('a reject that leaves 78 cookies behind prints a vendor table, not 78 rows', () => {
    const many = Array.from({ length: 78 }, (_, index) => cookie(`_ga_${index}`, 'analytics'));
    const assessment = assess(afterReject(many, []));
    const terminal = renderTerminal(assessment);
    // As Markdown writes the name: `_` is escaped so a name cannot style the text around it.
    const lastRow = '\\_ga\\_77';
    assert.ok(!terminal.includes(lastRow), 'the terminal printed every row');
    assert.match(terminal, /\| Vendor \| Cookies \|/);
    assert.ok(renderMarkdownDocument(assessment).includes(lastRow), 'the file dropped a row');
  });

  test('the page does not send them to the arrival inventory', () => {
    const html = renderReport(assess(raw()));
    const block = (title: string) => {
      const start = html.indexOf(title);
      return html.slice(start, html.indexOf('</article>', start));
    };
    assert.ok(!block('Tracking was still active after').includes('href="#inventory'));
    assert.ok(!block('New cookies were set by pressing reject').includes('href="#inventory'));
  });
});

describe('the vendor column', () => {
  const inventory = () =>
    assess(
      result({
        cookies: [cookie('OptanonConsent', 'performance'), cookie('zz_mystery', 'other')],
        summary: { total: 2, byCategory: byCategory({ performance: 1, other: 1 }) },
      }),
    );

  test('says no vendor named for a known cookie, and not recognised only for an unknown one', () => {
    const md = renderInventory(inventory());
    assert.match(md, /\| OptanonConsent \|[^\n]*_no vendor named_ \|/);
    assert.match(md, /\| zz\\_mystery \|[^\n]*_not recognised_ \|/);
    const html = renderReport(inventory());
    assert.match(html, /OptanonConsent<\/td>(?:(?!<\/tr>).)*no vendor named/);
    assert.match(html, /zz_mystery<\/td>(?:(?!<\/tr>).)*not recognised/);
  });
});

describe('renderReport', () => {
  const page = () => renderReport(assess(tracked()));

  test('is a fragment the artifact publisher can wrap, with a name for a title', () => {
    const html = page();
    assert.ok(!/<!doctype|<html[\s>]|<head[\s>]|<body[\s>]/i.test(html));
    assert.match(html, /<title>example\.com cookie check<\/title>/);
    assert.ok(html.indexOf('<title>') < 8192, 'the title must be in the first 8KB that is scanned for it');
  });

  test('defines every colour token on bare :root before the dark blocks redefine them', () => {
    const html = page();
    const root = html.slice(html.indexOf(':root {'), html.indexOf('@media (prefers-color-scheme: dark)'));
    for (const token of ['--bg', '--surface', '--ink', '--body', '--muted', '--line', '--brand', '--flag']) {
      assert.ok(root.includes(`${token}:`), `${token} must exist in the light palette`);
    }
    assert.match(html, /:root:not\(\[data-theme="light"\]\)/);
    assert.match(html, /:root\[data-theme="dark"\]/);
    assert.match(html, /body \{[^}]*background: var\(--bg\)/);
  });

  test('loads nothing the artifact policy blocks: no external image, script or stylesheet but fonts', () => {
    const html = page();
    assert.ok(!/<script/i.test(html), 'the page needs no script at all');
    assert.ok(!/<img|background-image/i.test(html), 'the mark is inline SVG, since external images are blocked');
    const sheets = [...html.matchAll(/<link[^>]+href="([^"]+)"/g)].map(([, href]) => href);
    for (const href of sheets) assert.match(href, /^https:\/\/fonts\.(googleapis|gstatic)\.com/);
  });

  test('escapes everything read off the page', () => {
    const html = renderReport(
      assess(
        result({
          page: 'https://evil.test/"><script>x()</script>',
          cookies: [cookie('<img src=x onerror=alert(1)>', 'analytics', 'a"b.test')],
          thirdPartyHosts: ['<b>host</b>'],
          summary: { total: 1, byCategory: byCategory({ analytics: 1 }) },
        }),
      ),
    );
    assert.ok(!html.includes('<script>x()'));
    assert.ok(!html.includes('<img src=x'));
    assert.ok(!html.includes('<b>host</b>'));
    assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  });

  test('a clean result renders the clean block and still names every law', () => {
    const html = renderReport(assess(result()));
    assert.match(html, /Nothing was flagged on this page/);
    assert.match(html, /What each law asks for/);
    for (const name of ['GDPR', 'CCPA and CPRA', 'LGPD', 'Law 25']) assert.ok(html.includes(name), name);
  });

  test('leads with the grid, and marks the law a finding is not a problem under', () => {
    const html = page();
    assert.ok(html.indexOf('What was found, against each law') < html.indexOf('class="finding'));
    assert.match(html, /class="mark-cell yes">flagged</);
    assert.match(html, /class="mark-cell no">&#8212;</);
    assert.match(html, /class="lawline off"/);
    assert.ok(!html.includes('What each law asks for'), 'the reference block belongs only to a clean result');
  });

  test('draws the top groups inline and sends the rest to the inventory', () => {
    const hosts = Array.from({ length: 12 }, (_, i) => `h${i}.vendor${i}.com`);
    const html = renderReport(assess(result({ thirdPartyHosts: hosts })));
    assert.match(html, /\+ 4 more, listed in full below\./);
    assert.match(html, /id="inventory-hosts"/);
    for (const host of hosts) assert.ok(html.includes(host), host);
  });

  test('the inventory scrolls, and says so, with a scrollbar drawn before hover', () => {
    const many = Array.from({ length: 40 }, (_, i) => `h${i}.example-${i}.test`);
    const html = renderReport(assess(result({ thirdPartyHosts: many })));
    assert.match(
      html,
      /40 in total, none left out &#8212; scroll for the rest|40 in total, none left out — scroll for the rest/,
    );
    assert.match(html, /\.invbox::-webkit-scrollbar \{/, 'styling the webkit scrollbar opts out of macOS overlay bars');
    assert.match(html, /scrollbar-width: thin/);
    assert.match(html, /End of 40 hosts/);
    for (const host of many) assert.ok(html.includes(host), host);
  });

  test('a short inventory is not told to scroll', () => {
    const html = renderReport(assess(result({ thirdPartyHosts: ['a.test', 'b.test'] })));
    assert.match(html, /2 in total</);
    assert.ok(!html.includes('scroll for the rest'));
  });
});

describe('renderTerminal', () => {
  const read = (over: Record<string, unknown> = {}) => renderTerminal(assess({ ...tracked(), ...over }));

  test('prints the findings with every law in its own words, worst first', () => {
    const text = read({
      cookies: [cookie('_ga', 'analytics')],
      summary: {
        total: 1,
        byCategory: byCategory({ analytics: 1 }),
        afterReject: { total: 1, byCategory: byCategory({ analytics: 1 }), stillContactedHosts: [] },
      },
      consent: {
        tested: true,
        bannerFound: true,
        accept: { pressed: true, cookiesAfterClick: [], newAfterClick: [], hostsAfterClick: [] },
        reject: {
          pressed: true,
          cookiesAfterClick: [cookie('_ga', 'analytics')],
          newAfterClick: [],
          hostsAfterClick: [],
        },
      },
    });
    const reject = text.indexOf('still active after the visitor pressed reject');
    const arrival = text.indexOf('set before the visitor agreed');
    assert.ok(reject >= 0 && arrival >= 0, 'both findings are there');
    assert.ok(reject < arrival, 'the reject finding leads');
    for (const name of ['GDPR', 'CCPA and CPRA', 'LGPD', 'Law 25']) assert.ok(text.includes(`**${name}**`), name);
  });

  test('is laid out for a terminal, not as the page in plain text', () => {
    const text = read();
    assert.ok(!text.includes('<'), 'no markup');
    assert.ok(!text.includes('flagged |'), 'no law-by-finding grid: it needs five columns to read');
    assert.ok(!/█|▇|▆/.test(text), 'no bars');
    assert.match(text, /^## CookiePal check: /);
  });

  test('the inventory offer reads right for none, one and many', () => {
    assert.match(read(), /list all 2 cookies\._/);
    assert.match(
      renderTerminal(assess(result({ thirdPartyHosts: ['x.test'] }))),
      /list the 1 cookie and the 1 host\._/,
    );
  });

  test('a part that is the whole is not counted as one of itself', () => {
    const raw = result({
      cookies: [cookie('wpx', 'other')],
      summary: { total: 1, byCategory: byCategory({ other: 1 }) },
    });
    assert.match(findingOf(raw, 'unidentified-cookies').detail, /^The 1 cookie set before consent was not/);
  });

  test('never prints the inventory unasked, but says it is there', () => {
    const text = read();
    assert.match(text, /Ask for the full inventory/);
    assert.ok(!text.includes('Every cookie set before consent'));
  });

  test('the group table is headed by what it counts, and accounts for every row', () => {
    const text = renderTerminal(
      assess(
        result({
          cookies: [cookie('_ga', 'analytics'), cookie('_fbp', 'advertisement'), cookie('zz_mystery', 'other')],
          thirdPartyHosts: ['a.pubmatic.com', 'b.pubmatic.com'],
          summary: { total: 3, byCategory: byCategory({ analytics: 1, advertisement: 1, other: 1 }) },
        }),
      ),
    );
    assert.match(text, /\| Vendor \| Cookies \|/);
    assert.match(text, /\| Cookie domain \| Cookies \|/);
    assert.match(text, /\| Domain \| Hosts \|/);
    assert.match(text, /Another 1 the catalogue does not know is counted under the next finding/);
  });

  test('a backslash before a pipe cannot undo its escape', () => {
    const text = renderInventory(
      assess(result({ cookies: [cookie('a\\|b', 'analytics')], summary: { total: 1, byCategory: byCategory({}) } })),
    );
    const row = text.split('\n').find((line) => line.includes('a\\')) ?? '';
    // A pipe is a cell border unless an odd number of backslashes stands before it.
    const borders = [...row.matchAll(/(\\*)\|/g)].filter(([, slashes]) => slashes.length % 2 === 0).length;
    assert.equal(borders, 5, `the row keeps its four cells: ${row}`);
  });

  test('the page cannot turn the heading into a link', () => {
    const text = renderTerminal(assess(result({ page: 'https://example.com/[Click here](https://evil.test)' })));
    assert.ok(text.includes('\\[Click here\\]\\(https://evil.test\\)'), text.split('\n')[0]);
  });

  test('a cookie name with a pipe cannot break the table it sits in', () => {
    const text = renderInventory(
      assess(
        result({
          cookies: [cookie('a|b', 'analytics')],
          summary: { total: 1, byCategory: byCategory({ analytics: 1 }) },
        }),
      ),
    );
    assert.ok(text.includes('a\\|b'));
  });

  test('a clean result never says reject left nothing running when reject was not pressed', () => {
    const notPressed = assess(
      result({
        consent: {
          tested: true,
          bannerFound: true,
          accept: { pressed: true, cookiesAfterClick: [], newAfterClick: [], hostsAfterClick: [] },
          reject: {
            pressed: false,
            reason: 'no-button',
            cookiesAfterClick: [],
            newAfterClick: [],
            hostsAfterClick: [],
          },
        },
      }),
    );
    for (const text of [renderTerminal(notPressed), renderReport(notPressed)]) {
      assert.doesNotMatch(text, /left nothing running/);
      assert.match(text, /reject button was not pressed/);
    }
  });

  test('a clean result names every law and still gives the scope', () => {
    const text = renderTerminal(assess(result()));
    assert.match(text, /Nothing was flagged/);
    for (const name of ['GDPR', 'CCPA and CPRA', 'LGPD', 'Law 25']) assert.ok(text.includes(`**${name}**`), name);
    assert.match(text, /\*\*Scope\.\*\*/);
    assert.match(text, /\*\*Not a verdict\.\*\*/);
  });

  test('no terminal output calls a site compliant', () => {
    const text = renderTerminal(assess(tracked())) + renderInventory(assess(tracked()));
    assert.ok(!/\bcompliant\b/i.test(text));
  });

  test('the inventory prints both tables in full', () => {
    const text = renderInventory(
      assess(
        result({
          cookies: [cookie('_ga', 'analytics'), cookie('zz_mystery', 'other')],
          thirdPartyHosts: ['x.test'],
          summary: { total: 2, byCategory: byCategory({ analytics: 1, other: 1 }) },
        }),
      ),
    );
    assert.match(text, /Every cookie set before consent \(2\)/);
    assert.match(text, /Every third-party host contacted before consent \(1\)/);
    assert.match(text, /Google Analytics/);
    assert.match(text, /_not recognised_/);
  });
});

describe('output preference', () => {
  test('prefers publishing, but has not asked until the user answers once', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cookiepal-output-'));
    assert.deepEqual(readOutput(dir), { mode: 'artifact', asked: false });
    for (const mode of OUTPUT_MODES) {
      assert.deepEqual(setOutput(dir, mode), { mode, asked: true });
      assert.deepEqual(readOutput(dir), { mode, asked: true });
    }
    assert.equal(setOutput(dir, 'nonsense'), null);
    assert.deepEqual(readOutput(dir), { mode: 'terminal', asked: true }, 'a bad value changes nothing');
    rmSync(dir, { recursive: true, force: true });
  });

  test('falls back in Andrei\u2019s order, ending somewhere that always works', () => {
    assert.deepEqual(OUTPUT_MODES, ['artifact', 'html', 'markdown', 'terminal']);
    assert.deepEqual(fallbacksFor('artifact'), ['html', 'markdown', 'terminal']);
    assert.deepEqual(fallbacksFor('html'), ['markdown', 'terminal']);
    assert.deepEqual(fallbacksFor('markdown'), ['terminal']);
    assert.deepEqual(fallbacksFor('terminal'), [], 'the terminal read is in the result, so it cannot be unavailable');
  });
});

describe('renderDocument', () => {
  const doc = () => renderDocument(assess(tracked()));

  test('is a complete page, not the fragment the publisher wraps', () => {
    const html = doc();
    assert.match(html, /^<!doctype html>/);
    assert.match(html, /<meta charset="utf-8">/);
    assert.match(html, /viewport-fit=cover/);
    assert.ok(!/^<!doctype/.test(renderReport(assess(tracked()))), 'the artifact form stays a fragment');
  });

  test('puts head content in the head and the page in the body', () => {
    const html = doc();
    const head = html.slice(html.indexOf('<head>'), html.indexOf('</head>'));
    const body = html.slice(html.indexOf('<body>'), html.indexOf('</body>'));
    assert.ok(head.includes('<title>') && head.includes('<style>'));
    assert.ok(body.includes('<main class="page"') && !head.includes('<main'));
  });

  test('carries the same findings and wording as the published fragment', () => {
    const assessment = assess(tracked());
    const fragment = renderReport(assessment);
    for (const finding of assessment.findings) {
      assert.ok(fragment.includes(finding.title));
      assert.ok(renderDocument(assessment).includes(finding.title));
    }
  });
});

describe('renderMarkdownDocument', () => {
  test('is the complete read: grid and inventory included, nothing to ask for', () => {
    const md = renderMarkdownDocument(assess(tracked()));
    assert.match(md, /### What was found, against each law/);
    assert.match(md, /Every cookie set before consent/);
    assert.ok(!md.includes('Ask for the full inventory'), 'a file is reread, so it holds the lists');
  });

  test('the terminal read stays the trimmed one', () => {
    const text = renderTerminal(assess(tracked()));
    assert.ok(!text.includes('### What was found, against each law'));
    assert.match(text, /Ask for the full inventory/);
  });

  test('both carry the same findings and the same law wording', () => {
    const assessment = assess(tracked());
    const md = renderMarkdownDocument(assessment);
    const text = renderTerminal(assessment);
    for (const finding of assessment.findings) {
      for (const { text: wording } of finding.byLaw) {
        assert.ok(md.includes(wording), 'document');
        assert.ok(text.includes(wording), 'terminal');
      }
    }
  });

  test('no form calls a site compliant', () => {
    const assessment = assess(tracked());
    const everything = renderTerminal(assessment) + renderMarkdownDocument(assessment) + renderDocument(assessment);
    assert.ok(!/\bcompliant\b/i.test(everything));
  });
});
