/** Longest a string read from the page may be when it reaches Claude. */
export const MAX_PAGE_TEXT = 100;

// Control characters, the soft hyphen, zero-width and bidi controls, line and
// paragraph separators, the BOM and the invisible tag block: the ways page text
// hides instructions or reorders what a reader sees.
const HIDDEN: [number, number][] = [
  [0x0000, 0x001f],
  [0x007f, 0x009f],
  [0x00ad, 0x00ad],
  [0x200b, 0x200f],
  [0x2028, 0x202e],
  [0x2060, 0x206f],
  [0xfeff, 0xfeff],
  [0xe0000, 0xe007f],
];

const isHidden = (char: string) => {
  const point = char.codePointAt(0) ?? 0;
  return HIDDEN.some(([from, to]) => point >= from && point <= to);
};

/**
 * Makes a string read from the page safe to show: hidden characters removed,
 * whitespace collapsed, and capped. The caller still labels it as page content,
 * because a short, visible string can still carry an instruction.
 */
export const pageText = (raw: unknown): string | null => {
  if (typeof raw !== 'string') return null;
  // Sliced first, so a page with a megabyte of title costs nothing to clean.
  const chars = [
    ...[...raw.slice(0, 4 * MAX_PAGE_TEXT)]
      .map((char) => (isHidden(char) ? ' ' : char))
      .join('')
      .replace(/\s+/g, ' ')
      .trim(),
  ];
  if (!chars.length) return null;
  return chars.length > MAX_PAGE_TEXT ? `${chars.slice(0, MAX_PAGE_TEXT - 1).join('')}…` : chars.join('');
};
