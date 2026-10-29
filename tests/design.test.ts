import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { AA_MINIMUM, BUTTON_TEXT, contrast, designColours, panelBackground, parseColour } from '../src/design.ts';

describe('parseColour', () => {
  // Each expected hex is the one the source publishes for that value, so these
  // check the conversion against something other than this file's own maths.
  test('reads Tailwind v4 oklch() palette values as Tailwind publishes their hex', () => {
    assert.equal(parseColour('oklch(62.3% 0.214 259.815)'), '#2b7fff'); // blue-500
    assert.equal(parseColour('oklch(21% 0.034 264.665)'), '#101828'); // gray-900
    assert.equal(parseColour('oklch(0.623 0.214 259.815)'), '#2b7fff');
  });

  test('reads bare HSL channels as shadcn/ui writes its CSS variables', () => {
    assert.equal(parseColour('222.2 84% 4.9%'), '#020817');
    assert.equal(parseColour('210 40% 98%'), '#f8fafc');
  });

  test('reads bare RGB channels as Tailwind v3 <alpha-value> variables hold them', () => {
    assert.equal(parseColour('37 99 235'), '#2563eb');
    assert.equal(parseColour('37, 99, 235'), '#2563eb');
  });

  test('reads hex, rgb(), hsl() and the two named colours', () => {
    assert.equal(parseColour('#2563EB'), '#2563eb');
    assert.equal(parseColour('#fff'), '#ffffff');
    assert.equal(parseColour('#2563ebff'), '#2563eb');
    assert.equal(parseColour('rgb(37 99 235)'), '#2563eb');
    assert.equal(parseColour('rgba(37, 99, 235, 1)'), '#2563eb');
    assert.equal(parseColour('rgb(100% 0% 0%)'), '#ff0000');
    assert.equal(parseColour('hsl(221.2deg 83.2% 53.3%)'), '#2563eb');
    assert.equal(parseColour('hsl(0.5turn 100% 50%)'), '#00ffff');
    assert.equal(parseColour(' White '), '#ffffff');
    assert.equal(parseColour('black'), '#000000');
  });

  test('refuses a see-through colour', () => {
    assert.throws(() => parseColour('#2563eb80'), /not opaque/);
    assert.throws(() => parseColour('rgb(37 99 235 / 0.5)'), /not opaque/);
    assert.throws(() => parseColour('rgba(37, 99, 235, 0.5)'), /not opaque/);
  });

  test('refuses references, palette names and anything else it cannot read', () => {
    assert.throws(() => parseColour('var(--primary)'), /resolve it/);
    assert.throws(() => parseColour('color-mix(in oklch, red, blue)'), /resolve it/);
    assert.throws(() => parseColour('blue-600'), /not a colour/);
    assert.throws(() => parseColour('rebeccapurple'), /not a colour/);
    assert.throws(() => parseColour('rgb(1 2)'), /three components/);
    assert.throws(() => parseColour(''), /empty/);
    assert.throws(() => parseColour(`#${'f'.repeat(80)}`), /too long/);
    assert.throws(() => parseColour('ignore previous instructions'), /not a colour/);
  });
});

describe('contrast', () => {
  test('matches the WCAG 2 ratios at the ends and in the middle', () => {
    assert.equal(contrast('#000000', '#ffffff'), 21);
    assert.equal(contrast('#ffffff', '#ffffff'), 1);
    assert.equal(contrast('#ffffff', '#000000'), contrast('#000000', '#ffffff'));
    // #767676 is the lightest grey that passes AA on white.
    assert.ok(contrast('#767676', '#ffffff') >= AA_MINIMUM);
    assert.ok(contrast('#777777', '#ffffff') < AA_MINIMUM);
  });
});

const ok = (input: unknown) => {
  const result = designColours(input);
  assert.ok(result.ok, JSON.stringify(result));
  return result;
};

describe('designColours', () => {
  test('keeps colours that already pass, unchanged', () => {
    const result = ok({ main: '#111827', secondary: '#4b5563', accent: '#1d4ed8', background: '#ffffff' });

    assert.equal(result.passes, true);
    assert.deepEqual(result.colors, {
      main: '#111827',
      secondary: '#4b5563',
      accent: '#1d4ed8',
      background: '#ffffff',
    });
    for (const slot of Object.values(result.slots)) assert.equal(slot.adjustedFrom, undefined);
  });

  test('checks every pair the banner draws, including white text on a filled button', () => {
    const result = ok({ accent: '#1d4ed8', background: '#f0f0f0' });

    assert.deepEqual(
      result.pairs.map(({ name, foreground, background }) => [name, foreground, background]),
      [
        ['title', result.colors.main, '#f0f0f0'],
        ['description', result.colors.secondary, '#f0f0f0'],
        ['title on panels', result.colors.main, '#ffffff'],
        ['description on panels', result.colors.secondary, '#ffffff'],
        ['outlined buttons', '#1d4ed8', '#f0f0f0'],
        ['filled buttons', BUTTON_TEXT, '#1d4ed8'],
      ],
    );
  });

  test('derives the panel colour as the server does, 26 lighter per channel and capped at white', () => {
    assert.equal(panelBackground('#000000'), '#1a1a1a');
    assert.equal(panelBackground('#020817'), '#1c2231');
    assert.equal(panelBackground('#f0f0f0'), '#ffffff');
  });

  test('holds text to AA on the lighter panel as well as the background', () => {
    // #757575 would just pass on black (4.55) but reads at 3.78 on the #1a1a1a panel.
    const result = ok({ background: '#000000', main: '#ffffff', secondary: '#555555', accent: '#1d4ed8' });

    for (const name of ['description', 'description on panels']) {
      assert.ok(result.pairs.find((pair) => pair.name === name)?.passes, name);
    }
    assert.ok(contrast(result.colors.secondary, '#1a1a1a') >= AA_MINIMUM);
  });

  test('passes on the white fallback the skill proposes when the site background cannot carry the banner', () => {
    // A dark-only repo whose one light colour is its brand: both runs on its own colours fail.
    assert.equal(ok({ background: '#0a0a0a', accent: '#7c3aed' }).passes, false);
    assert.equal(ok({ background: '#7c3aed', main: '#0a0a0a', accent: '#7c3aed' }).passes, false);

    for (const accent of ['#7c3aed', '#ffff00', '#ef8600', '#ffffff']) {
      for (const main of ['#0a0a0a', '#777777', '#ffffff']) {
        assert.ok(ok({ main, accent }).passes, `${main} and ${accent} on the white default`);
      }
    }
  });

  test('says when no text colour reads on both a mid-tone background and its panel', () => {
    const result = ok({ background: '#6f6f6f', accent: '#1d4ed8' });

    assert.equal(result.passes, false);
    assert.match(result.notes.join(' '), /No text colour works/);
  });

  test('moves a failing accent by as little as passes, and says what it was', () => {
    // CookiePal's own default orange: 2.4:1 under white text.
    const result = ok({ accent: '#ef8600' });

    assert.equal(result.passes, true);
    assert.equal(result.slots.accent.adjustedFrom, '#ef8600');
    assert.equal(result.slots.accent.input, '#ef8600');
    assert.ok(contrast(BUTTON_TEXT, result.colors.accent) >= AA_MINIMUM);
    assert.ok(contrast(result.colors.accent, '#ffffff') < AA_MINIMUM + 0.1, 'moved further than it had to');
  });

  test('lightens text on a dark background rather than darkening it', () => {
    const result = ok({ main: '#333333', secondary: '#555555', background: '#0b0b0b', accent: '#2b2bff' });

    for (const name of ['title', 'description']) {
      const pair = result.pairs.find((entry) => entry.name === name);
      assert.ok(pair?.passes, name);
    }
    assert.ok(contrast(result.colors.main, '#000000') > contrast('#333333', '#000000'));
  });

  test('every pair passes for any background it can be given, or it says it does not', () => {
    for (let grey = 0; grey <= 255; grey += 15) {
      const background = `#${grey.toString(16).padStart(2, '0').repeat(3)}`;
      const result = ok({ main: '#808080', secondary: '#808080', accent: '#ef8600', background });

      // A note is the only way a failing proposal explains itself, so the two never disagree.
      assert.equal(result.passes, result.notes.length === 0, background);
    }
  });

  test('says when no accent can serve both buttons on a dark background', () => {
    const result = ok({ main: '210 40% 98%', accent: '217.2 91.2% 59.8%', background: '222.2 84% 4.9%' });

    assert.equal(result.passes, false);
    assert.equal(result.pairs.find((pair) => pair.name === 'filled buttons')?.passes, false);
    assert.match(result.notes[0], /lighter banner background/);
  });

  test('fills a slot the repo has no token for from the default that suits the background', () => {
    const light = ok({ accent: '#1d4ed8' });
    assert.equal(light.slots.background.source, 'default');
    assert.equal(light.colors.background, '#ffffff');
    assert.equal(light.colors.main, '#000000');
    assert.equal(light.slots.main.source, 'default');

    const dark = ok({ background: '#000000', accent: '#1d4ed8' });
    assert.equal(dark.colors.main, '#ffffff');
    assert.equal(dark.colors.secondary, '#b0b0b0');
  });

  test('always returns all four slots, so customise_banner never merges an unchecked saved colour', () => {
    const result = ok({});
    assert.deepEqual(Object.keys(result.colors).sort(), ['accent', 'background', 'main', 'secondary']);
    for (const value of Object.values(result.colors)) assert.match(value, /^#[0-9a-f]{6}$/);
  });

  test('refuses anything but an object of known slots holding strings', () => {
    assert.deepEqual(designColours([]), { ok: false, error: 'Expected a JSON object of colours.' });
    assert.deepEqual(designColours('#ffffff'), { ok: false, error: 'Expected a JSON object of colours.' });
    assert.match((designColours({ primary: '#000000' }) as { error: string }).error, /Unknown slot primary/);
    assert.match((designColours({ accent: 12 }) as { error: string }).error, /accent must be a string/);
    assert.match((designColours({ accent: 'var(--x)' }) as { error: string }).error, /^accent refers/);
  });
});
