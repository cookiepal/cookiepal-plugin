# README media

One recording, and optionally one screenshot. The README is a presentation of the
plugin, not a demo reel. It needs to show the thing working, clearly, once.

## hero.gif

Goes at the top of the README. A `/cookiepal:check-one-page` run, start to verdict.

```sh
brew install vhs
vhs docs/media/hero.tape
```

`/cookiepal:check-one-page` is a Claude Code command, not a shell command. The tape starts
Claude Code first and types into it; typed at a zsh prompt it just produces
`no such file or directory`.

Four things to check before you record:

1. **The plugin is installed** in whatever Claude Code the tape's shell starts.
2. **The MCP server is reachable.** `mcp.cookiepal.io` has no DNS record yet, so
   this needs prod live, or `.mcp.json` pointed at a pre-release server for the
   recording. If you do that, keep the hostname off screen and never commit the
   change.
3. **Run the check once by hand first**, so permission prompts are already
   answered. Otherwise the recording is mostly approval dialogs.
4. **Time that run**, then set the `Sleep` to just past the verdict.

Then:

- Record against a page we control. `cookiepal.io` is fine.
- Keep it under about 2 MB so GitHub renders it quickly.
- Legible at roughly 800px wide, which is what the README renders it at.

## risk-read.png (optional)

A still of the rendered read, which a terminal recording cannot show. Run a check
with `html`, open the file, capture at 1280px, page only, no browser chrome.

Skip it if the GIF carries the page on its own.

## Before committing

- No internal or pre-release hostnames, no real install ID, no local paths with a
  username. This repository is public.
- Check both GitHub themes. If a background looks wrong, use a neutral one or ship
  both and switch with `<picture>` + `<source media="(prefers-color-scheme: dark)">`.
- Replace the `<!-- MEDIA: -->` comments in `README.md` only once the files are
  committed. A broken image is worse than no image.
