---
name: connect-account
description: Connect Codex to your CookiePal account, or create one
when_to_use: Connects Codex to the user's CookiePal account, opening sign-in, or sign-up for someone without an account, in their browser, then says which account and organisation it is connected to. Use when the user runs the CookiePal connect-account skill, asks to sign in or log in to CookiePal, to connect or link their CookiePal account, to create a CookiePal account, or asks which CookiePal account Codex is connected to.
---

# Connect a CookiePal account

The page check never needs an account. Connecting one is what the CookiePal tools that act on a real site need: they work on the account's own domains, banner and scans.

Sign-in happens in the user's browser, never here. Never ask for, accept or repeat a password, a code or a token, and if the user pastes one, tell them not to and that it is not needed.

`CHECK` below means this command, which prints one JSON object:

```
npx -y @cookiepal-oss/agent@0.2.0
```

**In Codex:** run every `CHECK` command outside the sandbox, by requesting escalated permissions for it with `prefix_rule` set to `["npx", "-y", "@cookiepal-oss/agent@0.2.0"]`, so one approval covers every later `CHECK`. Say why: it saves the check's files in `~/.cookiepal` and loads pages in a browser, which the sandbox blocks. If Codex rejects the request without asking the user, tell them to choose "Ask for approval" under `/permissions` and ask again, and stop. If the user declines, tell them the check can't run inside the sandbox, and stop. Never run a `CHECK cursor-hooks` command from Codex.

## Steps

### 1. Connect without the install ID

In Codex the install ID is never linked to an account: linking needs the user to confirm it from a hook, and Codex hooks cannot ask. Connect without it in step 2, and do not ask about linking.

### 2. Connect

Call the cookiepal server's `connect_account` tool. Send neither `installId` nor `linkInstall`.

If the client is not signed in, the call opens CookiePal's connect page in the browser instead of answering. Tell the user what to expect there: if they are already signed in to CookiePal in that browser, they press **Connect as** their email and that is all. Otherwise they sign in (or continue with Google) or create a free account, which open in a new tab, then come back to the connect page and press Connect. Codex is connected when they do. Wait for the user to say they have pressed Connect, then call `connect_account` once more. That second answer is the one step 3 reports.

If the call fails because sign-in is needed and no browser opened, tell the user to run `codex mcp login cookiepal` in a terminal, and then ask for the CookiePal connect-account skill again. Do not retry in a loop.

If it fails with a message from CookiePal, such as an account that has no organisation yet or needs multi-factor authentication set up first, show that message as it is: it says what to do. Then stop.

### 3. Report

Say who Codex is connected as, from the tool's answer: the email, the organisation (its name when there is one) and the domain the account's tools use by default. If the call had no tool answer, because sign-in did not finish, say nothing is connected yet.

Nothing else changed in the account. Do not suggest anything was set up, installed or scanned.
