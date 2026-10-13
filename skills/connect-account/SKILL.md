---
name: connect-account
description: Connects Claude Code to the user's CookiePal account, opening sign-in, or sign-up for someone without an account, in their browser, then says which account and organisation it is connected to. Use when the user runs /cookiepal:connect, asks to sign in or log in to CookiePal, to connect or link their CookiePal account, to create a CookiePal account, or asks which CookiePal account Claude Code is connected to.
---

# Connect a CookiePal account

The page check never needs an account. Connecting one is what the CookiePal tools that act on a real site need: they work on the account's own domains, banner and scans.

Sign-in happens in the user's browser, never here. Never ask for, accept or repeat a password, a code or a token, and if the user pastes one, tell them not to and that it is not needed.

`CHECK` below means this command, which prints one JSON object:

```
COOKIEPAL_DATA_DIR="${CLAUDE_PLUGIN_DATA}" node "${CLAUDE_PLUGIN_ROOT}/dist/check.mjs"
```

## Steps

### 1. Ask before linking the install ID

Run `CHECK consent status`. It changes nothing. If it returns no `installId`, the user never shared one: connect without it in step 2, and do not ask about sharing here. Never run `CHECK consent share` from this skill.

If there is an `installId`, the user agreed to share it to count unique installs. Linking it to an account is a different use, and agreeing to share it is not agreeing to link it, so ask this every time, with "No" as the default and first option:

> Link your shared install ID to this CookiePal account? It lets CookiePal see that this install's checks led to an account. The link is deleted after 180 days, if you answer no next time you connect, or straight away with `/cookiepal:check stop-sharing`. Connecting works either way.

Options: **No, don't link it** · **Yes, link it**

Record the answer: `CHECK consent link yes` after a clear yes, `CHECK consent link no` for anything else, including no answer. Never record a yes the user did not give. A hook on `connect_account` refuses the install ID unless it comes with the answer recorded here, and for a yes Claude Code itself asks the user to confirm before the call goes out: if they deny it there, record `CHECK consent link no` and connect with `linkInstall: false`.

### 2. Connect

Call the cookiepal server's `connect_account` tool. With an `installId` from step 1, send it with `linkInstall` set to the recorded answer: `true` for yes, `false` for no. A no also removes a link made on an earlier connect. Without an `installId`, send neither.

If the client is not signed in, the call opens CookiePal's connect page in the browser instead of answering. Tell the user what to expect there: if they are already signed in to CookiePal in that browser, they press **Connect as** their email and that is all. Otherwise they sign in (or continue with Google) or create a free account, which open in a new tab, then come back to the connect page and press Connect. Claude Code is connected when they do. Wait for the user to say they have pressed Connect, then call `connect_account` once more with the same `installId` and `linkInstall` as before (the answer stands for half an hour; if the hook refuses the call because it has run out, ask the link question again and record the new answer, never drop the `installId` to get past it). That second answer is the one step 3 reports.

If the call fails because sign-in is needed and no browser opened, tell the user to run `/mcp`, choose **cookiepal**, choose **Authenticate**, and then run `/cookiepal:connect` again. Do not retry in a loop.

If it fails with a message from CookiePal, such as an account that has no organisation yet or needs multi-factor authentication set up first, show that message as it is: it says what to do. Then stop.

### 3. Report

Say who Claude Code is connected as, from the tool's answer: the email, the organisation (its name when there is one) and the domain the account's tools use by default. If `installLinked` is true, say the install ID is now linked to this account, and that answering no on a later connect, or `/cookiepal:check stop-sharing`, unlinks it (stop-sharing also deletes the checks stored under it). If `installUnlinked` is true, say the link made on an earlier connect has been removed. If the call had no tool answer, because sign-in did not finish, say nothing is connected yet.

Nothing else changed in the account. Do not suggest anything was set up, installed or scanned.
