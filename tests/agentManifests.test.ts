import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, test } from 'node:test';
import { AGENT_SKILL_DIRS, type AgentClient, agentCheck, agentSkillFiles } from '../scripts/agentSkills.ts';

const root = join(import.meta.dirname, '..');
const readJson = (path: string) => JSON.parse(readFileSync(join(root, path), 'utf8'));
const claude = readJson('.claude-plugin/plugin.json');
const agentVersion: string = readJson('node_modules/@cookiepal-oss/agent/package.json').version;

// The guards that can answer "ask": guard-banner always does, guard-connect does before linking the install ID.
const ASKING_GUARDS = /\b(guard-banner|guard-connect)$/;

const askingTools = (): string[] =>
  readJson('hooks/hooks.json')
    .hooks.PreToolUse.filter((entry: { hooks: { command: string }[] }) =>
      entry.hooks.some(({ command }) => ASKING_GUARDS.test(command)),
    )
    .map((entry: { matcher: string }) => entry.matcher.match(/cookiepal__(\w+)\$$/)?.[1]);

describe('the Cursor plugin manifest', () => {
  const manifest = readJson('.cursor-plugin/plugin.json');

  test('matches the Claude Code plugin’s name and version', () => {
    assert.equal(manifest.name, claude.name);
    assert.equal(manifest.version, claude.version);
  });

  test('reads the Cursor skills', () => {
    assert.equal(manifest.skills, './cursor-skills/');
  });

  // With no hooks field Cursor loads hooks/hooks.json; the skills install user hooks, and a second set would run every guard twice.
  test('points its hooks at an empty file, so hooks/hooks.json is never loaded', () => {
    assert.equal(manifest.hooks, './.cursor-hooks.json');
    assert.deepEqual(readJson('.cursor-hooks.json'), { version: 1, hooks: {} });
  });

  // Cursor offers its sign-in only when connecting is refused, which /mcp/account does and /mcp does not.
  test('connects to the sign-in-first server', () => {
    assert.equal(manifest.mcpServers, './.cursor-mcp.json');
    assert.deepEqual(readJson('.cursor-mcp.json'), {
      mcpServers: { cookiepal: { type: 'http', url: 'https://mcp.cookiepal.io/mcp/account' } },
    });
  });
});

describe('the Codex plugin manifest', () => {
  const manifest = readJson('.codex-plugin/plugin.json');

  test('matches the Claude Code plugin’s name and version', () => {
    assert.equal(manifest.name, claude.name);
    assert.equal(manifest.version, claude.version);
  });

  test('reads the Codex skills', () => {
    assert.equal(manifest.skills, './codex-skills/');
  });

  // A Codex hook cannot ask, so the agent writes no decision there and Codex's own approval prompt asks instead.
  test('puts every tool a guard asks about on Codex’s approval prompt', () => {
    assert.equal(manifest.mcpServers, './.codex-mcp.json');
    const { mcpServers } = readJson('.codex-mcp.json');
    assert.deepEqual(Object.keys(mcpServers), ['cookiepal']);
    const { tools, ...server } = mcpServers.cookiepal;
    assert.deepEqual(server, readJson('.mcp.json').mcpServers.cookiepal);
    const prompted = Object.keys(tools).filter((tool) => tools[tool].approval_mode === 'prompt');
    assert.deepEqual(prompted.sort(), askingTools().sort());
  });
});

for (const client of Object.keys(AGENT_SKILL_DIRS) as AgentClient[]) {
  describe(`the ${client} skills`, () => {
    const expected = agentSkillFiles(root, client, agentVersion);
    const skills = [...expected].filter(([path]) => path.endsWith('SKILL.md'));
    const runsAgent = skills.filter(([, text]) => text.includes(agentCheck(agentVersion)));

    // Codex and Cursor never tell a skill where the plugin is.
    test('never name the plugin folder', () => {
      for (const text of expected.values()) assert.doesNotMatch(text, /CLAUDE_PLUGIN_ROOT|dist\/check\.mjs/);
    });

    test('run the version of @cookiepal-oss/agent the plugin carries', () => {
      const pins = [...expected.values()].flatMap((text) =>
        [...text.matchAll(/npx -y @cookiepal-oss\/agent@(\S+)/g)].map((match) => match[1]),
      );
      assert.ok(pins.length > 0);
      for (const pin of pins) assert.equal(pin, agentVersion);
    });

    // Only Claude Code can publish an artifact; the agent never offers one anywhere else.
    test('never offer to publish to claude.ai', () => {
      for (const text of expected.values()) assert.doesNotMatch(text, /artifact|claude\.ai/i);
    });

    // Neither client has slash commands or Claude Code's /mcp, and neither removes ~/.cookiepal/plugin-data on uninstall.
    test('say only what is true in this client', () => {
      for (const [path, text] of expected) {
        assert.doesNotMatch(
          text,
          /\/cookiepal:|skill stop-sharing|Claude Code|`\/mcp`|deleted when you uninstall|plugin's data folder/,
          path,
        );
      }
    });

    // Codex's sandbox blocks the check's files and its browser; Cursor runs a plugin's hooks only in its own format.
    test('every skill that runs the agent sets up this client first', () => {
      assert.ok(runsAgent.length > 0);
      const setup =
        client === 'codex'
          ? `\`prefix_rule\` set to \`["npx", "-y", "@cookiepal-oss/agent@${agentVersion}"]\``
          : 'CHECK cursor-hooks install';
      for (const [path, text] of runsAgent) assert.ok(text.includes(setup), path);
      const other = client === 'codex' ? 'cursor-hooks install' : 'escalated permissions';
      for (const [path, text] of skills) assert.ok(!text.includes(other), path);
    });
  });
}

test('the Codex connect skill asks to link the install ID, as in Claude Code', () => {
  const connect = agentSkillFiles(root, 'codex', agentVersion).get(join('codex-skills', 'connect-account', 'SKILL.md'));
  assert.ok(connect);
  assert.match(connect, /Link your shared install ID/);
  assert.match(connect, /linkInstall` set to the recorded answer/);
  for (const text of agentSkillFiles(root, 'codex', agentVersion).values()) {
    assert.doesNotMatch(text, /never links it|CHECK cursor-hooks (install|uninstall)/);
  }
});

test('a Cursor user can ask to remove the CookiePal hooks, and a skill picks that up', () => {
  const check = agentSkillFiles(root, 'cursor', agentVersion).get(join('cursor-skills', 'check-one-page', 'SKILL.md'));
  assert.match(check ?? '', /^when_to_use: .*asks to remove the CookiePal hooks from Cursor\.$/m);
  assert.match(check ?? '', /CHECK cursor-hooks uninstall/);
});
