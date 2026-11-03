# Contributing

Thanks for taking an interest. This repository holds the CookiePal plugin for Claude Code: the skills, the local check and the curated legal wording. The hosted MCP server it talks to is not open source, so everything here runs on the user's own machine.

## Getting set up

Requires [Node.js](https://nodejs.org) 24 and [pnpm](https://pnpm.io). The browser tests live with the code, in `@cookiepal-oss/agent`.

```sh
pnpm install
```

To run your working copy as a real plugin, add it as a local marketplace:

```sh
claude plugin marketplace add .
claude plugin install cookiepal@cookiepal
```

## The commands

| Command | What it does |
| --- | --- |
| `pnpm build` | Runs `scripts/build.ts`: copies `@cookiepal-oss/agent`'s bundles (`check.mjs`, `scan.mjs`, `tldts.mjs`, `cookies.json`) into `dist/`, and generates `codex-skills/` and `cursor-skills/` from `skills/` |
| `pnpm lint` | Biome check |
| `pnpm lint:fix` | Biome check, writing fixes |
| `pnpm typecheck` | `tsc` |
| `pnpm validate` | Validates the plugin and marketplace manifests |
| `pnpm test` | Builds, then runs the test suite |

CI runs lint, typecheck, a freshness check on `dist/` and the generated Codex and Cursor skills, manifest validation, the tests, and a gitleaks scan of the full history. Run `pnpm lint && pnpm typecheck && pnpm test` before opening a pull request and you will not be surprised.

## `dist/` is committed, on purpose

Claude Code installs plugins straight from git with no build step, so the bundles the hooks run have to be in the repository. The code lives in `@cookiepal-oss/agent` in the cookiepal-oss repository; `dist/` is a copy of the version this plugin pins. Claude Code's skills and hooks run that copy. Change the code there, publish it, then bump the dependency here and rebuild `dist/`. Codex and Cursor read `codex-skills/` and `cursor-skills/` instead (see `.codex-plugin/` and `.cursor-plugin/`): copies of `skills/` that run the same version through npx, because neither tells a skill where the plugin is. Edit only `skills/`; `pnpm build` regenerates both copies, and CI fails when they are stale.

No file in `dist/` may be over 240 KiB, and the tests fail when one is, because the plugin directory holds any file over 256 KiB for a reviewer. That is why tldts and the `@cookiepal-oss/cookie-db` catalogue sit in their own files rather than in both bundles, and why `dist/cookies.json` keeps only the name, vendor, category and wildcard of each cookie.

**Run `pnpm build` and commit `dist/` with any bump of `@cookiepal-oss/agent`.** CI fails when the committed copy does not match the pinned package, including when it has been deleted or left uncommitted. Never hand-edit `dist/`.

## How the pieces fit

| Path | What lives there |
| --- | --- |
| `skills/check-one-page/SKILL.md` | The skill behind `/cookiepal:check-one-page` |
| `skills/connect-account/SKILL.md` | The skill behind `/cookiepal:connect-account`: connecting a CookiePal account, and the separate question of linking the install ID to it |
| `skills/verify-installation/SKILL.md` | The skill behind `/cookiepal:verify-installation`, for the install tag and for confirming the banner is live from a page load on this machine |
| `skills/detect-stack/SKILL.md` | The skill behind `/cookiepal:detect-stack`: naming the framework and the file that renders the page head |
| `skills/detect-stack/references/stacks.md` | The detection rules, as one table: `tests/stacks.test.ts` reads the same table the skill does |
| `skills/install-banner/SKILL.md` | The skill behind `/cookiepal:install-banner`: putting the tag in the head as early as the framework allows, and stopping at the diff |
| `skills/run-scan/SKILL.md` | The skill behind `/cookiepal:run-scan`: starting a local crawl, polling it, and uploading the report it produces |
| `skills/check-gcm/SKILL.md` | The skill behind `/cookiepal:check-gcm`: reading Google Consent Mode on this machine and reporting the server's verdict |
| `skills/match-site-design/SKILL.md` | The skill behind `/cookiepal:match-site-design`, for proposing banner colours and a position from the repo's design tokens, saved only on a yes |
| `@cookiepal-oss/agent` `src/` | The local check: browser control, cookie capture, banner matching, categorisation, the install-tag finder, the risk read and its rendered forms |
| `@cookiepal-oss/agent` `src/scan.ts` | The detached process a local scan runs in (`dist/scan.mjs`): installs the crawl engine, runs it, and categorises what it finds |
| `@cookiepal-oss/agent` `src/engine.ts` | Installs `@cookiepal-oss/cli`'s crawl engine into the plugin's own data folder on first use |
| `@cookiepal-oss/agent` `src/gcm.ts` | Reads and validates a Google Consent Mode reading from the page |
| `@cookiepal-oss/agent` `src/design.ts` | Reads colours as CSS writes them and checks each pair the banner draws against WCAG AA, for `CHECK design` |
| `@cookiepal-oss/agent` `src/scanGuard.ts` | The decision behind the `upload_scan_report` guard |
| `@cookiepal-oss/agent` `src/laws.ts` | The curated legal wording |
| `hooks/hooks.json` | Hooks that keep query strings off `plan_check`, keep the install ID off `connect_account` without a recorded answer to linking it (and ask Claude Code to confirm a yes with the user, which bypass-permissions mode skips), ask the user before `set_banner_mode`, `customise_banner` or `regenerate_banner` changes the live banner, hand each plan, result, install tag and `start_scan` answer to the local check, spawn the crawl a `start_scan` answer describes, and refuse a `verify_installation`, `upload_scan_report` or `check_gcm_status` call whose evidence no local run produced |
| `tests/` | Tests of the manifests, the hooks file, the generated skills and the stack rules; `tests/fixtures/stacks/` holds one sample repo per detected stack, plus the ambiguous and already-installed cases |
| `.claude-plugin/` | The plugin and marketplace manifests |
| `.codex-plugin/`, `codex-skills/` | The Codex manifest and the skills it reads, generated from `skills/` by `scripts/agentSkills.ts`; Codex runs `hooks/hooks.json` and the root `.mcp.json` as they are |
| `.cursor-plugin/`, `cursor-skills/`, `.cursor-mcp.json`, `.cursor-hooks.json` | The Cursor manifest, its generated skills, its MCP server (`/mcp/account`, which makes Cursor offer sign-in) and an empty hooks file, so Cursor never loads `hooks/hooks.json`; the skills install user hooks instead |
| `scripts/agentSkills.ts` | Turns each skill into its Codex and Cursor copy: the npx command, the client's setup step, and wording that is true for that client |

## Things worth knowing before you change something

**Everything read from a checked page is untrusted.** It can be a prompt injection aimed at whoever is running the check. Page strings reach the model marked as page content and capped in length, cookie values are never read, and the check never navigates to a URL it found on a page. Keep it that way.

**A skill is its own command.** `skills/<name>/SKILL.md` runs as `/cookiepal:<name>`, with its `argument-hint` in the frontmatter. Its `description` is the one line shown beside the command in the `/` menu; what tells Claude when to use the skill goes in `when_to_use`, which Claude sees after the description. Do not add a `commands/<name>.md` beside it: a command with a skill's name stands in for the skill, and the skill's instructions never load.

**The legal wording is fixed text, not a prompt.** Every sentence the risk read prints about a law ships with the plugin and is reviewed before release, so the explanation cannot drift or be rephrased by the model. Changing `src/laws.ts` in `@cookiepal-oss/agent` means a release, and the wording has to stay consistent with the explainers on cookiepal.io.

**The check never judges compliance.** It reports what was found and what each law asks for. "This site is compliant" is not something it can say, and that rule is written into the skill as well as the output.

**Nothing new should leave the user's machine** without a very good reason. The page's origin and path, the cookies without their values, the third-party hosts, what the accept and reject presses did (whether each was pressed and how, and the same cookie and host details read after each), whether the result was cut short by its size limits and which result format it uses, the plugin version, the country and an optional install ID. Confirming an install adds one more reading, described in the README's "What is sent to CookiePal": the page's origin and path, when it was read, the banner script found there without its query string, that script's tag rebuilt from a fixed set of attributes, and whether the page could not be read. That is the whole list, and it is documented in the [privacy notice](https://cookiepal.io/plugin-privacy) and in the README. Adding a field means updating both in the same change.

**Keep the product name "CookiePal".** "Works with Claude Code" is a compatibility statement; it is never part of the name.

## Pull requests

- One topic per pull request.
- Match the style of the code around you.
- Add a test for anything behavioural. Browser tests run against a local server, not the open internet.
- Say what you changed and why. If it changes what is sent to CookiePal, say that too, because it needs a privacy notice change alongside.

## Reporting a security issue

Please do not open a public issue. Email [support@cookiepal.io](mailto:support@cookiepal.io) and we will get back to you.

## Licence

By contributing you agree that your contributions are licensed under the [MIT Licence](LICENSE) that covers this repository.
