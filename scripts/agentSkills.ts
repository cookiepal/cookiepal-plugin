import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * The skills Codex and Cursor read, generated from `skills/` by `pnpm build`.
 * Claude Code's own skills stay exactly as written: they run the copy in `dist/`.
 * Codex and Cursor never tell a skill where the plugin is, so their copies run the
 * same pinned version of `@cookiepal-oss/agent` through npx instead, and find
 * detect-stack's rules beside their own folder. Cursor runs a plugin's hooks only in
 * its own format, so its copies install user hooks instead, with the user's say-so,
 * and the Cursor manifest points at an empty hooks file so hooks/hooks.json is never
 * loaded. Neither client has slash commands, or keeps the install ID in a folder the
 * plugin's uninstall removes, so their copies say what is true for them.
 */
export type AgentClient = 'codex' | 'cursor';

export const AGENT_SKILL_DIRS: Record<AgentClient, string> = { codex: 'codex-skills', cursor: 'cursor-skills' };

// biome-ignore lint/suspicious/noTemplateCurlyInString: the literal text Claude Code's skills contain.
const CLAUDE_CHECK = 'COOKIEPAL_DATA_DIR="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_PLUGIN_ROOT}/dist/check.mjs"';
// biome-ignore lint/suspicious/noTemplateCurlyInString: the literal text Claude Code's skills contain.
const CLAUDE_STACKS = '${CLAUDE_PLUGIN_ROOT}/skills/detect-stack/references/stacks.md';

const CURSOR_SETUP = `
**First, in Cursor:** run \`CHECK cursor-hooks status\`. If it prints \`"installed": true\`, go on. Otherwise ask the user, in these words: "CookiePal needs to add two hooks to Cursor's hooks file (~/.cursor/hooks.json). Cursor runs them on every MCP call, to any server, and they act only on calls to CookiePal: they hand each check's plan and result between steps and refuse unsafe calls. They run a copy of CookiePal's checker kept in ~/.cookiepal/agent. Your other hooks stay as they are. Uninstalling the plugin doesn't remove these hooks: ask to remove the CookiePal hooks when you want them gone. Add them?" If they agree, run \`CHECK cursor-hooks install\` and go on. If they decline, tell them the check can't run in Cursor without the hooks, and stop. When the user asks to remove the CookiePal hooks, run \`CHECK cursor-hooks uninstall\` and say which hooks file it changed.
`;

const codexSetup = (version: string) => `
**In Codex:** run every \`CHECK\` command outside the sandbox, by requesting escalated permissions for it with \`prefix_rule\` set to \`["npx", "-y", "@cookiepal-oss/agent@${version}"]\`, so one approval covers every later \`CHECK\`. Say why: it saves the check's files in \`~/.cookiepal\` and loads pages in a browser, which the sandbox blocks. If Codex rejects the request without asking the user, tell them to choose "Ask for approval" under \`/permissions\` and ask again, and stop. If the user declines, tell them the check can't run inside the sandbox, and stop. Never run a \`CHECK cursor-hooks\` command from Codex.
`;

// Only Claude Code can publish an artifact, so elsewhere the read stays on this machine.
const PUBLISH_PARAGRAPHS = [
  '**Ask before the first publish.**',
  '> Publish this read as a page on claude.ai?',
  'Options: **No, keep it local**',
  'Run `CHECK output artifact` only after',
];
const PUBLISH_EDITS: [string, string][] = [
  ["'<url> [artifact | html | markdown | terminal]'", "'<url> [html | markdown | terminal]'"],
  ['`artifact`, `html`, `markdown` or `terminal`', '`html`, `markdown` or `terminal`'],
  [
    ' For `artifact`, ask the publish question from step 9 first, and run `CHECK output artifact` only after a clear yes; for anything else, run `CHECK output html` and say the default stayed local.',
    '',
  ],
  ['`artifact` (the page to publish), ', ''],
  ['2. **`html`**', '1. **`html`**'],
  ['3. **`markdown`**', '2. **`markdown`**'],
  ['4. **`terminal`**', '3. **`terminal`**'],
  [
    ' Artifacts need a signed-in claude.ai account and are off in CI and the Agent SDK; if publishing fails or is unavailable, say so in one line and offer the next form. Never treat it as the check failing',
    ' Never treat that as the check failing',
  ],
  ['`artifact` and `html` are the designed page', '`html` is the designed page'],
  ['The three files', 'The two files'],
  ['CHECK output artifact\n', ''],
];

const withoutPublishing = (text: string): string => {
  const kept = text
    .split('\n\n')
    .filter((paragraph) => !PUBLISH_PARAGRAPHS.some((start) => paragraph.startsWith(start)))
    .join('\n\n')
    .split('\n')
    .filter((line) => !line.startsWith('1. **`artifact`**'))
    .join('\n');
  return PUBLISH_EDITS.reduce((adapted, [from, to]) => adapted.replaceAll(from, to), kept);
};

const CLIENT_NAMES: Record<AgentClient, string> = { codex: 'Codex', cursor: 'Cursor' };

const SIGN_IN_AGAIN: Record<AgentClient, string> = {
  codex:
    'tell the user to run `codex mcp login cookiepal` in a terminal, and then ask for the CookiePal connect-account skill again.',
  cursor:
    "tell the user to open Cursor's settings, choose **MCP**, sign in to **cookiepal**, and then ask for the CookiePal connect-account skill again.",
};

// Codex turns a hook's "ask" into a refusal, so the link a yes needs can never be confirmed there.
const CODEX_NO_LINK = `### 1. Connect without the install ID

In Codex the install ID is never linked to an account: linking needs the user to confirm it from a hook, and Codex hooks cannot ask. Connect without it in step 2, and do not ask about linking.

`;

const CLIENT_EDITS = (client: AgentClient): [string, string][] => [
  [
    "kept in this plugin's data folder and deleted when you uninstall the plugin",
    'kept in `~/.cookiepal/plugin-data` on this computer, and not removed when you uninstall the plugin',
  ],
  ["The files are kept in the plugin's data folder", 'The files are kept in `~/.cookiepal/plugin-data`'],
  [
    'You can stop sharing any time with `/cookiepal:check-one-page stop-sharing`.',
    'You can stop sharing any time by asking to stop sharing your CookiePal install ID.',
  ],
  [' (for example `/cookiepal:check-one-page stop-sharing`)', ''],
  [
    'or straight away with `/cookiepal:check-one-page stop-sharing`.',
    'or straight away by asking to stop sharing your CookiePal install ID.',
  ],
  ['or `/cookiepal:check-one-page stop-sharing`, unlinks it', 'or asking to stop sharing the install ID, unlinks it'],
  [
    'tell the user to run `/mcp`, choose **cookiepal**, choose **Authenticate**, and then run `/cookiepal:connect-account` again.',
    SIGN_IN_AGAIN[client],
  ],
  ["but Claude Code's hooks are turned off", "but CookiePal's hooks are not running"],
  ['Claude Code', CLIENT_NAMES[client]],
];

const SLASH_COMMAND = /`?\/cookiepal:([a-z-]+)`?/g;

const CODEX_EDITS: [string | RegExp, string][] = [
  [/### 1\. Ask before linking the install ID\n[\s\S]*?(?=### 2\. )/, CODEX_NO_LINK],
  [
    'If you later connect a CookiePal account, you will be asked separately whether to link it.',
    'Connecting a CookiePal account from Codex never links it.',
  ],
  [
    'With an `installId` from step 1, send it with `linkInstall` set to the recorded answer: `true` for yes, `false` for no. A no also removes a link made on an earlier connect. Without an `installId`, send neither.',
    'Send neither `installId` nor `linkInstall`.',
  ],
  [
    'call `connect_account` once more with the same `installId` and `linkInstall` as before (the answer stands for half an hour; if the hook refuses the call because it has run out, ask the link question again and record the new answer, never drop the `installId` to get past it).',
    'call `connect_account` once more.',
  ],
  [/ If `installLinked` is true,[\s\S]*?has been removed\./, ''],
];

const CURSOR_EDITS: [string | RegExp, string][] = [
  [
    /^(when_to_use: .*asks to stop sharing their CookiePal install ID)\.$/m,
    '$1, or asks to remove the CookiePal hooks from Cursor.',
  ],
];

const forClient = (text: string, client: AgentClient): string => {
  let adapted = CLIENT_EDITS(client).reduce((edited, [from, to]) => edited.replaceAll(from, to), text);
  for (const [from, to] of client === 'codex' ? CODEX_EDITS : CURSOR_EDITS) adapted = adapted.replace(from, to);
  return adapted.replace(SLASH_COMMAND, 'the CookiePal $1 skill');
};

export const agentCheck = (version: string) => `npx -y @cookiepal-oss/agent@${version}`;

export const adaptSkill = (text: string, client: AgentClient, version: string): string => {
  let adapted = forClient(withoutPublishing(text), client)
    .replaceAll(CLAUDE_CHECK, agentCheck(version))
    .replaceAll(CLAUDE_STACKS, '../detect-stack/references/stacks.md');
  const block = `\`\`\`\n${agentCheck(version)}\n\`\`\`\n`;
  adapted = adapted.replace(block, `${block}${client === 'cursor' ? CURSOR_SETUP : codexSetup(version)}`);
  return adapted;
};

const filesUnder = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? filesUnder(join(dir, entry.name)) : [join(dir, entry.name)],
  );

/** Every file of `skills/`, keyed by its path under the client's folder, with each SKILL.md adapted. */
export const agentSkillFiles = (root: string, client: AgentClient, version: string): Map<string, string> => {
  const skills = join(root, 'skills');
  const files = new Map<string, string>();
  for (const path of filesUnder(skills)) {
    const text = readFileSync(path, 'utf8');
    const out = join(AGENT_SKILL_DIRS[client], relative(skills, path));
    if (path.endsWith('SKILL.md')) files.set(out, adaptSkill(text, client, version));
    else files.set(out, path.endsWith('.md') ? forClient(text, client) : text);
  }
  return files;
};
