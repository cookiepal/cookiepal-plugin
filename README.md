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

The check loads one page in a fresh, temporary browser profile on your machine and reports what was set before you gave consent. It is an advisory check of a single page, labelled with the country it ran from. It is not a full site scan and it does not change anything in a CookiePal account.

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

This repository contains only the plugin itself: the manifest, the skill and the command. The checks are served by CookiePal's hosted MCP server at `https://mcp.cookiepal.io/mcp`, which is not open source.

## License

[MIT](LICENSE)
