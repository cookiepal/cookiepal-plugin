import type { ButtonMatchers, ConsentPlan } from './plan.ts';

/**
 * Finding a consent banner and its accept or reject button, in the page.
 *
 * This is not `consent.ts`, which is the install-ID question. Nothing here
 * decides anything about the user: it finds one button and presses it.
 *
 * The matchers come from the server, so they are treated as data throughout.
 * They reach the page as JSON arguments to a fixed function — never spliced
 * into script or into a selector string beyond the one fixed
 * `[data-cookiepal-tag="…"]` template, and only after `parsePlan` has held each
 * one to `[A-Za-z0-9_-]`. The function below reads the DOM and clicks; it never
 * navigates, and never follows a link.
 */

/**
 * Why no button was pressed. All but `load-failed` describe the page; that one
 * says this run's own load never completed, so nothing is known about its
 * banner either way and the page is not being reported on.
 */
export type ConsentSkipReason = 'no-banner' | 'no-button' | 'ambiguous-button' | 'load-failed' | 'click-failed';

/** Which tier of matcher found the button. `text` is the weakest and is worth reporting. */
export type MatchedBy = 'tag' | 'id' | 'class' | 'text';

export interface Located {
  bannerFound: boolean;
  /**
   * The page's `window.cookiepal.rejectByDefault`: its CookiePal banner claims
   * to apply reject on load, so the arrival reading may already be the rejected
   * state. Any page can set this global, so it is never treated as proof and
   * never suppresses the reject press — the check still presses reject and
   * reports what that did. It is reported alongside, as the page's own claim.
   */
  rejectByDefault: boolean;
  matchedBy: MatchedBy | null;
  reason: ConsentSkipReason | null;
  /** The button's own label. Page content: it goes through `pageText` before anyone sees it. */
  label: string | null;
  /** Viewport centre of the button, for a real mouse click. */
  point: { x: number; y: number } | null;
  /** True when something else sits over the button's centre, so a mouse click would miss. */
  covered: boolean;
}

export const NOT_LOCATED: Located = {
  bannerFound: false,
  rejectByDefault: false,
  matchedBy: null,
  reason: 'no-banner',
  label: null,
  point: null,
  covered: false,
};

/**
 * Runs in the page. Written as one self-contained function with no imports and
 * no closure over anything, because its source is sent to the browser as text.
 * It leaves the element it found on `window.__cookiepalCheckTarget`, so a
 * covered button can still be clicked without searching for it twice.
 */
const LOCATE = function locate(banner: ConsentPlan['banner'], matchers: ButtonMatchers): Located {
  const CLICKABLE = 'button, input[type=button], input[type=submit], a, [role=button]';

  const visible = (element: Element): boolean => {
    const box = element.getBoundingClientRect();
    if (box.width <= 0 || box.height <= 0 || !element.getClientRects().length) return false;
    const style = getComputedStyle(element);
    if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) return false;
    return !(element as HTMLButtonElement).disabled && element.getAttribute('aria-disabled') !== 'true';
  };

  /** A link that would take the browser to another page is not pressed: the reading would be of that page. */
  const navigatesAway = (element: Element): boolean => {
    const href = element instanceof HTMLAnchorElement ? element.href : '';
    if (!href) return false;
    const here = `${location.origin}${location.pathname}${location.search}`;
    return href.split('#')[0] !== here;
  };

  const clickable = (element: Element | null): element is Element =>
    !!element?.matches(CLICKABLE) && visible(element) && !navigatesAway(element);

  /** The banner, or the document when only a body keyword said there was one. */
  let root: Element | Document | null = null;
  for (const id of banner.ids) {
    const found = document.getElementById(id);
    if (found) {
      root = found;
      break;
    }
  }
  if (!root) {
    for (const className of banner.classes) {
      const [found] = document.getElementsByClassName(className);
      if (found) {
        root = found;
        break;
      }
    }
  }
  let bannerFound = root !== null;
  if (!root) {
    const text = (document.body?.innerText || '').toLowerCase();
    if (banner.keywords.some((keyword) => text.includes(keyword))) {
      root = document;
      bannerFound = true;
    }
  }

  // What the page says about itself. A page sets this global, so it proves nothing: it is
  // reported as the page's own claim and never decides what the check does. See `Located`.
  const cookiepal = (window as unknown as { cookiepal?: { rejectByDefault?: unknown } }).cookiepal;
  const rejectByDefault = cookiepal?.rejectByDefault === true;

  const blank: Located = {
    bannerFound,
    rejectByDefault,
    matchedBy: null,
    reason: bannerFound ? 'no-button' : 'no-banner',
    label: null,
    point: null,
    covered: false,
  };
  if (!root) return blank;
  const within = (element: Element) => root === document || (root as Element).contains(element);

  /**
   * Each matcher is tried on its own. One matching button is pressed; two or
   * more is an ambiguity, and the check moves on rather than guessing.
   *
   * The flag is never reset between tiers: an ambiguity in any tier is why no
   * button was pressed, even when a later tier simply found nothing, so the
   * run reports "more than one matched" rather than "none matched".
   */
  let ambiguous = false;
  const only = (found: Element[]): Element | null => {
    const candidates = found.filter((element) => clickable(element) && within(element));
    const distinct = candidates.filter((element, index) => candidates.indexOf(element) === index);
    if (distinct.length > 1) ambiguous = true;
    return distinct.length === 1 ? distinct[0] : null;
  };

  const scope: ParentNode = root;
  const tiers: [MatchedBy, () => Element | null][] = [
    [
      'tag',
      () => {
        for (const tag of matchers.tags) {
          // The only selector built from a matcher, and `tag` is `[A-Za-z0-9_-]` by then.
          const hit = only([...document.querySelectorAll(`[data-cookiepal-tag="${tag}"]`)]);
          if (hit) return hit;
        }
        return null;
      },
    ],
    [
      'id',
      () => {
        for (const id of matchers.ids) {
          const element = document.getElementById(id);
          const hit = only(element ? [element] : []);
          if (hit) return hit;
        }
        return null;
      },
    ],
    [
      'class',
      () => {
        for (const className of matchers.classes) {
          const hit = only([...document.getElementsByClassName(className)]);
          if (hit) return hit;
        }
        return null;
      },
    ],
    [
      'text',
      () => {
        const buttons = [...scope.querySelectorAll(CLICKABLE)].filter(
          (element) => clickable(element) && within(element),
        );
        // The server lists the most specific label first, so "reject all" wins over "reject".
        for (const wanted of matchers.texts) {
          const hit = only(
            buttons.filter((element) => {
              const label = ((element as HTMLElement).innerText || element.textContent || '')
                .replace(/\s+/g, ' ')
                .trim()
                .toLowerCase();
              const value = element instanceof HTMLInputElement ? element.value.trim().toLowerCase() : '';
              return label.includes(wanted) || value.includes(wanted);
            }),
          );
          if (hit) return hit;
        }
        return null;
      },
    ],
  ];

  for (const [matchedBy, find] of tiers) {
    const element = find();
    if (!element) continue;

    (window as unknown as { __cookiepalCheckTarget?: Element }).__cookiepalCheckTarget = element;
    const box = element.getBoundingClientRect();
    const point = { x: Math.round(box.left + box.width / 2), y: Math.round(box.top + box.height / 2) };
    const onTop = document.elementFromPoint(point.x, point.y);
    return {
      bannerFound,
      rejectByDefault,
      matchedBy,
      reason: null,
      label:
        ((element as HTMLElement).innerText || element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200) ||
        null,
      point,
      covered: !(onTop === element || element.contains(onTop)),
    };
  }

  return { ...blank, reason: ambiguous ? 'ambiguous-button' : blank.reason };
};

/** Clicks whatever `locate` last found, for a button a mouse click cannot reach. */
const CLICK_TARGET = function clickTarget(): boolean {
  const element = (window as unknown as { __cookiepalCheckTarget?: HTMLElement }).__cookiepalCheckTarget;
  if (!element) return false;
  element.click();
  return true;
};

const call = (fn: unknown, ...args: unknown[]) =>
  // The arguments are JSON, so a matcher is a value in the page's script, never part of it.
  `(${String(fn)})(${args.map((argument) => JSON.stringify(argument)).join(',')})`;

export const locateExpression = (consent: ConsentPlan, matchers: ButtonMatchers): string =>
  call(LOCATE, consent.banner, matchers);

export const clickTargetExpression = (): string => call(CLICK_TARGET);

const REASONS = new Set<string>(['no-banner', 'no-button', 'ambiguous-button', 'load-failed', 'click-failed']);
const TIERS = new Set<string>(['tag', 'id', 'class', 'text']);

/**
 * Reads back what the page returned. The page could answer with anything, so
 * every field is checked before it is used, and the label is left as a raw
 * string for `pageText` to clean.
 */
export const parseLocated = (raw: unknown): Located => {
  if (typeof raw !== 'object' || raw === null) return NOT_LOCATED;
  const value = raw as Record<string, unknown>;
  const point = value.point as { x?: unknown; y?: unknown } | null | undefined;
  const usable = typeof point?.x === 'number' && typeof point?.y === 'number' && Number.isFinite(point.x);
  return {
    bannerFound: value.bannerFound === true,
    rejectByDefault: value.rejectByDefault === true,
    matchedBy: TIERS.has(value.matchedBy as string) ? (value.matchedBy as MatchedBy) : null,
    reason: REASONS.has(value.reason as string) ? (value.reason as ConsentSkipReason) : null,
    label: typeof value.label === 'string' ? value.label : null,
    point: usable ? { x: point?.x as number, y: point?.y as number } : null,
    covered: value.covered === true,
  };
};
