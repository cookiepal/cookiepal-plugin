import { type Assessment, consentLine, type Finding } from './assess.ts';

/**
 * Renders the risk read as a self-contained page, so the check can be published
 * as an artifact instead of read as terminal text (CPL-396).
 *
 * The page is built here, in Node, from the assessment: every sentence about a
 * law comes from `laws.ts`, and nothing is written by a model. That is the
 * point of rendering it rather than describing it — a page a model composes
 * could paraphrase legal wording that was reviewed as fixed text.
 *
 * It is one file with no external request in it. The artifact viewer's content
 * policy blocks external images, stylesheets and fetches, so the mark is inline
 * SVG and the CSS is inline; only the typefaces come from Google Fonts, which
 * the policy does allow, and each has a real fallback stack. The artifact
 * publisher wraps the file in its own document skeleton, so this is a fragment:
 * no doctype, html, head or body tags of its own.
 */

/** CookiePal's mark, from `website/src/new/assets/mobile_logo.svg`. */
const MARK =
  '<svg class="mark" width="45" height="35" viewBox="0 0 45 35" fill="none" aria-hidden="true" ' +
  'xmlns="http://www.w3.org/2000/svg">' +
  '<circle cx="33.5654" cy="6.91015" r="2.95507" fill="#EF8600"/>' +
  '<circle cx="28.2519" cy="2.58146" r="1.58146" fill="#EF8600"/>' +
  '<circle cx="38.2601" cy="12.5899" r="1.73961" fill="#EF8600"/>' +
  '<circle cx="38.3731" cy="2.26517" r="1.26517" fill="#EF8600"/>' +
  '<path fill-rule="evenodd" clip-rule="evenodd" d="M34.5887 12.7986C34.4137 12.813 34.2368 12.8203 34.0581 ' +
  '12.8203C30.522 12.8203 27.6555 9.95372 27.6555 6.41763C27.6555 6.23896 27.6628 6.062 27.6771 5.88704C27.5094 ' +
  '5.91212 27.3377 5.92511 27.163 5.92511C25.2589 5.92511 23.7154 4.38158 23.7154 2.47753C23.7154 2.3747 23.7199 ' +
  '2.27293 23.7287 2.17239C22.9215 2.04901 22.0947 1.98502 21.2529 1.98502C12.2767 1.98502 5 9.26169 5 ' +
  '18.2379C5 27.2141 12.2767 34.4908 21.2529 34.4908C30.2291 34.4908 37.5058 27.2141 37.5058 18.2379C37.5058 ' +
  '17.7243 37.482 17.2162 37.4354 16.7147C35.799 16.446 34.5506 15.0252 34.5506 13.3128C34.5506 13.1381 34.5636 ' +
  '12.9664 34.5887 12.7986Z" fill="#EF8600"/>' +
  '<circle cx="13.2464" cy="16.5209" r="3.32107" fill="#5C3E18"/>' +
  '<circle cx="31.8773" cy="20.9189" r="2.34214" fill="#5C3E18"/>' +
  '<circle cx="22.2607" cy="18.2605" r="1.58146" fill="#5C3E18"/>' +
  '<circle cx="20.3627" cy="7.50657" r="1.58146" fill="#5C3E18"/>' +
  '<circle cx="13.4042" cy="25.219" r="1.58146" fill="#5C3E18"/>' +
  '<circle cx="23.0213" cy="27.8774" r="2.34214" fill="#5C3E18"/>' +
  '</svg>';

/**
 * Everything written into the page is either fixed text from `laws.ts` or a
 * name read off a page that may be hostile, so every interpolation goes through
 * here. Quotes and slashes included: a cookie name is printable ASCII, but this
 * must hold even if that ever changes.
 */
const esc = (value: string): string =>
  value.replace(
    /[&<>"'/]/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#47;' })[char] ?? char,
  );

/** How many groups are drawn inline before the rest is left to the inventory. */
const TOP_GROUPS = 8;

const STYLE = `
:root {
  color-scheme: light;
  --bg: #F4F7FD; --surface: #FFFFFF; --ink: #141525; --body: #3A3C55; --muted: #6C6E88;
  --line: #DCE5FA; --rule: #CFDBFF; --brand: #0069EF; --deep: #4B5BE7; --flag: #B35F00;
  --flag-edge: #EF8600; --tint: #EDF0FF; --quiet: #F2F4FA;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    color-scheme: dark;
    --bg: #0D0E18; --surface: #171929; --ink: #EDF0FF; --body: #C4C8E0; --muted: #9B95A8;
    --line: #272A41; --rule: #333756; --brand: #3087FF; --deep: #8A95F2; --flag: #FFA733;
    --flag-edge: #EF8600; --tint: #1B1F36; --quiet: #1E2134;
  }
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #0D0E18; --surface: #171929; --ink: #EDF0FF; --body: #C4C8E0; --muted: #9B95A8;
  --line: #272A41; --rule: #333756; --brand: #3087FF; --deep: #8A95F2; --flag: #FFA733;
  --flag-edge: #EF8600; --tint: #1B1F36; --quiet: #1E2134;
}
* { box-sizing: border-box; }
body {
  margin: 0; background: var(--bg); color: var(--body);
  font-family: "Public Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 16px; line-height: 1.6; -webkit-text-size-adjust: 100%;
}
.page { max-width: 56rem; margin: 0 auto; padding-inline: 16px; padding-block: 2.5rem 4rem; display: flex; flex-direction: column; gap: 2.5rem; }
h1, h2, h3 { color: var(--ink); text-wrap: balance; margin: 0; }
h1 { font-family: "Instrument Serif", Georgia, "Times New Roman", serif; font-weight: 400; font-size: clamp(2rem, 6vw, 2.9rem); line-height: 1.1; letter-spacing: -0.01em; }
h2 { font-family: "Instrument Serif", Georgia, serif; font-weight: 400; font-size: 1.5rem; line-height: 1.2; }
h3 { font-size: 1rem; font-weight: 650; }
p { margin: 0; }
.eyebrow { font-size: .72rem; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; color: var(--muted); }
.masthead { display: flex; align-items: center; gap: .6rem; }
.mark { display: block; width: 30px; height: auto; }
.wordmark { font-weight: 700; color: var(--ink); letter-spacing: -0.01em; }
.head { display: flex; flex-direction: column; gap: 1rem; }
.target { font-family: "JetBrains Mono", ui-monospace, Menlo, monospace; font-size: 1rem; color: var(--brand); overflow-wrap: anywhere; }
.facts { display: flex; flex-wrap: wrap; gap: .4rem 1.25rem; font-size: .85rem; color: var(--muted); }
.facts b { font-weight: 600; color: var(--body); font-variant-numeric: tabular-nums; }
.section { display: flex; flex-direction: column; gap: 1rem; }
.scroller { overflow-x: auto; }
table.grid { width: 100%; border-collapse: collapse; font-size: .85rem; }
table.grid th, table.grid td { border: 1px solid var(--line); padding: .55rem .6rem; text-align: left; }
table.grid thead th { background: var(--quiet); color: var(--ink); font-size: .76rem; font-weight: 650; }
table.grid td.mark-cell { text-align: center; width: 6rem; font-weight: 700; }
table.grid .yes { color: var(--flag); }
table.grid .no { color: var(--muted); font-weight: 400; }
.finding { background: var(--surface); border: 1px solid var(--line); border-left: 4px solid var(--flag-edge); border-radius: 10px; padding: 1.25rem 1.35rem; display: flex; flex-direction: column; gap: .8rem; }
.finding.lead { border-left-color: #C2410C; }
.finding.clean { border-left-color: var(--brand); }
.detail { color: var(--body); }
.shape { font-size: .88rem; color: var(--muted); }
.bars { display: flex; flex-direction: column; gap: .35rem; }
.bar { display: grid; grid-template-columns: 11rem 1fr 3rem; gap: .6rem; align-items: center; font-size: .84rem; }
@media (max-width: 560px) { .bar { grid-template-columns: 7.5rem 1fr 2.4rem; } }
.bar .lbl { color: var(--ink); font-weight: 550; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bar .track { background: var(--quiet); border-radius: 4px; height: .8rem; overflow: hidden; }
.bar .fill { background: var(--brand); height: 100%; border-radius: 4px; }
.bar .num { text-align: right; font-variant-numeric: tabular-nums; color: var(--muted); font-size: .8rem; }
.rest { font-size: .8rem; color: var(--muted); }
.jump { font-size: .84rem; color: var(--brand); text-decoration: none; font-weight: 600; align-self: flex-start; }
.jump:hover { text-decoration: underline; }
.lawline { display: grid; grid-template-columns: 8rem minmax(0, 1fr); gap: .2rem .9rem; font-size: .88rem; padding-block: .5rem; border-top: 1px dotted var(--rule); }
@media (max-width: 560px) { .lawline { grid-template-columns: 1fr; gap: .1rem; } }
.lawline .n { font-weight: 650; color: var(--ink); }
.lawline.off { color: var(--muted); }
.lawline.off .n { color: var(--muted); font-weight: 500; }
.band { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 1.2rem 1.35rem; display: flex; flex-direction: column; gap: .6rem; }
.notes { margin: 0; padding-left: 1.1rem; display: flex; flex-direction: column; gap: .5rem; font-size: .9rem; }
/*
 * The inventory scrolls in its own box, because a long one is longer than the
 * rest of the page put together. The scrollbar is styled rather than left to
 * the platform: macOS hides an overlay scrollbar until the pointer moves over
 * it, which leaves no sign that there are more rows. Styling the webkit
 * scrollbar opts the box out of overlay behaviour, so the bar is there from
 * the first paint.
 */
.invbox {
  max-height: 24rem; overflow: auto; border: 1px solid var(--line); border-radius: 8px;
  background: var(--surface); scrollbar-width: thin; scrollbar-color: var(--deep) var(--quiet);
}
.invbox::-webkit-scrollbar { width: 13px; height: 13px; }
.invbox::-webkit-scrollbar-track { background: var(--quiet); }
.invbox::-webkit-scrollbar-thumb { background: var(--rule); border-radius: 7px; border: 3px solid var(--quiet); }
.invbox::-webkit-scrollbar-thumb:hover { background: var(--deep); }
.invbox::-webkit-scrollbar-corner { background: var(--quiet); }
table.inv { width: 100%; border-collapse: collapse; font-size: .78rem; font-family: "JetBrains Mono", ui-monospace, Menlo, monospace; }
table.inv th, table.inv td { border-bottom: 1px solid var(--line); padding: .32rem .55rem; text-align: left; white-space: nowrap; }
table.inv thead th { position: sticky; top: 0; z-index: 1; background: var(--tint); color: var(--ink); font-size: .7rem; letter-spacing: .06em; text-transform: uppercase; font-family: "Public Sans", sans-serif; box-shadow: inset 0 -1px 0 var(--rule); }
table.inv tbody tr:nth-child(even) { background: var(--quiet); }
table.inv .dim { color: var(--muted); }
.endrow td { text-align: center; color: var(--muted); font-family: "Public Sans", sans-serif; font-size: .75rem; letter-spacing: .06em; text-transform: uppercase; }
.invhead { display: flex; flex-wrap: wrap; gap: .5rem 1rem; align-items: baseline; }
.invhead .count { font-size: .82rem; color: var(--muted); font-variant-numeric: tabular-nums; }
footer { border-top: 1px solid var(--rule); padding-top: 1.25rem; display: flex; flex-direction: column; gap: .6rem; font-size: .85rem; color: var(--muted); }
footer strong { color: var(--ink); }
`;

/** The findings whose own heading should read as the most serious, drawn first. */
const SEVERITY: Record<string, number> = {
  'active-after-reject': 0,
  'set-after-reject': 1,
  'tracking-before-consent': 2,
  'unidentified-cookies': 3,
  'hosts-before-consent': 4,
};

const ordered = (findings: Finding[]) =>
  [...findings].sort((a, b) => (SEVERITY[a.kind] ?? 9) - (SEVERITY[b.kind] ?? 9));

const bars = (finding: Finding): string => {
  if (finding.groups.length === 0) return '';
  const shown = finding.groups.slice(0, TOP_GROUPS);
  const rest = finding.groups.length - shown.length;
  const max = shown[0]?.count ?? 1;
  const drawn = shown
    .map(
      ({ label, count }) =>
        '<div class="bar">' +
        `<span class="lbl" title="${esc(label)}">${esc(label)}</span>` +
        `<span class="track"><span class="fill" style="width:${Math.max(2, Math.round((count / max) * 100))}%"></span></span>` +
        `<span class="num">${count}</span>` +
        '</div>',
    )
    .join('');
  const more = rest > 0 ? `<p class="rest">+ ${rest} more, listed in full below.</p>` : '';
  return `<div class="bars">${drawn}</div>${more}`;
};

const inventoryLink = (finding: Finding): string => {
  if (finding.cookies.length > 0) return '<a class="jump" href="#inventory-cookies">See every cookie below &#8595;</a>';
  if (finding.hosts.length > 0) return '<a class="jump" href="#inventory-hosts">See every host below &#8595;</a>';
  return '';
};

const lawLines = (finding: Finding): string =>
  [...finding.byLaw]
    .sort((a, b) => Number(b.applies) - Number(a.applies))
    .map(
      ({ name, applies, text }) =>
        `<div class="lawline${applies ? '' : ' off'}">` +
        `<span class="n">${esc(name)}</span><span>${esc(text)}</span></div>`,
    )
    .join('');

const findingBlock = (finding: Finding): string =>
  `<article class="finding${(SEVERITY[finding.kind] ?? 9) < 2 ? ' lead' : ''}">` +
  `<h3>${esc(finding.title)}</h3>` +
  `<p class="detail">${esc(finding.detail)}</p>` +
  (finding.shape ? `<p class="shape">${esc(finding.shape)}</p>` : '') +
  bars(finding) +
  inventoryLink(finding) +
  lawLines(finding) +
  '</article>';

const grid = (findings: Finding[]): string =>
  '<section class="section"><p class="eyebrow">What was found, against each law</p>' +
  '<div class="scroller"><table class="grid"><thead><tr><th>What the check found</th>' +
  (findings[0]?.byLaw ?? []).map(({ name }) => `<th class="mark-cell">${esc(name)}</th>`).join('') +
  '</tr></thead><tbody>' +
  findings
    .map(
      (finding) =>
        `<tr><td>${esc(finding.title)}</td>` +
        finding.byLaw
          .map(
            ({ applies }) => `<td class="mark-cell ${applies ? 'yes' : 'no'}">${applies ? 'flagged' : '&#8212;'}</td>`,
          )
          .join('') +
        '</tr>',
    )
    .join('') +
  '</tbody></table></div>' +
  '<p class="shape">Everything marked <strong>flagged</strong> is explained below. A dash means that law does ' +
  'not treat it as a problem, and the reason is given with the finding.</p></section>';

const cleanBlock = (assessment: Assessment): string =>
  '<article class="finding clean">' +
  '<h3>Nothing was flagged on this page</h3>' +
  `<p class="detail">The check read ${assessment.checked.cookies} ` +
  `cookie${assessment.checked.cookies === 1 ? '' : 's'} and ${assessment.checked.thirdPartyHosts} ` +
  `third-party host${assessment.checked.thirdPartyHosts === 1 ? '' : 's'} before any consent was given, and ` +
  'found nothing that is not strictly necessary. ' +
  consentLine(assessment) +
  `</p><p class="shape">${esc(assessment.scope)}</p>` +
  '</article>' +
  // The only place the laws are set out on their own. With findings, each law
  // speaks through the finding it applies to; with none, this is what is left
  // to say, and the check should still name what it was read against.
  '<section class="section"><p class="eyebrow">What each law asks for</p>' +
  assessment.laws
    .map(
      ({ name, where, asks }) =>
        '<article class="finding clean">' +
        `<h3>${esc(name)}</h3><p class="shape">Protects ${esc(where)}</p>` +
        `<p class="detail">${esc(asks)}</p></article>`,
    )
    .join('') +
  '</section>';

const notes = (assessment: Assessment): string =>
  assessment.notes.length === 0
    ? ''
    : '<section class="band"><p class="eyebrow">Worth knowing</p>' +
      `<ul class="notes">${assessment.notes.map((note) => `<li>${esc(note)}</li>`).join('')}</ul></section>`;

/** How many rows fit the box before it starts scrolling; only used to word the hint. */
const ROWS_IN_VIEW = 14;

const scrollHint = (total: number) =>
  total > ROWS_IN_VIEW ? `${total} in total, none left out \u2014 scroll for the rest` : `${total} in total`;

/**
 * The full lists, at the foot of the page. Nothing is
 * truncated: a finding above says the shape, and this holds every row. The box
 * scrolls, with a scrollbar that is visible before the pointer reaches it.
 */
const inventory = (assessment: Assessment): string => {
  const { cookies, hosts } = assessment.inventory;
  const cookieTable =
    cookies.length === 0
      ? ''
      : '<section class="section" id="inventory-cookies">' +
        '<div class="invhead"><h2>Every cookie set before consent</h2>' +
        `<span class="count">${scrollHint(cookies.length)}</span></div>` +
        '<div class="invbox"><table class="inv"><thead><tr><th>Cookie</th><th>Domain</th>' +
        '<th>Category</th><th>Vendor</th></tr></thead><tbody>' +
        cookies
          .map(
            ({ name, domain, category, vendor }) =>
              `<tr><td>${esc(name || '(unnamed)')}</td><td>${esc(domain)}</td>` +
              `<td>${esc(category)}</td>` +
              `<td${vendor ? '' : ' class="dim"'}>${vendor ? esc(vendor) : 'not recognised'}</td></tr>`,
          )
          .join('') +
        `<tr class="endrow"><td colspan="4">End of ${cookies.length} cookies</td></tr>` +
        '</tbody></table></div></section>';

  const hostTable =
    hosts.length === 0
      ? ''
      : '<section class="section" id="inventory-hosts">' +
        '<div class="invhead"><h2>Every third-party host contacted before consent</h2>' +
        `<span class="count">${scrollHint(hosts.length)}</span></div>` +
        '<div class="invbox"><table class="inv"><thead><tr><th>Host</th><th>Domain</th></tr></thead><tbody>' +
        hosts.map(({ host, domain }) => `<tr><td>${esc(host)}</td><td class="dim">${esc(domain)}</td></tr>`).join('') +
        `<tr class="endrow"><td colspan="2">End of ${hosts.length} hosts</td></tr>` +
        '</tbody></table></div></section>';

  return cookieTable + hostTable;
};

/** The page title names the site checked, so it is picked out of a gallery of many. */
const titleFor = (page: string): string => {
  try {
    return `${new URL(page).host} cookie check`;
  } catch {
    return 'Cookie check';
  }
};

/** Everything that belongs in a document head: the title, the typefaces and the styles. */
const headOf = (assessment: Assessment): string =>
  `<title>${esc(titleFor(assessment.page))}</title>` +
  '<link rel="preconnect" href="https://fonts.googleapis.com">' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1' +
  '&family=JetBrains+Mono:wght@400;500&family=Public+Sans:wght@400;500;600;700&display=swap">' +
  `<style>${STYLE}</style>`;

/** Everything that belongs in a document body. */
const bodyOf = (assessment: Assessment): string => {
  const when = assessment.checkedAt ? assessment.checkedAt.slice(0, 10) : null;
  const findings = ordered(assessment.findings);
  const facts = [
    `<span>Cookies before consent <b>${assessment.checked.cookies}</b></span>`,
    `<span>Third-party hosts <b>${assessment.checked.thirdPartyHosts}</b></span>`,
    `<span>Consent action <b>${assessment.checked.consentTested ? 'tested' : 'not tested'}</b></span>`,
    assessment.country ? `<span>Ran from <b>${esc(assessment.country)}</b></span>` : '',
    when ? `<span>Checked <b>${esc(when)}</b></span>` : '',
  ].join('');

  return (
    '<main class="page">' +
    '<header class="head">' +
    `<div class="masthead">${MARK}<span class="wordmark">CookiePal</span></div>` +
    '<h1>What this page did before anyone agreed</h1>' +
    `<p class="target">${esc(assessment.page)}</p>` +
    `<div class="facts">${facts}</div>` +
    '</header>' +
    (assessment.clean ? '' : grid(findings)) +
    `<section class="section">${assessment.clean ? cleanBlock(assessment) : findings.map(findingBlock).join('')}</section>` +
    notes(assessment) +
    inventory(assessment) +
    '<footer>' +
    `<p><strong>Scope.</strong> ${esc(assessment.scope)}</p>` +
    `<p><strong>Not a verdict.</strong> ${esc(assessment.noVerdict)}</p>` +
    '<p>Checked on this machine with the CookiePal plugin for Claude Code. ' +
    'The page was loaded in a temporary browser profile; no cookie values were read.</p>' +
    '</footer>' +
    '</main>'
  );
};

/**
 * The page as the artifact publisher wants it: a fragment, with no doctype,
 * html, head or body tags of its own, which it wraps in its own shell.
 */
export const renderReport = (assessment: Assessment): string => headOf(assessment) + bodyOf(assessment);

/**
 * The same page as a file someone can open in a browser.
 *
 * A file on disk has no publisher to wrap it, so this adds the equivalent
 * shell: the doctype that keeps the browser out of quirks mode, the charset and
 * viewport metas, and the few base rules the publisher applies. The head and
 * body content are the same, so the file looks like the published page rather
 * than merely holding the same words.
 */
export const renderDocument = (assessment: Assessment): string =>
  '<!doctype html>\n<html lang="en">\n<head>\n' +
  '<meta charset="utf-8">\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
  `${headOf(assessment)}\n` +
  '<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n' +
  `</head>\n<body>\n${bodyOf(assessment)}\n</body>\n</html>\n`;
