---
name: banner-settings
description: Switch your CookiePal banner between GDPR, CCPA or both, or rebuild it
when_to_use: Changes the banner mode of one of the user's CookiePal domains (gdpr, ccpa or both) with set_banner_mode, or rebuilds its banner from the saved settings with regenerate_banner, after saying exactly what will go live and getting the user's yes. Use when the user runs /cookiepal:banner-settings, asks to switch their CookiePal banner to GDPR, CCPA or both, asks to change the banner mode, or asks to regenerate, rebuild or republish their CookiePal banner.
argument-hint: '[gdpr | ccpa | both | regenerate] [domain]'
---

# Change the banner mode, or rebuild the banner

Two tools, one call per run. `set_banner_mode` switches a domain's banner between `gdpr`, `ccpa`
and `both`. `regenerate_banner` rebuilds the domain's banner from the settings already saved. Both
change the live banner on the site straight away, for every visitor, so **this skill's own question
in step 3 is what guards them: never call either tool before a clear yes to that question.** Your
client may then ask the user to approve the call once more, unless they have allowed that tool.

Both need a connected account. If a call says sign-in is needed, follow the `connect-account` skill
and come back.

Colours, position, logo and texts are not this skill's job. For colours and position from the site's
own design, use `/cookiepal:match-site-design`.

If a cookiepal tool fails — the server is unreachable, or it returns any other error — say so
plainly and stop. Do not call it again in a loop and do not work around it.

## Steps

### 1. Work out the change

From the command argument or what the user asked:

- **A mode** — `gdpr`, `ccpa` or `both`. If the user asked for a mode in other words ("opt-out
  only", "consent first everywhere"), name the mode you take it to mean in step 3 and let their
  answer confirm it. If it is unclear which mode they want, ask and stop.
- **`regenerate`** — rebuild the banner from its saved settings.

If they asked for neither, ask which change they want and stop.

### 2. Identify the domain

With a domain named, call the cookiepal server's `list_domains` tool and match it against that list.
If it is not in the list, say so and stop: nothing can be changed on a domain the account does not
hold. With none named, call `whoami` and take the account's default domain from its `domain.domainId`; name
that domain in step 3, so the user's yes covers it. If `whoami` names no domain, ask which domain and
stop.

### 3. Say what will go live, then stop

Tell the user exactly what is about to change, on which domain, and that it goes live on the site
straight away:

- **`gdpr`** — the banner asks every visitor for consent first (opt-in). Whether the site's
  cookies actually wait for that answer is what `/cookiepal:check-one-page` shows.
- **`ccpa`** — every visitor, **including those in the EU and UK, gets an opt-out banner instead of
  being asked for consent first.** Say this plainly, every time: it is the change most likely to be
  made by mistake.
- **`both`** — visitors are asked for consent first, and US visitors get the opt-out banner instead.
- **`regenerate`** — the banner is rebuilt from its current saved settings and republished. Nothing
  in those settings changes.

Ask whether to make this change. **Then stop and wait for the reply.** Nothing has changed yet, and
saying so is part of the question.

- **A clear yes** — go to step 4.
- **Anything else**, including no answer or a different change — nothing is changed. Say so and
  stop. For a different change, start again at step 1.

### 4. Make the change

Call the tool once, with `domainId` set to the domain from step 2:

- `set_banner_mode` with `bannerMode` set to the mode the user said yes to, and nothing else.
- `regenerate_banner` with nothing else.

If the client's approval prompt for the call is declined, nothing changed: say so and stop. Do not
call it again.

### 5. Report

Report the tool's answer as it is, for example the mode now set, or whether the rebuild was queued.
Never say the banner, or the site, is compliant
because of its mode. Whether a banner does what a law requires is what `/cookiepal:check-one-page`
is for.
