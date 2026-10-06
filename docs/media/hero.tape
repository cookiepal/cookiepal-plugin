# The README's one recording: the plugin doing its job, once, simply.
# Run from the repo root:  vhs docs/media/hero.tape
#
# `/cookiepal:check` is a Claude Code command, not a shell command, so this
# tape starts Claude Code first and types into it. Typing it at a zsh prompt
# just gives you "no such file or directory".
#
# Before recording, check all four:
#   1. The plugin is installed in whatever Claude Code this shell starts.
#   2. The MCP server it points at is reachable. Prod has no DNS record yet,
#      so this needs either prod live or .mcp.json pointed at a pre-release
#      server. If you do that, keep that hostname off screen.
#   3. Run the check once by hand first, so the permission prompts are already
#      answered and the recording is not three approval dialogs.
#   4. Time that run, then set the Sleep below to just past the verdict.

Output docs/media/hero.gif

Set Shell "zsh"
Set FontSize 16
Set Width 1100
Set Height 600
Set Padding 20
Set Theme "Builtin Tango Dark"
Set TypingSpeed 60ms
Set Framerate 12

# Start Claude Code off camera so the recording opens on a ready prompt.
Hide
# Drop the nested-session marker so the recording has no "Transcript saving is off" banner.
Type "unset CLAUDE_CODE_CHILD_SESSION" Enter
Type "clear" Enter
Sleep 500ms
Type "claude" Enter
# Claude Code needs time to boot and connect its MCP server. Too short and the
# typing below is swallowed and you record an empty prompt.
Sleep 25s
Show

Sleep 2s
Type "/cookiepal:check https://cookiepal.io"
# Typing "/" opens Claude Code's command menu. Let it settle, and check on the
# first take that Enter runs the command rather than picking a completion.
Sleep 1500ms
Enter

# Set this to just past the verdict appearing. Trim the tail afterwards rather
# than shipping dead air.
# A real run against cookiepal.io takes about 72s.
Sleep 78s
Sleep 2s
