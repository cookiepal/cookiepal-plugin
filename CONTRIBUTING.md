# Contributing

Thanks for taking an interest. This repository holds the CookiePal plugin for Claude Code: the commands, the skills, the local check and the curated legal wording. The hosted MCP server it talks to is not open source, so everything here runs on the user's own machine.

## Getting set up

Requires [Node.js](https://nodejs.org) 24 and [pnpm](https://pnpm.io), plus Google Chrome, Microsoft Edge, Brave or Chromium for the browser tests.

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
| `pnpm build` | Bundles `src/` into `dist/check.mjs` |
| `pnpm lint` | Biome check |
| `pnpm lint:fix` | Biome check, writing fixes |
| `pnpm typecheck` | `tsc` |
| `pnpm validate` | Validates the plugin and marketplace manifests |
| `pnpm test` | Builds, then runs the test suite |

CI runs lint, typecheck, the `dist/` freshness check, manifest validation, the tests, and a gitleaks scan of the full history. Run `pnpm lint && pnpm typecheck && pnpm test` before opening a pull request and you will not be surprised.

## `dist/` is committed, on purpose

Claude Code installs plugins straight from git with no build step, so the bundle the skill actually runs has to be in the repository. `dist/check.mjs` is generated from `src/` and its one dependency.

**Run `pnpm build` and commit `dist/` with any change to `src/`.** CI fails when the committed bundle does not match the source, including when it has been deleted or left uncommitted. Never hand-edit `dist/`.

## How the pieces fit

| Path | What lives there |
| --- | --- |
| `commands/check.md` | The `/cookiepal:check` command |
| `skills/check-one-page/SKILL.md` | The skill the command follows |
| `commands/connect.md` | The `/cookiepal:connect` command |
| `skills/connect-account/SKILL.md` | The skill it follows: connecting a CookiePal account, and the separate question of linking the install ID to it |
| `src/` | The local check: browser control, cookie capture, banner matching, categorisation, the risk read and its rendered forms |
| `src/laws.ts` | The curated legal wording |
| `hooks/hooks.json` | Hooks that keep query strings off `plan_check`, keep the install ID off `connect_account` without a recorded answer to linking it (and have Claude Code confirm a yes with the user), and hand each plan and result to the local check |
| `tests/` | Unit tests and browser tests against a local server |
| `.claude-plugin/` | The plugin and marketplace manifests |

## Things worth knowing before you change something

**Everything read from a checked page is untrusted.** It can be a prompt injection aimed at whoever is running the check. Page strings reach the model marked as page content and capped in length, cookie values are never read, and the check never navigates to a URL it found on a page. Keep it that way.

**The legal wording is fixed text, not a prompt.** Every sentence the risk read prints about a law ships with the plugin and is reviewed before release, so the explanation cannot drift or be rephrased by the model. Changing `src/laws.ts` means a release, and the wording has to stay consistent with the explainers on cookiepal.io.

**The check never judges compliance.** It reports what was found and what each law asks for. "This site is compliant" is not something it can say, and that rule is written into the skill as well as the output.

**Nothing new should leave the user's machine** without a very good reason. The page's origin and path, the cookies without their values, the third-party hosts, the plugin version, the country and an optional install ID. That is the whole list, and it is documented in the [privacy notice](https://cookiepal.io/plugin-privacy). Adding a field means updating that notice in the same change.

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
