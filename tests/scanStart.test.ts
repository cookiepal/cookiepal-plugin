import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { CheckError } from '../src/browser.ts';
import { resolveStart } from '../src/scanStart.ts';

/** A `fetch` that answers as if every redirect had already been followed to `landedOn`. */
const landingOn = (landedOn: string): typeof fetch =>
  (async () => ({ url: landedOn, body: null }) as unknown as Response) as typeof fetch;

const unreachable: typeof fetch = async () => {
  throw new TypeError('fetch failed');
};

describe('where a scan starts', () => {
  // The engine follows links only on its start origin, so the apex alone is a one-page crawl.
  test('follows an apex-to-www redirect', async () => {
    assert.equal(
      await resolveStart('https://shop.example/', landingOn('https://www.shop.example/')),
      'https://www.shop.example/',
    );
  });

  test('follows http to https', async () => {
    assert.equal(
      await resolveStart('http://shop.example/', landingOn('https://shop.example/')),
      'https://shop.example/',
    );
  });

  test('keeps a URL that does not redirect', async () => {
    assert.equal(
      await resolveStart('https://shop.example/', landingOn('https://shop.example/')),
      'https://shop.example/',
    );
  });

  test('keeps the start URL when the site does not answer a plain request', async () => {
    assert.equal(await resolveStart('https://shop.example/', unreachable), 'https://shop.example/');
  });

  test('refuses a redirect to another site', async () => {
    await assert.rejects(
      resolveStart('https://shop.example/', landingOn('https://parked.test/')),
      (error) => error instanceof CheckError && /another site/.test(error.message),
    );
  });

  test('refuses a redirect to a private address', async () => {
    await assert.rejects(resolveStart('https://shop.example/', landingOn('http://192.168.1.1/')), CheckError);
  });
});
