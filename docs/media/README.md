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
2. **The MCP server is reachable.** If you point `.mcp.json` at a pre-release
   server for the recording, keep the hostname off screen and never commit the
   change.
3. **Run the check once by hand first**, so permission prompts are already
   answered. Otherwise the recording is mostly approval dialogs.
4. **Time that run**, then set the `Sleep` to just past the verdict.

Then:

- Record against a page we control. `cookiepal.io` is fine.
- Keep it under about 2 MB so GitHub renders it quickly.
- Legible at roughly 800px wide, which is what the README renders it at.

The tape writes the whole run to `/tmp/cookiepal-hero-raw.gif`, about 90 seconds and 5 MB,
so the raw take never lands in the repository. Cut it down with ffmpeg:
keep the typing, speed the wait up, scroll the read at a readable pace, and hold the
last frame. Find the cut points first: the read starts printing once Claude Code
stops "thinking", and `freezedetect` shows where the screen goes still at the end.

```sh
ffmpeg -i /tmp/cookiepal-hero-raw.gif -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" raw.mp4
ffmpeg -i raw.mp4 -vf "freezedetect=n=0.001:d=2" -map 0:v -f null - 2>&1 | grep freeze_start
```

Then, with the typing from 2.5s to 9.5s, the wait to 75s and the read ending at 88.6s:

```sh
ffmpeg -i raw.mp4 -filter_complex "\
[0:v]trim=2.5:9.5,setpts=(PTS-STARTPTS)/1.4[a];\
[0:v]trim=9.5:75,setpts=(PTS-STARTPTS)/20[b];\
[0:v]trim=75:88.6,setpts=(PTS-STARTPTS)/2.5[c];\
[a][b][c]concat=n=3:v=1:a=0,tpad=stop_mode=clone:stop_duration=4,fps=6,scale=860:-1:flags=lanczos,split[s0][s1];\
[s0]palettegen=max_colors=32:stats_mode=diff[p];[s1][p]paletteuse=dither=none:diff_mode=rectangle" docs/media/hero.gif
```

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
