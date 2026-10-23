import {
  type Assessment,
  cleanCaveat,
  consentLine,
  type Finding,
  type InventoryCookie,
  type InventoryHost,
  ordered,
  vendorText,
} from './assess.ts';
import { FLAG_KEY } from './laws.ts';

/**
 * The risk read as text (CPL-396), in two shapes that share everything but
 * their completeness: what is printed in the terminal, and what is written to
 * a `.md` file. It is rendered here, in code, for
 * the same reason the page is: every sentence about a law is fixed text from
 * `laws.ts`, and text the model retypes is text the model can drift. The skill
 * prints this verbatim rather than composing its own summary.
 *
 * It is not the page's layout in plain text. A terminal is about a hundred
 * columns wide, has finite scrollback and cannot scroll a box, so:
 *
 * - no law-by-finding grid, which needs five columns to be read at once;
 * - no bars, which are noise in a monospace column; counts go in a short table;
 * - fewer groups than the page draws, because each row costs a line here;
 * - the inventory is never printed unasked. It is offered, and `renderInventory`
 *   prints it when the user asks for it.
 *
 * Markdown, because Claude Code renders it. Nothing is hard-wrapped: the
 * renderer reflows prose to the window, and a hard wrap would fight it.
 *
 * The `.md` file is the same read as a document rather than as output: it adds
 * the law-by-finding grid and the full inventory, because a file is kept and
 * reread, and nothing in it has to be asked for a second time. It is the same
 * content as the page, not the same appearance — Markdown carries no styling,
 * so the branding and the layout are the page's alone.
 */

/** Groups shown per finding. The page draws eight; a line is dearer in a terminal. */
const TOP_GROUPS = { terminal: 5, document: 8 };

/**
 * A name read off the page, made inert: every character Markdown gives a meaning
 * is escaped, the backslash first so an escape cannot be undone by one already in
 * the name. A pipe would otherwise break the table it sits in, and brackets would
 * make a live link out of text the page chose.
 */
const inert = (value: string) => value.replace(/[\\`*_[\]()<>|~#!]/g, '\\$&');

const cell = (value: string) => inert(value).replace(/\r?\n/g, ' ');

const groupTable = (finding: Finding, top: number): string[] => {
  if (finding.groups.length === 0) return [];
  const { of, unit } = finding.groupLabel ?? { of: 'Group', unit: 'Count' };
  const shown = finding.groups.slice(0, top);
  const rest = finding.groups.slice(top);
  const restCount = rest.reduce((total, { count }) => total + count, 0);
  const rows = shown.map(({ label, count }) => `| ${cell(label)} | ${count} |`);
  if (rest.length > 0) rows.push(`| _+ ${rest.length} more_ | ${restCount} |`);
  return ['', `| ${of} | ${unit} |`, '| --- | ---: |', ...rows];
};

const cookieTable = (cookies: InventoryCookie[]): string[] => [
  '| Cookie | Domain | Category | Vendor |',
  '| --- | --- | --- | --- |',
  ...cookies.map(
    (cookie) =>
      `| ${cell(cookie.name || '(unnamed)')} | ${cell(cookie.domain)} | ${cookie.category} | ` +
      `${cookie.vendor ? cell(cookie.vendor) : `_${vendorText(cookie)}_`} |`,
  ),
];

const hostTable = (hosts: InventoryHost[]): string[] => [
  '| Host | Domain |',
  '| --- | --- |',
  ...hosts.map(({ host, domain }) => `| ${cell(host)} | ${cell(domain)} |`),
];

const FULL_ROWS_IN_FILES = '_Each cookie is listed in full in the HTML and Markdown read._';

/**
 * The rows a finding read after reject. The inventory is the arrival reading and
 * does not hold them, so the document lists every one here. The terminal lists a
 * finding's cookies only when it has no vendor table for them: a reject that leaves
 * 78 cookies behind reads by vendor there, as the arrival does, and the rows stay in
 * the files, which every check writes whatever form is picked.
 */
const listedRows = ({ listed, groups }: Finding, complete: boolean): string[] => {
  if (listed.cookies.length + listed.hosts.length === 0) return [];
  const cookieRows = complete || groups.length === 0 ? cookieTable(listed.cookies) : [FULL_ROWS_IN_FILES];
  return [
    '',
    '_Read after the reject button was pressed:_',
    ...(listed.cookies.length > 0 ? ['', ...cookieRows] : []),
    ...(listed.hosts.length > 0 ? ['', ...hostTable(listed.hosts)] : []),
  ];
};

/**
 * Every law, every time, each in its own words. A law the finding is not a
 * problem under is marked and still given its reason, because "why this does
 * not count here" is as much of the read as why it does.
 */
const lawLines = (finding: Finding): string[] =>
  [...finding.byLaw]
    .sort((a, b) => Number(b.applies) - Number(a.applies))
    .map(({ name, applies, text }) => `- **${name}** — ${applies ? text : `_Not a finding here._ ${text}`}`);

const findingBlock = (finding: Finding, index: number, top: number, complete: boolean): string[] => {
  return [
    '',
    `### ${index}. ${finding.title}`,
    '',
    finding.detail,
    ...(finding.shape ? ['', `_${finding.shape}_`] : []),
    ...groupTable(finding, top),
    ...listedRows(finding, complete),
    '',
    ...lawLines(finding),
  ];
};

const header = (assessment: Assessment): string[] => {
  const { checked, country } = assessment;
  const where = country ? `from ${country}` : 'from an unknown country';
  return [
    `## CookiePal check: ${inert(assessment.page)}`,
    '',
    `One page, loaded once in a fresh browser on this machine ${where}. Not a full site scan, and nothing in any CookiePal account changed.`,
    '',
    `**${checked.cookies}** ${checked.cookies === 1 ? 'cookie' : 'cookies'} before consent · ` +
      `**${checked.thirdPartyHosts}** third-party ${checked.thirdPartyHosts === 1 ? 'host' : 'hosts'} · ` +
      `consent action **${checked.consentTested ? 'tested' : 'not tested'}**`,
  ];
};

const footer = (assessment: Assessment): string[] => [
  '',
  '---',
  '',
  `**Scope.** ${assessment.scope}`,
  '',
  `**Not a verdict.** ${assessment.noVerdict}`,
];

/** The law-by-finding grid, which only the document carries: it is five columns wide. */
const gridTable = (findings: Finding[]): string[] => {
  if (findings.length === 0) return [];
  const laws = findings[0]?.byLaw ?? [];
  return [
    '',
    '### What was found, against each law',
    '',
    `| What the check found | ${laws.map(({ name }) => name).join(' | ')} |`,
    `| --- |${laws.map(() => ' :-: |').join('')}`,
    ...findings.map(
      (finding) =>
        `| ${cell(finding.title)} | ${finding.byLaw.map(({ applies }) => (applies ? 'flagged' : 'not flagged')).join(' | ')} |`,
    ),
    '',
    FLAG_KEY((term) => `**${term}**`),
  ];
};

const build = (assessment: Assessment, complete: boolean): string => {
  const top = complete ? TOP_GROUPS.document : TOP_GROUPS.terminal;
  const lines = header(assessment);

  if (assessment.clean) {
    lines.push(
      '',
      '### Nothing was flagged',
      '',
      `Nothing that is not strictly necessary was set, and no third party was contacted, before any consent was given. ${consentLine(assessment)}${cleanCaveat(assessment)}`,
      '',
      'What each law asks for, all the same:',
      '',
      ...assessment.laws.map(({ name, where, asks }) => `- **${name}** (${where}) — ${asks}`),
    );
  } else {
    const findings = ordered(assessment.findings);
    if (complete) lines.push(...gridTable(findings));
    for (const [index, finding] of findings.entries()) {
      lines.push(...findingBlock(finding, index + 1, top, complete));
    }
  }

  if (assessment.notes.length > 0) {
    lines.push('', '### Worth knowing', '', ...assessment.notes.map((note) => `- ${note}`));
  }

  const { cookies, hosts } = assessment.inventory;
  if (cookies.length + hosts.length > 0) {
    // A file is kept and reread, so it carries the lists. Terminal scrollback is
    // finite, so there it stays an offer.
    if (complete) lines.push('', renderInventory(assessment));
    else {
      lines.push(
        '',
        `_Ask for the full inventory to list ${[countOf(cookies.length, 'cookie'), countOf(hosts.length, 'host')]
          .filter(Boolean)
          .join(' and ')}._`,
      );
    }
  }

  return [...lines, ...footer(assessment)].join('\n');
};

/** "the 1 cookie", "all 3 cookies", or nothing for none, so the offer never lists an empty list. */
const countOf = (n: number, one: string) => (n === 0 ? '' : n === 1 ? `the 1 ${one}` : `all ${n} ${one}s`);

/** What is printed in the terminal: the read, trimmed to a terminal. */
export const renderTerminal = (assessment: Assessment): string => build(assessment, false);

/** What is written to the `.md` file: the same read, complete, as a document. */
export const renderMarkdownDocument = (assessment: Assessment): string => build(assessment, true);

/** The full lists, printed only when the user asks for them. */
export const renderInventory = (assessment: Assessment): string => {
  const { cookies, hosts } = assessment.inventory;
  const lines: string[] = [];

  if (cookies.length > 0) {
    lines.push(`### Every cookie set before consent (${cookies.length})`, '', ...cookieTable(cookies));
  }

  if (hosts.length > 0) {
    if (lines.length > 0) lines.push('');
    lines.push(`### Every third-party host contacted before consent (${hosts.length})`, '', ...hostTable(hosts));
  }

  return lines.join('\n');
};
