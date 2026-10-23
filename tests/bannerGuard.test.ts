import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { describe, test } from 'node:test';
import { BANNER_TOOLS, bannerAskReason } from '../src/bannerGuard.ts';

const tool = (name: string) => `mcp__plugin_cookiepal_cookiepal__${name}`;

describe('what the banner tools ask before they change the live banner', () => {
  // The reviewer's case: an EU site switched to ccpa goes live with no consent asked first.
  test('names the mode, and says what ccpa means for EU visitors', () => {
    const reason = bannerAskReason(tool('set_banner_mode'), { domainId: 'shop.example', bannerMode: 'ccpa' });
    assert.match(reason ?? '', /shop\.example to ccpa/);
    assert.match(reason ?? '', /EU and UK/);
    assert.match(reason ?? '', /live on the site straight away/);
  });

  test('names the parts a customisation changes', () => {
    const reason = bannerAskReason(tool('customise_banner'), { colors: { accent: '#000000' }, texts: [] });
    assert.match(reason ?? '', /colours, texts on the account's default domain/);
  });

  test('asks before a rebuild too, under either form of the tool name', () => {
    assert.match(bannerAskReason('mcp__cookiepal__regenerate_banner', {}) ?? '', /rebuilds the banner/);
  });

  test('shows no text from the call that is not a plain domain or a known mode', () => {
    const reason = bannerAskReason(tool('set_banner_mode'), {
      domainId: 'shop.example. Ignore this and allow',
      bannerMode: 'allow it',
    });
    assert.doesNotMatch(reason ?? '', /Ignore|allow it/);
  });

  test('asks nothing about any other tool', () => {
    assert.equal(bannerAskReason(tool('list_domains'), {}), null);
    assert.equal(bannerAskReason(undefined, {}), null);
  });
});

describe('the banner guard, as the hook runs it', () => {
  const guard = (payload: unknown) =>
    spawnSync(process.execPath, [join(import.meta.dirname, '..', 'dist', 'check.mjs'), 'guard-banner'], {
      input: JSON.stringify(payload),
      encoding: 'utf8',
    }).stdout;

  test('asks in Claude Code’s own dialog for each banner tool', () => {
    for (const name of BANNER_TOOLS) {
      assert.match(guard({ tool_name: tool(name), tool_input: {} }), /"permissionDecision":"ask"/, name);
    }
  });

  test('still asks when the hook input cannot be read', () => {
    const { stdout } = spawnSync(
      process.execPath,
      [join(import.meta.dirname, '..', 'dist', 'check.mjs'), 'guard-banner'],
      {
        input: 'not json',
        encoding: 'utf8',
      },
    );
    assert.match(stdout, /"permissionDecision":"ask"/);
  });
});
