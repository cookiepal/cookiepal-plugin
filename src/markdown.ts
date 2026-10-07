import type { Assessment, Finding } from './assess.ts';

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
 * content as the page, not the same appearance \u2014 Markdown carries no styling,
 * so the branding and the layout are the page's alone.
 */

/** Groups shown per finding. The page draws eight; a line is dearer in a terminal. */
const TOP_GROUPS = { terminal: 5, document: 8 };

const SEVERITY: Record<string, number> = {
  'active-after-reject': 0,
  'set-after-reject': 1,
  'tracking-before-consent': 2,
  'unidentified-cookies': 3,
  'hosts-before-consent': 4,
};

const ordered = (findings: Finding[]) =>
  [...findings].sort((a, b) => (SEVERITY[a.kind] ?? 9) - (SEVERITY[b.kind] ?? 9));

/** A cookie name or host can hold a pipe, which would break the table it sits in. */
const cell = (value: string) => value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

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

/**
 * Every law, every time, each in its own words. A law the finding is not a
 * problem under is marked and still given its reason, because "why this does
 * not count here" is as much of the read as why it does.
 */
const lawLines = (finding: Finding): string[] =>
  [...finding.byLaw]
    .sort((a, b) => Number(b.applies) - Number(a.applies))
    .map(({ name, applies, text }) => `- **${name}** — ${applies ? text : `_Not a finding here._ ${text}`}`);

const findingBlock = (finding: Finding, index: number, top: number): string[] => {
  return [
    '',
    `### ${index}. ${finding.title}`,
    '',
    finding.detail,
    ...(finding.shape ? ['', `_${finding.shape}_`] : []),
    ...groupTable(finding, top),
    '',
    ...lawLines(finding),
  ];
};

const header = (assessment: Assessment): string[] => {
  const { checked, country } = assessment;
  const where = country ? `from ${country}` : 'from an unknown country';
  return [
    `## CookiePal check: ${assessment.page}`,
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
    'Everything marked **flagged** is explained below. **Not flagged** means that law does not treat it as a problem, and the reason is given with the finding. Neither is a verdict on the page.',
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
      `Nothing that is not strictly necessary was set, and no third party was contacted, before any consent was given. ${
        assessment.checked.consentTested
          ? 'Pressing the banner’s reject button left nothing running.'
          : 'The consent action was not tested, so what the banner’s buttons do is not covered.'
      }`,
      '',
      'What each law asks for, all the same:',
      '',
      ...assessment.laws.map(({ name, where, asks }) => `- **${name}** (${where}) — ${asks}`),
    );
  } else {
    const findings = ordered(assessment.findings);
    if (complete) lines.push(...gridTable(findings));
    for (const [index, finding] of findings.entries()) {
      lines.push(...findingBlock(finding, index + 1, top));
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
        `_Ask for the full inventory to list all ${cookies.length} ${cookies.length === 1 ? 'cookie' : 'cookies'} ` +
          `and all ${hosts.length} ${hosts.length === 1 ? 'host' : 'hosts'}._`,
      );
    }
  }

  return [...lines, ...footer(assessment)].join('\n');
};

/** What is printed in the terminal: the read, trimmed to a terminal. */
export const renderTerminal = (assessment: Assessment): string => build(assessment, false);

/** What is written to the `.md` file: the same read, complete, as a document. */
export const renderMarkdownDocument = (assessment: Assessment): string => build(assessment, true);

/** The full lists, printed only when the user asks for them. */
export const renderInventory = (assessment: Assessment): string => {
  const { cookies, hosts } = assessment.inventory;
  const lines: string[] = [];

  if (cookies.length > 0) {
    lines.push(
      `### Every cookie set before consent (${cookies.length})`,
      '',
      '| Cookie | Domain | Category | Vendor |',
      '| --- | --- | --- | --- |',
      ...cookies.map(
        ({ name, domain, category, vendor }) =>
          `| ${cell(name || '(unnamed)')} | ${cell(domain)} | ${category} | ${vendor ? cell(vendor) : '_not recognised_'} |`,
      ),
    );
  }

  if (hosts.length > 0) {
    if (lines.length > 0) lines.push('');
    lines.push(
      `### Every third-party host contacted before consent (${hosts.length})`,
      '',
      '| Host | Domain |',
      '| --- | --- |',
      ...hosts.map(({ host, domain }) => `| ${cell(host)} | ${cell(domain)} |`),
    );
  }

  return lines.join('\n');
};
