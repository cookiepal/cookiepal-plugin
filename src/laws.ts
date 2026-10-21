/**
 * The curated legal wording the local risk read prints, and the only place it
 * comes from. Nothing here is generated, fetched or summarised at run time: the
 * strings below ship with the plugin, so changing any of them is a plugin
 * release that goes through review (CPL-396).
 *
 * The rule the whole file is written to: say what was found and what the law
 * asks for. Never call a site compliant or non-compliant. One page loaded once
 * from one country cannot show that, and this plugin is not legal advice.
 *
 * Sources. Where the website already explains a law, the wording follows
 * `cookiepal/website/public/locales/en/privacylaws.json` so the plugin and the
 * site say the same thing. The website's own "are you compliant?" framing is
 * deliberately not carried over.
 *
 *  - GDPR: Regulation (EU) 2016/679 recital 30 (online identifiers, such as
 *    cookie IDs, are personal data), art. 6 (lawful basis), art. 4(11) and 7
 *    (what consent is, and withdrawing it as easily as giving it) and art. 13
 *    (telling people what is collected and why, when it is collected).
 *  - ePrivacy Directive 2002/58/EC art. 5(3), which applies alongside the GDPR
 *    and is what governs storing or reading anything on a visitor's device,
 *    personal data or not. It is printed with the GDPR and labelled as its own.
 *  - CCPA/CPRA: California Civil Code 1798.100 (notice at collection),
 *    1798.120 and 1798.135 (opt out of sale or sharing, and honouring an
 *    opt-out preference signal).
 *  - LGPD: Lei 13.709/2018 art. 7 (legal basis) and art. 5(XII) (consent is
 *    free, informed and unambiguous, for a specific purpose).
 *  - Law 25 (Quebec): Act respecting the protection of personal information in
 *    the private sector (P-39.1) s. 8.1, s. 9.1 and s. 14, as amended by Law 25
 *    and in force since 22 September 2023, with the Commission d'acces a
 *    l'information's own summary of those sections at
 *    cai.gouv.qc.ca/protection-renseignements-personnels/sujets-et-domaines-dinteret/principaux-changements-loi-25
 */

export const LAW_KEYS = ['gdpr', 'ccpa', 'lgpd', 'law25'] as const;

export type LawKey = (typeof LAW_KEYS)[number];

/**
 * Whether the law asks for permission before tracking starts, or only for a way
 * to refuse it afterwards. This is the distinction the whole read turns on: a
 * cookie set before anyone was asked is the finding under an opt-in law and is
 * not, on its own, a finding under an opt-out one.
 */
export type ConsentBasis = 'opt-in' | 'opt-out';

export interface Law {
  key: LawKey;
  /** How the law is normally called, for a heading. */
  name: string;
  /** Who it protects, in plain words. */
  where: string;
  basis: ConsentBasis;
  /** What the law asks of a site that sets cookies, in two sentences at most. */
  asks: string;
}

export const LAWS: Record<LawKey, Law> = {
  gdpr: {
    key: 'gdpr',
    name: 'GDPR',
    where: 'people in the EU and the EEA',
    basis: 'opt-in',
    asks:
      'Personal data, which includes the online identifiers cookies and trackers carry, needs a lawful basis ' +
      'before it is processed, and for tracking that basis is normally the visitor’s consent: freely given, ' +
      'specific, informed and unambiguous, and as easy to withdraw as it was to give. Under the ePrivacy ' +
      'Directive art. 5(3), which applies alongside the GDPR, storing or reading anything on a visitor’s ' +
      'device needs that permission first, unless it is strictly necessary to provide what they asked for.',
  },
  ccpa: {
    key: 'ccpa',
    name: 'CCPA and CPRA',
    where: 'residents of California',
    basis: 'opt-out',
    asks:
      'California does not ask for permission before tracking. It asks that visitors be told what is ' +
      'collected at the point it is collected, and that they be given a way to opt out of the sale or ' +
      'sharing of their personal information — including through an opt-out signal their browser sends.',
  },
  lgpd: {
    key: 'lgpd',
    name: 'LGPD',
    where: 'people in Brazil',
    basis: 'opt-in',
    asks:
      'Personal data needs a legal basis before it is processed, and for tracking that basis is normally ' +
      'the visitor’s consent. That consent has to be free, informed and unambiguous, and given for a ' +
      'specific purpose that was explained first.',
  },
  law25: {
    key: 'law25',
    name: 'Law 25',
    where: 'people in Quebec',
    basis: 'opt-in',
    asks:
      'Since 22 September 2023, a site that collects personal information using technology that can ' +
      'identify, locate or profile someone has to tell the visitor it is using it and how to switch those ' +
      'functions on. Quebec’s privacy regulator reads that as meaning the functions start off, and ' +
      'consent has to be clear, free, informed and given for a specific purpose.',
  },
};

/**
 * Law 25 does not use the word "cookie", and the section on privacy settings by
 * default (s. 9.1) says in terms that it does not apply to browser cookies.
 * Printed with every Law 25 finding, because a reader who checks the statute
 * should not find that out from the statute rather than from us.
 */
export const LAW25_CAVEAT =
  'Law 25 does not use the word “cookie”. It covers technology that can identify, locate or ' +
  'profile a person, which Quebec’s regulator applies to tracking cookies, pixels and similar ' +
  'identifiers. A separate section on default privacy settings says it does not apply to browser cookies, ' +
  'so how far the two reach together has not been settled by a court.';

export type FindingKind =
  | 'tracking-before-consent'
  | 'unidentified-cookies'
  | 'hosts-before-consent'
  | 'active-after-reject'
  | 'set-after-reject'
  | 'contacted-after-reject';

/**
 * What each law makes of each finding. `null` means the finding is not a
 * problem under that law, and the `notAFinding` text below says why — so a
 * finding that only matters under an opt-in law is never reported as a problem
 * under the CCPA.
 */
type Explanations = Record<FindingKind, Record<LawKey, string | null>>;

const OPT_IN_BEFORE_CONSENT =
  'These were set before the visitor was asked anything, so any of them that carry personal data on the ' +
  'basis of consent were set before that consent existed. Under the ePrivacy Directive art. 5(3), which ' +
  'applies alongside the GDPR, any of them that are not strictly necessary needed the visitor’s permission ' +
  'before they were stored at all, whether or not they carry personal data.';

export const EXPLANATIONS: Explanations = {
  'tracking-before-consent': {
    gdpr: OPT_IN_BEFORE_CONSENT,
    lgpd:
      'These were set before the visitor was asked anything. If they carry personal data and consent is the ' +
      'basis being relied on, that consent did not exist yet when they were set.',
    law25:
      'Any of these that can identify, locate or profile the visitor were active before the visitor turned ' +
      'them on, which is the opposite of the starting state the regulator describes.',
    ccpa: null,
  },
  'unidentified-cookies': {
    gdpr:
      'A site has to tell visitors what personal data it collects and why, at the time it collects it. It ' +
      'cannot do that for a cookie it has not identified.',
    ccpa:
      'This is a finding here too. Notice at collection means telling visitors what is being collected, ' +
      'which a site can only do for what it can describe.',
    lgpd:
      'Every processing operation needs a stated purpose. A purpose cannot be stated for data whose role on ' +
      'the page is unknown.',
    law25:
      'The site has to tell visitors which technology it uses that can identify, locate or profile them. It ' +
      'can only do that for technology it has identified.',
  },
  'hosts-before-consent': {
    gdpr:
      'Contacting another company’s server sends the visitor’s IP address and page to it before ' +
      'they were asked, which is a disclosure in its own right, separate from any cookie.',
    lgpd:
      'Sharing a visitor’s data with a third party needs its own legal basis, and this happened before ' +
      'the visitor was asked.',
    law25:
      'These third parties received the visitor’s data before the visitor activated anything, and the ' +
      'law asks that they be told which technology is in use before that happens.',
    ccpa:
      'If any of these hosts receive personal information for advertising, that can count as selling or ' +
      'sharing it, which the visitor has to be told about at the point of collection and be able to opt out of.',
  },
  'active-after-reject': {
    gdpr:
      'The visitor refused, and this is still running. Refusing has to be as effective as agreeing, so this ' +
      'is the clearest finding in the check.',
    lgpd:
      'The visitor refused and the tracking continued, so whatever basis is being relied on, it is not the ' +
      'visitor’s consent.',
    law25: 'The visitor did not activate these functions and declined when asked, and they are still active.',
    ccpa:
      'This is a finding here too. California does not ask for permission first, but it does ask that a ' +
      'refusal be honoured — an opt-out that changes nothing is the failure the law is about.',
  },
  'set-after-reject': {
    gdpr:
      'These were created by the act of refusing. Nothing beyond remembering the refusal itself should be ' +
      'set at that moment.',
    lgpd: 'These appeared after the visitor refused, so they were not created on the basis of consent.',
    law25: 'These were switched on at the moment the visitor declined to switch them on.',
    ccpa:
      'This is a finding here too, for the same reason: acting on a refusal by starting new tracking is not ' +
      'honouring it.',
  },
  'contacted-after-reject': {
    gdpr:
      'The visitor refused, and the page still sent their IP address and page to these companies. Any of ' +
      'them that track the visitor are doing so after a refusal, which has to be as effective as agreeing.',
    lgpd:
      'Sharing a visitor’s data with a third party needs its own legal basis, and after a refusal that basis ' +
      'cannot be the visitor’s consent.',
    law25: 'These third parties received the visitor’s data after the visitor declined to activate anything.',
    ccpa:
      'This is a finding here too if any of these hosts receive personal information for advertising: the ' +
      'visitor opted out, and an opt-out has to be honoured.',
  },
};

/** Why a finding is not reported as a problem under a given law. */
export const NOT_A_FINDING: Record<FindingKind, Partial<Record<LawKey, string>>> = {
  'unidentified-cookies': {},
  'tracking-before-consent': {
    ccpa:
      'Not a finding under California law. The CCPA does not ask for permission before tracking starts, so ' +
      'cookies set on arrival are not a problem here on their own. What it does ask for is notice at the ' +
      'point of collection and a working way to opt out, neither of which this check can see from one page load.',
  },
  'hosts-before-consent': {},
  'active-after-reject': {},
  'set-after-reject': {},
  'contacted-after-reject': {},
};

/**
 * Printed with the unidentified-cookie finding, every time. The catalogue not
 * knowing a cookie is a limit of the catalogue, and saying so is the difference
 * between an honest finding and an accusation.
 */
export const UNKNOWN_CAVEAT =
  'Not recognising a cookie is a limit of the open-source catalogue, not evidence that the cookie tracks ' +
  'anyone. Some of these will be a site\u2019s own and entirely ordinary. The finding is that nobody reading ' +
  'this check can tell which, and the site is the only party that can say.';

/** What the check looked at, and what it did not. Printed whatever the result. */
export const SCOPE =
  'This was one page, loaded once, from one country, at one moment. It does not show what the rest of the ' +
  'site does, what a visitor from somewhere else would get, or what happens to the data afterwards.';

/**
 * The key under the law-by-finding grid. One wording for every form of the
 * read; each renderer passes how it marks the two terms.
 */
export const FLAG_KEY = (strong: (term: string) => string): string =>
  `Everything marked ${strong('flagged')} is explained below. ${strong('Not flagged')} means that law does not ` +
  'treat it as a problem, and the reason is given with the finding. Neither is a verdict on the page.';

/** The rule, stated in the output itself and not only in the skill. */
export const NO_VERDICT =
  'This is not a compliance verdict and not legal advice. It reports what the check found on this page and ' +
  'what each law asks for, so that someone can look at the two together.';
