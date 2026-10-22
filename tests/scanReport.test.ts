import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { type EngineCookie, MAX_SCAN_COOKIES, reportCookies } from '../src/scanReport.ts';

const cookie = (overrides: Partial<EngineCookie> = {}): EngineCookie => ({
  name: '_ga',
  domain: '.shop.example',
  path: '/',
  duration: '2 years',
  ...overrides,
});

describe('the cookies a scan reports', () => {
  test('keeps a cookie the upload accepts, with its category', () => {
    const { cookies, capped } = reportCookies([cookie()]);
    assert.equal(cookies.length, 1);
    assert.equal(cookies[0]?.name, '_ga');
    assert.equal(typeof cookies[0]?.category, 'string');
    assert.equal(capped, false);
  });

  // One such cookie refuses the whole upload, so it is dropped rather than sent.
  test('drops a cookie seen only in a Set-Cookie header, which has no domain', () => {
    const { cookies } = reportCookies([cookie({ name: 'expired', domain: '' }), cookie()]);
    assert.deepEqual(
      cookies.map((kept) => kept.name),
      ['_ga'],
    );
  });

  test('drops a name, domain or path outside the grammar', () => {
    const bad = [cookie({ name: 'a;b' }), cookie({ domain: 'shop example' }), cookie({ path: 'no-slash' })];
    assert.equal(reportCookies(bad).cookies.length, 0);
  });

  test('keeps an empty name, as the server does', () => {
    assert.equal(reportCookies([cookie({ name: '' })]).cookies.length, 1);
  });

  test('stops at the most one upload takes, and says the report is capped', () => {
    const many = Array.from({ length: MAX_SCAN_COOKIES + 1 }, (_, index) => cookie({ name: `c${index}` }));
    const { cookies, capped } = reportCookies(many);
    assert.equal(cookies.length, MAX_SCAN_COOKIES);
    assert.equal(capped, true);
  });
});
