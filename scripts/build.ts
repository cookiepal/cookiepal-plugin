import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { AGENT_SKILL_DIRS, type AgentClient, agentSkillFiles } from './agentSkills.ts';

/**
 * The hooks and Claude Code's skills run the local steps from `dist/`, offline, so
 * the plugin carries a copy of `@cookiepal-oss/agent`'s bundles. Codex and Cursor
 * get their own copies of the skills, which run the same version through npx.
 */
const agent = dirname(createRequire(import.meta.url).resolve('@cookiepal-oss/agent/package.json'));
const { version } = JSON.parse(readFileSync(join(agent, 'package.json'), 'utf8'));

// Cleared first, so a file the package stops shipping fails the freshness check rather than staying committed.
rmSync('dist', { recursive: true, force: true });
cpSync(join(agent, 'dist'), 'dist', { recursive: true });

for (const client of Object.keys(AGENT_SKILL_DIRS) as AgentClient[]) {
  rmSync(AGENT_SKILL_DIRS[client], { recursive: true, force: true });
  for (const [path, text] of agentSkillFiles('.', client, version)) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text);
  }
}
