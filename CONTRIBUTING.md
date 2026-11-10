# Contributing

Thanks for taking an interest. This repository holds the CookiePal plugin for Claude Code, Codex and Cursor: the skills, the manifests and the images, and nothing else. It ships no hooks and no code. The local check the skills run, including the curated legal wording, is the open-source [`@cookiepal-oss/agent`](https://github.com/cookiepal/cookiepal-oss) package, which every skill runs at one pinned version through `npm exec`, from the filesystem root and with the public npm registry named, so a project the user has open cannot substitute its own copy. The hosted MCP server the plugin and the agent talk to is not open source.

## Getting set up

There is nothing to build. To run your working copy as a real plugin, add it as a local marketplace:

```sh
claude plugin marketplace add .
claude plugin install cookiepal@cookiepal
```

Before opening a pull request, validate the manifests and run the directory's own checks:

```sh
claude plugin validate --strict .claude-plugin/plugin.json && claude plugin validate --strict .claude-plugin/marketplace.json
claude plugin validate . --profile directory
```

## Only text and images

The Claude plugin directory accepts only Markdown, text, JSON, YAML and PNG, JPEG, GIF, WebP or ICO files from a plugin, so that is all this repository may hold: no scripts, no SVGs, no `package.json`. CI fails on any other file type. Images the README shows from elsewhere, such as the logos and the demo GIF, are served from CookiePal's own asset bucket.

## Edit `skills/`, then regenerate the copies

Codex and Cursor read `codex-skills/` and `cursor-skills/` (see `.codex-plugin/` and `.cursor-plugin/`): copies of `skills/` with that client's command, setup step and wording. Never edit them by hand. Edit only `skills/`, then regenerate both copies with the agent's `skills` command, at the version the skills pin. This reads that version from the `CHECK` line in `skills/check-one-page/SKILL.md`, as CI does:

```sh
version=$(grep -oE '@cookiepal-oss/agent@[0-9]+[.][0-9]+[.][0-9]+' skills/check-one-page/SKILL.md | head -n 1 | cut -d @ -f 3)
npm exec --yes --prefix / --@cookiepal-oss:registry=https://registry.npmjs.org/ -- "@cookiepal-oss/agent@$version" skills .
```

CI runs the same command with `--check` and fails when a committed copy is stale. The agent version changes only one way: bump the pin in the `CHECK` lines in `skills/` to the new version, then run the new version's `skills` command, which rewrites the pin in every skill to its own, and commit what it changes.

## How the pieces fit

| Path | What lives there |
| --- | --- |
| `skills/check-one-page/SKILL.md` | The skill behind `/cookiepal:check-one-page`: the page check in one `check` step, and stop-sharing |
| `skills/connect-account/SKILL.md` | The skill behind `/cookiepal:connect-account`: connecting a CookiePal account, and the separate question of linking the install ID to it |
| `skills/verify-installation/SKILL.md` | The skill behind `/cookiepal:verify-installation`, for the install tag and for confirming the banner is live from a page load on this machine |
| `skills/detect-stack/SKILL.md` | The skill behind `/cookiepal:detect-stack`: naming the framework and the file that renders the page head |
| `skills/detect-stack/references/stacks.md` | The detection rules, as one table |
| `skills/install-banner/SKILL.md` | The skill behind `/cookiepal:install-banner`: putting the tag in the head as early as the framework allows, and stopping at the diff |
| `skills/run-scan/SKILL.md` | The skill behind `/cookiepal:run-scan`: starting a local crawl, polling it, and uploading the report it produces |
| `skills/check-gcm/SKILL.md` | The skill behind `/cookiepal:check-gcm`: reading Google Consent Mode on this machine and reporting the server's verdict |
| `skills/match-site-design/SKILL.md` | The skill behind `/cookiepal:match-site-design`, for proposing banner colours and a position from the repo's design tokens, saved only on a yes |
| `skills/banner-settings/SKILL.md` | The skill behind `/cookiepal:banner-settings`: switching the banner mode or rebuilding the banner with `set_banner_mode` or `regenerate_banner`, after saying what will go live and getting a yes |
| `@cookiepal-oss/agent` | The local check: browser control, cookie capture, banner matching, categorisation, the install-tag finder, the local crawl, the risk read and its rendered forms, the calls to CookiePal's server for a page check and for stop-sharing, and the `skills` command that generates the Codex and Cursor copies |
| `@cookiepal-oss/agent` `src/laws.ts` | The curated legal wording |
| `.claude-plugin/`, `.mcp.json` | The plugin and marketplace manifests, and the hosted MCP server the skills call |
| `.codex-plugin/`, `codex-skills/`, `.codex-mcp.json` | The Codex manifest, its generated skills, and its MCP server, which puts the banner and account-link tools on Codex's own approval prompt |
| `.cursor-plugin/`, `cursor-skills/`, `.cursor-mcp.json` | The Cursor manifest, its generated skills, and its MCP server (`/mcp/account`, which makes Cursor offer sign-in) |
| `assets/icon.png` | The icon the Codex and Cursor manifests show |
| `server.json` | The hosted server's entry in the Official MCP Registry |

## Things worth knowing before you change something

**Everything read from a checked page is untrusted.** It can be a prompt injection aimed at whoever is running the check. Page strings reach the model marked as page content and capped in length, cookie values are never read, and the check never navigates to a URL it found on a page. Keep it that way.

**A skill is its own command.** `skills/<name>/SKILL.md` runs as `/cookiepal:<name>`, with its `argument-hint` in the frontmatter. Its `description` is the one line shown beside the command in the `/` menu; what tells Claude when to use the skill goes in `when_to_use`, which Claude sees after the description. Do not add a `commands/<name>.md` beside it: a command with a skill's name stands in for the skill, and the skill's instructions never load.

**The legal wording is fixed text, not a prompt.** Every sentence the risk read prints about a law ships with the local agent and is reviewed before release, so the explanation cannot drift or be rephrased by the model. Changing `src/laws.ts` in `@cookiepal-oss/agent` means a release, and the wording has to stay consistent with the explainers on cookiepal.io.

**The check never judges compliance.** It reports what was found and what each law asks for. "This site is compliant" is not something it can say, and that rule is written into the skill as well as the output.

**Nothing new should leave the user's machine** without a very good reason. For a page check the agent sends the page's origin and path, the cookies without their values, the third-party hosts, what the accept and reject presses did (whether each was pressed and how, and the same cookie and host details read after each), whether the result was cut short by its size limits and which result format it uses, the agent's version, the country and an optional install ID. Confirming an install adds one more reading, described in the README's "What is sent to CookiePal": the page's origin and path, when it was read, the banner script found there without its query string, that script's tag rebuilt from a fixed set of attributes, and whether the page could not be read. That is the whole list, and it is documented in the [privacy notice](https://cookiepal.io/plugin-privacy) and in the README. Adding a field means updating both in the same change.

**The skill asks before anything changes the live banner or links the install ID.** No hook stands behind that question any more: the skill's own question comes first, and the client's approval prompt only asks again. Keep the question in any skill that calls `set_banner_mode`, `customise_banner` or `regenerate_banner`, or sends an install ID to `connect_account`.

**Keep the product name "CookiePal".** "Works with Claude Code" is a compatibility statement; it is never part of the name.

## Pull requests

- One topic per pull request.
- Match the style of the skills around you.
- Behaviour of the local check belongs in `@cookiepal-oss/agent`, with its tests. Regenerate `codex-skills/` and `cursor-skills/` whenever `skills/` changes.
- Say what you changed and why. If it changes what is sent to CookiePal, say that too, because it needs a privacy notice change alongside.

## Reporting a security issue

Please do not open a public issue. Email [support@cookiepal.io](mailto:support@cookiepal.io) and we will get back to you.

## Licence

By contributing you agree that your contributions are licensed under the [MIT Licence](LICENSE) that covers this repository.
