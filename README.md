# CookiePal for Claude Code

Check any page for cookies and trackers that fire before consent, without leaving Claude Code. **No account needed.**

## Install

In Claude Code:

```
/plugin marketplace add westpoint-io/claude-code-plugin
/plugin install cookiepal@cookiepal
```

Or from your terminal:

```sh
claude plugin marketplace add westpoint-io/claude-code-plugin
claude plugin install cookiepal@cookiepal
```

Restart Claude Code after installing. Run `/mcp` and you should see the `cookiepal` server listed as connected.

## Use

```
/cookiepal:check https://example.com
```

The check loads one page in a fresh, temporary browser profile on your machine and reports what was set before you gave consent. It then loads the page twice more, presses the banner's accept button in one run and its reject button in the other, and reports what each one changed — including anything still set or still being contacted after an explicit reject. It is an advisory check of a single page, labelled with the country it ran from. It is not a full site scan and it does not change anything in a CookiePal account. It works on any page your machine can reach, including `localhost`.

It then explains what it found against the GDPR, the CCPA and CPRA, the LGPD and Quebec's Law 25, in plain language, and can publish that read as a page you can share. The laws differ on whether tracking needs permission up front or only a way to opt out, so each one gets its own explanation rather than a single score. It never tells you a site is compliant or non-compliant: one page, loaded once, from one country, cannot show that. It says what was found and what each law asks for.

The only thing it ever clicks is one consent button. It never presses a button it is unsure of: where no banner is found, or more than one button matches, the check reports what was set on arrival and says the consent action was not tested. The matchers that find those buttons come from CookiePal with each check, so they improve without you updating the plugin.

You need [Node.js](https://nodejs.org) 18 or later and Google Chrome, Microsoft Edge, Brave or Chromium. The check never uses your own browser profile, so your cookies and sign-ins are never read. To use a browser installed somewhere unusual, set `COOKIEPAL_BROWSER` to its executable.

### What is sent to CookiePal

Only what it takes to count checks and store the result:

- the page's origin and path, without its query string or fragment, which stay on your machine;
- each cookie's name, domain, path, expiry, flags and category, never its value;
- the third-party hosts the page contacted;
- the plugin's version number;
- a random install ID, only if you agreed to share it.

The page is loaded on your machine, never by CookiePal. Each cookie is categorised on your machine with the open-source [`@cookiepal-oss/cookie-db`](https://www.npmjs.com/package/@cookiepal-oss/cookie-db) catalogue.

### The risk read

The read runs entirely on your machine and sends nothing to CookiePal. Every sentence it prints about a law is fixed text that ships with the plugin and is reviewed before release, so the explanation cannot drift or be rephrased by the model running it. No cookie descriptions are involved: CookiePal's own cached descriptions are machine-written and are never used here.

It can also render the same read as a self-contained page, with CookiePal's branding, which Claude Code can publish as an artifact you can open in a browser and share. Publishing an artifact needs a signed-in claude.ai account on a paid plan, and uploads the page checked, every cookie name and every third-party host to claude.ai, so the check asks once before the first publish. Without one, or if you say no, the check writes the page to a file you can open yourself; the files for your last 20 checks are kept in the plugin's data folder. The terminal read works on every plan.

The read is advisory and is not legal advice.

### Install ID

The first check asks once whether to share a random install ID, which lets CookiePal count unique installs. The default is no, and the check runs either way. The ID is created only after a yes. It is kept in the plugin's data folder and deleted when you uninstall. To stop sharing it and delete it:

```
/cookiepal:check stop-sharing
```

## Update

```
/plugin marketplace update cookiepal
```

Then open `/plugin` to install the new version. From your terminal:

```sh
claude plugin marketplace update cookiepal
claude plugin update cookiepal@cookiepal
```

Restart Claude Code to apply the update.

## Uninstall

```
/plugin uninstall cookiepal@cookiepal
/plugin marketplace remove cookiepal
```

## What is in this repository

The plugin itself: the manifests, the `/cookiepal:check` command, the `check-one-page` skill, the local check in `src/`, the curated legal wording in `src/laws.ts`, and the hooks that hand each `plan_check` plan and each `submit_check` result to that check. Plugins install from git with no build step, so `dist/check.mjs` is the committed bundle of `src/` and its one dependency, `@cookiepal-oss/cookie-db`. Rebuild it with `pnpm build`. CI fails when it is out of date.

`plan_check` and `submit_check` are served by CookiePal's hosted MCP server at `https://mcp.cookiepal.io/mcp`, which is not open source.

## License

[MIT](LICENSE)
