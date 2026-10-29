/**
 * Banner colours taken from a site's design tokens, for `match-site-design`.
 *
 * The skill reads the repo and names a colour for each banner slot; this turns
 * each into the six-digit hex `customise_banner` takes, and checks every pair
 * the banner draws against WCAG AA. A pair that fails has its foreground moved
 * toward black or white, by as little as passes, so the colours stay the
 * site's own as far as they can. The maths lives here rather than in the skill
 * because a contrast ratio worked out by eye is a guess.
 *
 * The values come from repo files, so they are untrusted text: anything that
 * does not parse as a colour is refused with an error, never passed through.
 */

export type Slot = 'main' | 'secondary' | 'accent' | 'background';

export const SLOTS: Slot[] = ['main', 'secondary', 'accent', 'background'];

/** WCAG AA for body text. The banner's texts are all normal-size, so the large-text 3:1 never applies. */
export const AA_MINIMUM = 4.5;

/** A filled button's text colour, fixed in the banner's stylesheet whatever the palette. */
export const BUTTON_TEXT = '#ffffff';

/**
 * CookiePal's own default palettes (`light1` and `dark1` on the server), used
 * for any slot the repo has no token for. Which one depends on the background,
 * so a dark site does not get black text by default.
 */
const DEFAULTS = {
  light: { main: '#000000', secondary: '#545151', accent: '#ef8600', background: '#ffffff' },
  dark: { main: '#ffffff', secondary: '#b0b0b0', accent: '#ef8600', background: '#000000' },
} as const;

/**
 * Which colour is drawn on which, as the banner's `body.html` and `styles.html`
 * place them. The title and description sit on the background and, in the
 * preference centre and opt-out confirmation, on a lighter panel. The buttons
 * come in two styles: outlined, the accent on the background, and filled,
 * white on the accent. Which button gets which turns on the domain's button
 * theme, which this cannot see and `customise_banner` cannot change, but the
 * customise button is always outlined and the accept button is filled under
 * the default theme, so both are checked every time.
 */
const PAIRS: { name: string; foreground: Slot | 'buttonText'; background: Slot | 'panel' }[] = [
  { name: 'title', foreground: 'main', background: 'background' },
  { name: 'description', foreground: 'secondary', background: 'background' },
  { name: 'title on panels', foreground: 'main', background: 'panel' },
  { name: 'description on panels', foreground: 'secondary', background: 'panel' },
  { name: 'outlined buttons', foreground: 'accent', background: 'background' },
  { name: 'filled buttons', foreground: 'buttonText', background: 'accent' },
];

type Rgb = [number, number, number];

const MAX_INPUT_LENGTH = 64;

class ColourError extends Error {}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const toHex = (rgb: Rgb) =>
  `#${rgb
    .map((channel) =>
      Math.round(clamp(channel) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;

const fromHex = (hex: string): Rgb => {
  const digits = hex.slice(1);
  const full = digits.length <= 4 ? [...digits].map((digit) => digit + digit).join('') : digits;
  const alpha = full.length === 8 ? Number.parseInt(full.slice(6, 8), 16) : 255;
  if (alpha !== 255) throw new ColourError('is not opaque');
  return [0, 2, 4].map((at) => Number.parseInt(full.slice(at, at + 2), 16) / 255) as Rgb;
};

const NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;

/** A number, or a percentage of `percentOf`. `none` is CSS's missing component, which reads as zero. */
const component = (token: string, percentOf: number): number => {
  if (token === 'none') return 0;
  const percent = token.endsWith('%');
  const raw = percent ? token.slice(0, -1) : token;
  if (!NUMBER.test(raw)) throw new ColourError('has a value that is not a number');
  const value = Number(raw);
  return percent ? (value / 100) * percentOf : value;
};

const hue = (token: string): number => {
  const units: [string, number][] = [
    ['deg', 1],
    ['grad', 0.9],
    ['rad', 180 / Math.PI],
    ['turn', 360],
  ];
  const unit = units.find(([suffix]) => token.endsWith(suffix));
  const value = component(unit ? token.slice(0, -unit[0].length) : token, 360);
  return unit ? value * unit[1] : value;
};

/** Splits `a b c / d` or `a, b, c, d`, refusing transparency: a banner background cannot be see-through. */
const components = (body: string): string[] => {
  const [colour, alpha, extra] = body.split('/').map((part) => part.trim());
  const parts = colour.split(/[\s,]+/).filter(Boolean);
  const legacyAlpha = parts.length === 4 ? parts.pop() : undefined;
  const opacity = alpha ?? legacyAlpha;
  if (extra !== undefined || parts.length !== 3) throw new ColourError('does not have three components');
  if (opacity !== undefined && component(opacity, 1) < 1) throw new ColourError('is not opaque');
  return parts;
};

const fromHsl = ([h, s, l]: [number, number, number]): Rgb => {
  const saturation = clamp(s);
  const lightness = clamp(l);
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const f = (n: number) => {
    const k = (n + (((h % 360) + 360) % 360) / 30) % 12;
    return lightness - (chroma / 2) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
};

const encode = (linear: number) =>
  linear <= 0.0031308 ? 12.92 * linear : 1.055 * Math.max(0, linear) ** (1 / 2.4) - 0.055;

const decode = (channel: number) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);

/** OKLCH to sRGB (Björn Ottosson's matrices), clipped to the sRGB gamut the banner can show. */
const fromOklch = ([l, c, h]: [number, number, number]): Rgb => {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const lms = [
    (l + 0.3963377774 * a + 0.2158037573 * b) ** 3,
    (l - 0.1055613458 * a - 0.0638541728 * b) ** 3,
    (l - 0.0894841775 * a - 1.291485548 * b) ** 3,
  ];
  const [L, M, S] = lms;
  return [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ].map((linear) => clamp(encode(linear))) as Rgb;
};

const FUNCTION = /^(rgba?|hsla?|oklch)\((.*)\)$/;

/**
 * Reads one colour as CSS writes it: hex, `rgb()`, `hsl()`, `oklch()` (Tailwind
 * v4's own palette), `white` or `black`, or bare channels as a CSS variable
 * holds them for Tailwind's `<alpha-value>` pattern — `220 14% 96%` is HSL (as
 * shadcn/ui writes it) and `37 99 235` is RGB.
 */
export const parseColour = (input: string): string => {
  const value = input.trim().toLowerCase();
  if (value.length === 0 || value.length > MAX_INPUT_LENGTH) throw new ColourError('is empty or too long');
  if (value === 'white') return '#ffffff';
  if (value === 'black') return '#000000';
  if (/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(value)) return toHex(fromHex(value));
  if (value.includes('var(') || value.includes('color-mix(') || value.includes('theme(')) {
    throw new ColourError('refers to another value; resolve it to the colour it names first');
  }

  const call = FUNCTION.exec(value);
  if (call) {
    const [name, body] = [call[1], call[2]];
    const parts = components(body);
    if (name.startsWith('rgb')) return toHex(parts.map((part) => component(part, 255) / 255) as Rgb);
    if (name.startsWith('hsl')) {
      return toHex(fromHsl([hue(parts[0]), component(parts[1], 100) / 100, component(parts[2], 100) / 100]));
    }
    return toHex(fromOklch([component(parts[0], 1), component(parts[1], 0.4), hue(parts[2])]));
  }

  const parts = value.split(/[\s,]+/);
  if (parts.length === 3 && parts[1].endsWith('%') && parts[2].endsWith('%')) {
    return toHex(fromHsl([hue(parts[0]), component(parts[1], 100) / 100, component(parts[2], 100) / 100]));
  }
  if (parts.length === 3 && parts.every((part) => NUMBER.test(part))) {
    return toHex(parts.map((part) => component(part, 255) / 255) as Rgb);
  }
  throw new ColourError('is not a colour this can read; give a palette name such as blue-600 as the hex it stands for');
};

const luminance = (hex: string) => {
  const [r, g, b] = fromHex(hex).map(decode);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** How much lighter the panels are than the background, per channel: the server's `adjustBrightness(background, 10)`. */
const PANEL_LIFT = Math.round(2.55 * 10);

/**
 * The background of the preference centre's cookie rows and the opt-out
 * confirmation, which the server derives from the banner background when it
 * saves the palette, so the title and description have to read on it too. Only
 * text is drawn there; the accent appears as an icon and a border, which are
 * not text and are not held to 4.5:1.
 */
export const panelBackground = (background: string): string =>
  toHex(fromHex(background).map((channel) => Math.min(255, Math.round(channel * 255) + PANEL_LIFT) / 255) as Rgb);

/** The WCAG 2 contrast ratio, from 1 to 21. */
export const contrast = (one: string, other: string) => {
  const [lighter, darker] = [luminance(one), luminance(other)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
};

const round = (ratio: number) => Math.floor(ratio * 100) / 100;

const mix = (hex: string, toward: Rgb, amount: number): string => {
  const from = fromHex(hex);
  return toHex(from.map((channel, index) => channel + (toward[index] - channel) * amount) as Rgb);
};

const STEPS = 200;

/**
 * The colour nearest `hex` that passes every check, moving it toward black or
 * white in small steps and keeping the first that passes. Undefined when no
 * step in either direction passes them all.
 */
const nearestPassing = (hex: string, passes: (candidate: string) => boolean): string | undefined => {
  for (let step = 0; step <= STEPS; step += 1) {
    const amount = step / STEPS;
    const candidates = [mix(hex, [0, 0, 0], amount), mix(hex, [1, 1, 1], amount)].filter(passes);
    if (candidates.length > 0) return candidates.sort((a, b) => distance(hex, a) - distance(hex, b))[0];
  }
  return undefined;
};

const distance = (one: string, other: string) => {
  const [a, b] = [fromHex(one), fromHex(other)];
  return a.reduce((sum, channel, index) => sum + (channel - b[index]) ** 2, 0);
};

export interface SlotResult {
  colour: string;
  source: 'repo' | 'default';
  /** The colour as the repo wrote it, when it came from the repo. */
  input?: string;
  /** The hex the repo's colour came to, when it had to move to pass. */
  adjustedFrom?: string;
}

export type DesignResult =
  | {
      ok: true;
      passes: boolean;
      colors: Record<Slot, string>;
      slots: Record<Slot, SlotResult>;
      pairs: { name: string; foreground: string; background: string; ratio: number; passes: boolean }[];
      notes: string[];
    }
  | { ok: false; error: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Turns the skill's proposal into the `colors` argument `customise_banner`
 * takes, with every pair checked. All four slots always come back: the tool
 * merges onto whatever the domain has saved, which this cannot see, so sending
 * fewer would leave a pair this never checked.
 */
export const designColours = (raw: unknown): DesignResult => {
  if (!isRecord(raw)) return { ok: false, error: 'Expected a JSON object of colours.' };
  const unknown = Object.keys(raw).filter((key) => !SLOTS.includes(key as Slot));
  if (unknown.length > 0) {
    return { ok: false, error: `Unknown slot ${unknown.join(', ')}; the slots are ${SLOTS.join(', ')}.` };
  }

  const parsed: Partial<Record<Slot, string>> = {};
  for (const slot of SLOTS) {
    const value = raw[slot];
    if (value === undefined || value === null) continue;
    if (typeof value !== 'string') return { ok: false, error: `${slot} must be a string.` };
    try {
      parsed[slot] = parseColour(value);
    } catch (error) {
      if (!(error instanceof ColourError)) throw error;
      return { ok: false, error: `${slot} ${error.message}.` };
    }
  }

  const background = parsed.background ?? DEFAULTS.light.background;
  const defaults = luminance(background) > 0.179 ? DEFAULTS.light : DEFAULTS.dark;

  const slots = {} as Record<Slot, SlotResult>;
  for (const slot of SLOTS) {
    const value = raw[slot];
    const colour = slot === 'background' ? background : (parsed[slot] ?? defaults[slot]);
    slots[slot] =
      typeof value === 'string' ? { colour, source: 'repo', input: value.trim() } : { colour, source: 'default' };
  }

  const notes: string[] = [];
  const passesOn = (bg: string) => (candidate: string) => contrast(candidate, bg) >= AA_MINIMUM;
  const adjust = (slot: Slot, passes: (candidate: string) => boolean) => {
    const current = slots[slot].colour;
    if (passes(current)) return true;
    const nearest = nearestPassing(current, passes);
    if (!nearest) return false;
    slots[slot] = { ...slots[slot], colour: nearest, adjustedFrom: current };
    return true;
  };

  const panel = panelBackground(background);
  const textPasses = (candidate: string) => passesOn(background)(candidate) && passesOn(panel)(candidate);
  const textFits = [adjust('main', textPasses), adjust('secondary', textPasses)];
  if (textFits.includes(false)) {
    notes.push(
      'No text colour works on this background: the preference centre draws the title and description on a ' +
        'slightly lighter panel too, and on a mid-tone background neither dark nor light text reads on both. ' +
        'Use a lighter or darker banner background.',
    );
  }
  const accentPasses = (candidate: string) =>
    passesOn(background)(candidate) && contrast(BUTTON_TEXT, candidate) >= AA_MINIMUM;
  if (!adjust('accent', accentPasses)) {
    notes.push(
      'No accent colour works on this background: filled buttons always have white text, which needs a dark ' +
        'accent, while outlined buttons put the accent on the background, which on a dark background needs a ' +
        'light one. Use a lighter banner background.',
    );
  }

  const colors = Object.fromEntries(SLOTS.map((slot) => [slot, slots[slot].colour])) as Record<Slot, string>;
  const pairs = PAIRS.map((pair) => {
    const foreground = pair.foreground === 'buttonText' ? BUTTON_TEXT : colors[pair.foreground];
    const background = pair.background === 'panel' ? panel : colors[pair.background];
    const ratio = contrast(foreground, background);
    return {
      name: pair.name,
      foreground,
      background,
      ratio: round(ratio),
      passes: ratio >= AA_MINIMUM,
    };
  });

  return { ok: true, passes: pairs.every((pair) => pair.passes), colors, slots, pairs, notes };
};
