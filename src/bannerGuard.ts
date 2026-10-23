/**
 * The question the PreToolUse hook on the banner tools asks. `set_banner_mode`,
 * `customise_banner` and `regenerate_banner` each put a change on the live
 * banner straight away, and Claude Code's own prompt for an MCP tool stops
 * asking once it is told not to, so this asks every time, in Claude Code's own
 * dialog, saying what is about to go live.
 */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** The tools this asks about, by the name after the server prefix. */
export const BANNER_TOOLS = ['set_banner_mode', 'customise_banner', 'regenerate_banner'] as const;

const MODE_NOTES: Record<string, string> = {
  gdpr: 'Every visitor is asked for consent before non-essential cookies are set.',
  ccpa:
    'Every visitor, including those in the EU and UK, gets an opt-out banner instead of being asked for ' +
    'consent first.',
  both: 'Visitors are asked for consent first, and US visitors get the opt-out banner instead.',
};

/** The domain as the call names it, only if it reads as a host name; the dialog shows nothing else from the call. */
const domainOf = (input: Record<string, unknown>): string =>
  typeof input.domainId === 'string' && /^[A-Za-z0-9.-]{1,253}$/.test(input.domainId)
    ? input.domainId
    : "the account's default domain";

const CUSTOMISED_PARTS: [key: string, label: string][] = [
  ['colors', 'colours'],
  ['logo', 'logo'],
  ['positions', 'positions'],
  ['texts', 'texts'],
];

/** What the dialog says, or null for a tool this hook does not ask about. */
export const bannerAskReason = (toolName: unknown, input: unknown): string | null => {
  const tool = typeof toolName === 'string' ? toolName.split('__').at(-1) : undefined;
  if (!tool || !(BANNER_TOOLS as readonly string[]).includes(tool)) return null;
  const call = isRecord(input) ? input : {};
  const domain = domainOf(call);
  const live = 'It goes live on the site straight away. Allow only if you asked for this change.';

  if (tool === 'set_banner_mode') {
    const mode = typeof call.bannerMode === 'string' && call.bannerMode in MODE_NOTES ? call.bannerMode : null;
    const change = mode
      ? `sets the banner mode on ${domain} to ${mode}. ${MODE_NOTES[mode]}`
      : `changes the banner mode on ${domain}.`;
    return `This ${change} ${live}`;
  }
  if (tool === 'customise_banner') {
    const parts = CUSTOMISED_PARTS.filter(([key]) => call[key] !== undefined).map(([, label]) => label);
    return `This changes the banner's ${parts.length > 0 ? parts.join(', ') : 'settings'} on ${domain}. ${live}`;
  }
  return `This rebuilds the banner on ${domain} from its saved settings. ${live}`;
};
