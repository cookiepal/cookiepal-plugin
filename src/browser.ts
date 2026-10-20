import { type ChildProcess, spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import type { Readable, Writable } from 'node:stream';
import { getDomain } from 'tldts';
import {
  type ConsentSkipReason,
  clickTargetExpression,
  locateExpression,
  type MatchedBy,
  parseLocated,
} from './banner.ts';
import { type ButtonMatchers, type ConsentPlan, MAX_AFTER_CLICK_SETTLE_MS, MAX_SETTLE_MS } from './plan.ts';
import type { CapturedCookie } from './result.ts';

/** A failure worth showing the user as it is. */
export class CheckError extends Error {}

const MAC_APPS = [
  'Google Chrome.app/Contents/MacOS/Google Chrome',
  'Chromium.app/Contents/MacOS/Chromium',
  'Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  'Brave Browser.app/Contents/MacOS/Brave Browser',
];
const LINUX_BINARIES = [
  'google-chrome',
  'google-chrome-stable',
  'chromium',
  'chromium-browser',
  'microsoft-edge',
  'brave-browser',
];
const WINDOWS_EXES = [
  'Google\\Chrome\\Application\\chrome.exe',
  'Microsoft\\Edge\\Application\\msedge.exe',
  'BraveSoftware\\Brave-Browser\\Application\\brave.exe',
  'Chromium\\Application\\chrome.exe',
];

/** The user's own Chromium-based browser. `COOKIEPAL_BROWSER` names one explicitly. */
export const findBrowser = (): string | null => {
  const override = process.env.COOKIEPAL_BROWSER;
  if (override) return existsSync(override) ? override : null;

  let candidates: string[];
  if (process.platform === 'darwin') {
    const roots = ['/Applications', join(process.env.HOME ?? '', 'Applications')];
    candidates = roots.flatMap((root) => MAC_APPS.map((app) => join(root, app)));
  } else if (process.platform === 'win32') {
    const roots = [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA];
    candidates = roots
      .filter((root) => root !== undefined)
      .flatMap((root) => WINDOWS_EXES.map((exe) => join(root, exe)));
  } else {
    const dirs = (process.env.PATH ?? '').split(delimiter).filter(Boolean);
    candidates = LINUX_BINARIES.flatMap((name) => dirs.map((dir) => join(dir, name)));
  }
  return candidates.find((path) => existsSync(path)) ?? null;
};

type Params = Record<string, unknown>;
interface Message {
  id?: number;
  method?: string;
  params?: Params;
  sessionId?: string;
  result?: Params;
  error?: { message: string };
}

/**
 * The DevTools protocol over `--remote-debugging-pipe`: NUL-separated JSON on
 * fds 3 and 4. Unlike a debugging port, no other process on the machine can
 * connect to the browser.
 */
const connect = (toBrowser: Writable, fromBrowser: Readable) => {
  let nextId = 1;
  let closed = false;
  const pending = new Map<number, { resolve: (result: Params) => void; reject: (error: Error) => void }>();
  const listeners: ((message: Message) => void)[] = [];

  let buffer = '';
  fromBrowser.setEncoding('utf8');
  fromBrowser.on('data', (chunk: string) => {
    buffer += chunk;
    let end = buffer.indexOf('\0');
    while (end !== -1) {
      const message = JSON.parse(buffer.slice(0, end)) as Message;
      buffer = buffer.slice(end + 1);
      end = buffer.indexOf('\0');
      if (message.id !== undefined) {
        const call = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) call?.reject(new Error(message.error.message));
        else call?.resolve(message.result ?? {});
      } else {
        for (const listener of listeners) listener(message);
      }
    }
  });
  const onClose = () => {
    closed = true;
    for (const call of pending.values()) call.reject(new CheckError('The browser closed unexpectedly.'));
    pending.clear();
  };
  fromBrowser.on('close', onClose);
  fromBrowser.on('error', onClose);
  // A write to a browser that has gone emits 'error' on this side; unheard, it would crash the process.
  toBrowser.on('error', onClose);

  return {
    send(method: string, params: Params = {}, sessionId?: string): Promise<Params> {
      if (closed) return Promise.reject(new CheckError('The browser closed unexpectedly.'));
      const id = nextId++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        toBrowser.write(`${JSON.stringify({ id, method, params, sessionId })}\0`);
      });
    },
    on(listener: (message: Message) => void) {
      listeners.push(listener);
    },
  };
};

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms).unref());

/**
 * How long the network must be silent before the page counts as settled.
 *
 * Not lower: an advertising-heavy page goes quiet for several hundred milliseconds
 * between bursts without being anywhere near finished, and a shorter window reads
 * one of those gaps as the end of the page. Measured against a news front page, half
 * a second found eleven cookies and eight third-party hosts where the page really had
 * sixteen and nineteen — and, worse, reported that reading as a settled one.
 */
const QUIET_MS = 1000;
/**
 * The same, after a consent button was pressed. Longer because this reading is
 * what the findings rest on: a tracker that beacons in a chain after the click
 * keeps resetting the window, so the chain is followed rather than cut short.
 */
const CLICK_QUIET_MS = 2000;
/** How often the banner is looked for again while it may still be appearing. */
const LOCATE_POLL_MS = 100;
/** How long a banner that has not appeared yet is waited for before giving up on it. */
const LOCATE_BUDGET_MS = 2000;
/** How often a settling page is re-read for cookies it set without asking for anything. */
const PROBE_MS = 250;
/**
 * How long an unanswered request keeps the page from counting as quiet. A slow tracker
 * still on its way is the page working, and what it sets when it lands is exactly what
 * the reading is for. Past this it is taken for a long poll, a stream or a request that
 * will never answer, which would otherwise hold every settle to its cap.
 */
const OPEN_REQUEST_MS = 5000;
/*
 * How far past the plan's settle a page that is still working may be followed: the
 * plugin's own caps, imported rather than restated so they cannot drift apart.
 *
 * The plan's settle is the floor, not the budget. Everything the old fixed sleep caught
 * is still caught, because the wait is never shorter than it; what it is no longer is
 * the end, since a page still loading when it runs out keeps being watched up to the
 * cap. That is the whole fix: the reading ends when the page stops, and a slower machine
 * is given time to finish rather than quietly reported as a cleaner site.
 */

/** How a settle ended. */
export interface Settle {
  /** How long the settle actually took. */
  ms: number;
  /**
   * True when the network went quiet, false when the time ran out first and the page may
   * still have been working, null when the plan asked for no settle and nothing was waited.
   */
  reachedQuiet: boolean | null;
  /** Requests seen during this settle alone, first- and third-party. */
  requests: number;
}

/**
 * Waits for the page to stop making requests: never less than `floorMs`, never more
 * than `ceilingMs`.
 *
 * The plan's settle is the floor. A page is always given at least as long as it used
 * to get, so a cookie written on a timer with nothing else happening is still caught;
 * and a page that is still working when that time is up is followed further instead of
 * being cut off there. That is what makes the reading depend on what the page did
 * rather than on how fast the machine running it is.
 *
 * Quiet means no new activity and no request still waiting on its answer, for up to
 * `OPEN_REQUEST_MS` each. Past that a request open is ignored: a page holding one open
 * for good — a long poll, an EventSource, a request that never answers — would
 * otherwise pin every settle to its ceiling and nothing would ever be read early.
 *
 * Setting a cookie counts as activity too, which is what `probe` is for. A script
 * that waits and then writes one with `document.cookie` makes no request at all,
 * and nothing in the protocol announces it, so the caller re-reads the cookies each
 * time round and marks activity when they change. Without that, a page quiet at one
 * second that sets a cookie at three would have that cookie missed and the reading
 * still called settled — the very thing this is here to prevent.
 */
const settleUntilQuiet = async (
  activity: () => number,
  requests: () => number,
  probe: () => Promise<void>,
  ceilingMs: number,
  quietMs: number,
  floorMs: number,
): Promise<Settle> => {
  // Null rather than false: nothing was waited for, so nothing was concluded either way.
  if (ceilingMs <= 0) return { ms: 0, reachedQuiet: null, requests: 0 };

  const start = Date.now();
  const before = requests();
  const since = () => requests() - before;
  const deadline = start + ceilingMs;
  // A plan with a short settle could never see a full quiet window, which would
  // leave it waiting the whole ceiling every time. Its own budget is the limit.
  const quiet = Math.min(quietMs, ceilingMs);

  for (;;) {
    const now = Date.now();
    // Whichever is further off: the rest of the quiet window, or the rest of the floor.
    const waitFor = Math.max(quiet - (now - activity()), floorMs - (now - start));
    // Asked before the deadline, not after: when a plan asks for the longest settle the
    // cap allows, the floor and the cap are the same moment, and a page that really had
    // gone quiet would otherwise be reported as one that ran out of time.
    if (waitFor <= 0) return { ms: now - start, reachedQuiet: true, requests: since() };
    if (now >= deadline) return { ms: now - start, reachedQuiet: false, requests: since() };
    await delay(Math.min(waitFor, deadline - now, PROBE_MS));
    await probe();
  }
};

const withTimeout = <T>(promise: Promise<T>, ms: number, message: string): Promise<T> =>
  Promise.race([
    promise,
    delay(ms).then(() => {
      throw new CheckError(message);
    }),
  ]);

const exited = (child: ChildProcess, ms: number): Promise<boolean> =>
  child.exitCode !== null || child.signalCode !== null
    ? Promise.resolve(true)
    : withTimeout(new Promise<boolean>((resolve) => child.once('exit', () => resolve(true))), ms, 'exit').catch(
        () => false,
      );

/**
 * The registrable domain from the public suffix list, private domains included,
 * so `app.cookiepal.io` and `mcp.cookiepal.io` share `cookiepal.io` while
 * `jack.github.io` and `other.github.io` stay apart. Null for an IP or `localhost`.
 */
const site = (host: string): string | null => getDomain(host, { allowPrivateDomains: true });

/**
 * A request is first-party when its host has the page's registrable domain. A
 * page with none, an IP or `localhost`, owns only its own host and subdomains.
 */
export const isThirdParty = (host: string, pageHost: string): boolean => {
  const page = site(pageHost);
  if (!page) return host !== pageHost && !host.endsWith(`.${pageHost}`);
  return site(host) !== page;
};

/** Which consent button this load presses, and the matchers for finding it. */
export interface ConsentRequest {
  which: 'accept' | 'reject';
  plan: ConsentPlan;
  matchers: ButtonMatchers;
}

export interface ConsentAttempt {
  bannerFound: boolean;
  rejectByDefault: boolean;
  pressed: boolean;
  matchedBy: MatchedBy | null;
  reason: ConsentSkipReason | null;
  /** The button's own label. Page content; it is cleaned before anyone sees it. */
  label: string | null;
  /**
   * What the page had the instant before the click, and what it had after. Null when
   * nothing was pressed. `before` is what `newAfterClick` is counted against, so a cookie
   * the page set while its banner was still being looked for is not read as the press's.
   */
  after: {
    before: CapturedCookie[] | null;
    cookies: CapturedCookie[];
    thirdPartyHosts: string[];
    settle: Settle;
  } | null;
}

export interface PageLoad {
  cookies: CapturedCookie[];
  thirdPartyHosts: string[];
  title: unknown;
  finalUrl: unknown;
  httpStatus: number | null;
  loadTimedOut: boolean;
  /** How the settle before the arrival reading ended. */
  settle: Settle;
  /** Null when this load was the arrival reading and pressed nothing. */
  consent: ConsentAttempt | null;
}

interface LoadOptions {
  browserPath: string;
  url: string;
  settleMs: number;
  timeoutMs: number;
  /** Omitted for the arrival reading, which clicks nothing. */
  consent?: ConsentRequest;
}

/**
 * Every temporary profile currently in use, and the browser holding it. A check
 * runs several loads, so Ctrl-C has to clean up all of them, not just the last
 * one to register a handler.
 */
const live = new Set<{ chrome: () => ChildProcess | undefined; profile: string }>();
let handlersInstalled = false;

const onSignal = () => {
  for (const session of live) {
    session.chrome()?.kill('SIGKILL');
    rmSync(session.profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
  live.clear();
  process.exit(130);
};

const watchSignals = () => {
  if (handlersInstalled) return;
  handlersInstalled = true;
  process.on('SIGINT', onSignal);
  process.on('SIGTERM', onSignal);
};

const stopWatchingSignals = () => {
  if (live.size > 0 || !handlersInstalled) return;
  handlersInstalled = false;
  process.removeListener('SIGINT', onSignal);
  process.removeListener('SIGTERM', onSignal);
};

/**
 * Loads one page once in a fresh temporary profile and reads what was set
 * before any consent. With a `consent` request it then presses that one button
 * and reads again; without one it clicks nothing. No link is ever followed.
 * The profile is deleted afterwards, on failure and on Ctrl-C too.
 */
export const loadPage = async ({ browserPath, url, settleMs, timeoutMs, consent }: LoadOptions): Promise<PageLoad> => {
  const profile = mkdtempSync(join(tmpdir(), 'cookiepal-check-'));
  let chrome: ChildProcess | undefined;

  const removeProfile = () => rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  const session = { chrome: () => chrome, profile };
  live.add(session);
  watchSignals();

  try {
    chrome = spawn(
      browserPath,
      [
        '--headless=new',
        '--remote-debugging-pipe',
        `--user-data-dir=${profile}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-sync',
        '--disable-default-apps',
        '--disable-component-update',
        '--disable-background-networking',
        '--disable-breakpad',
        '--disable-crash-reporter',
        '--password-store=basic',
        '--use-mock-keychain',
        '--mute-audio',
        '--window-size=1280,800',
        // Nothing here tries to make the browser cheaper. Measured on a news front page, a renderer
        // cap and `--process-per-site` changed neither the process count nor the memory, turning off
        // site isolation changed neither, and `--single-process` crashes outright. A blank page
        // already costs around 450 MB across ten processes, so most of it is the browser existing
        // rather than the site being checked. Flags that would genuinely cut it are the ones that
        // stop cross-site frames running on their own, which is exactly what the check measures.
        'about:blank',
      ],
      { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] },
    );
    const started = new Promise<never>((_, reject) =>
      chrome?.once('error', (error) => reject(new CheckError(`The browser could not start: ${error.message}`))),
    );
    // If Chrome dies mid-load, nothing is left pending on the pipe to reject, and the process would
    // otherwise idle forever on unref'd timers. This turns that into a normal failure.
    const closed = new Promise<never>((_, reject) =>
      chrome?.once('exit', () => reject(new CheckError('The browser closed unexpectedly.'))),
    );
    const cdp = connect(chrome.stdio[3] as Writable, chrome.stdio[4] as Readable);
    const run = capture(cdp, url, settleMs, timeoutMs, consent);
    // Past the plan's own budget (timeoutMs to load, then settleMs, then the consent click), something
    // is stuck: give up rather than hang. Each settle is counted at its own cap rather than at
    // what the plan asked for, since a page still working past that is followed up to the cap.
    return await withTimeout(
      Promise.race([run, started, closed]),
      timeoutMs +
        Math.max(settleMs, MAX_SETTLE_MS) +
        (consent ? LOCATE_BUDGET_MS + Math.max(consent.plan.afterClickSettleMs, MAX_SETTLE_MS) + 10_000 : 0) +
        20_000,
      'The check took too long and was stopped.',
    ).finally(async () => {
      await withTimeout(cdp.send('Browser.close'), 3000, 'close').catch(() => {});
    });
  } finally {
    if (chrome && !(await exited(chrome, 5000))) {
      chrome.kill('SIGKILL');
      await exited(chrome, 5000);
    }
    removeProfile();
    live.delete(session);
    stopWatchingSignals();
  }
};

type Cdp = ReturnType<typeof connect>;

const pickCookies = (cookies: CapturedCookie[]): CapturedCookie[] =>
  // Picked field by field, so the value the protocol also returns goes no further.
  cookies.map(({ name, domain, path, expires, httpOnly, secure, sameSite }) => ({
    name,
    domain,
    path,
    expires,
    httpOnly,
    secure,
    sameSite,
  }));

/** Runs one fixed expression in the page. Anything the page throws or returns unusably reads as null. */
const evaluate = async (cdp: Cdp, sessionId: string, expression: string): Promise<unknown> => {
  try {
    const answer = (await withTimeout(
      cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: false }, sessionId),
      5000,
      'evaluate',
    )) as { result?: { value?: unknown }; exceptionDetails?: unknown };
    return answer.exceptionDetails ? null : (answer.result?.value ?? null);
  } catch {
    return null;
  }
};

/**
 * Presses one consent button: finds it, clicks where it is, and waits. A button
 * that cannot be found, or that more than one matcher claims, is not pressed —
 * the check never presses one it is unsure of — and the run says why.
 *
 * Only what the check cannot do stops a press. Nothing the page says about
 * itself does: a page claiming `rejectByDefault` still gets its reject button
 * pressed, because that claim is the page's own and the point of the check is
 * to measure the button rather than take the page's word for it.
 *
 * The button is looked for repeatedly until `budgetMs` runs out, because a banner is
 * often still fading in when the page itself has gone quiet, and a banner at `opacity: 0`
 * is not something the check can press. That window is the check's own and comes after
 * the settle has already run its floor, so a page that is simply slower is not read as a
 * page without a banner.
 *
 * `onPress` is called once, in the instant before the button is pressed, and never when
 * nothing is pressed. Everything the page does from then on is the press's doing — which
 * is the whole reject finding — so it must not start while the banner is merely being
 * looked for: requests made during that search are the page's own, not the click's.
 */
const pressConsent = async (
  cdp: Cdp,
  sessionId: string,
  request: ConsentRequest,
  budgetMs: number,
  onPress: () => Promise<void>,
): Promise<Omit<ConsentAttempt, 'after'> & { clicked: boolean }> => {
  const expression = locateExpression(request.plan, request.matchers);
  const deadline = Date.now() + budgetMs;
  let located = parseLocated(await evaluate(cdp, sessionId, expression));
  // Only while the banner or its button may still be arriving. An ambiguous match is a
  // settled answer — more than one button claims to be the one — so looking again would
  // only make which answer wins depend on timing.
  while (!located.point && (located.reason === 'no-banner' || located.reason === 'no-button')) {
    if (Date.now() + LOCATE_POLL_MS >= deadline) break;
    await delay(LOCATE_POLL_MS);
    located = parseLocated(await evaluate(cdp, sessionId, expression));
  }

  const base = {
    bannerFound: located.bannerFound,
    rejectByDefault: located.rejectByDefault,
    matchedBy: located.matchedBy,
    label: located.label,
  };

  if (!located.point) {
    return { ...base, pressed: false, reason: located.reason ?? 'no-button', clicked: false };
  }

  const { x, y } = located.point;
  await onPress();
  let clicked = false;
  if (located.covered) {
    // Something sits over the button, so a mouse click would land on that instead.
    clicked = (await evaluate(cdp, sessionId, clickTargetExpression())) === true;
  } else {
    try {
      const mouse = { x, y, button: 'left', clickCount: 1 };
      await cdp.send('Input.dispatchMouseEvent', { ...mouse, type: 'mouseMoved', buttons: 0 }, sessionId);
      await cdp.send('Input.dispatchMouseEvent', { ...mouse, type: 'mousePressed', buttons: 1 }, sessionId);
      await cdp.send('Input.dispatchMouseEvent', { ...mouse, type: 'mouseReleased', buttons: 0 }, sessionId);
      clicked = true;
    } catch {
      clicked = (await evaluate(cdp, sessionId, clickTargetExpression())) === true;
    }
  }

  return clicked
    ? { ...base, pressed: true, reason: null, clicked }
    : { ...base, pressed: false, reason: 'click-failed', clicked };
};

const capture = async (
  cdp: Cdp,
  url: string,
  settleMs: number,
  timeoutMs: number,
  consentRequest?: ConsentRequest,
): Promise<PageLoad> => {
  const pageHost = new URL(url).hostname;
  const hosts = new Set<string>();
  /**
   * Hosts contacted after the consent button was pressed, tracked separately
   * because `hosts` is cumulative: a host already in it cannot be added again,
   * so a tracker that loads on arrival and keeps beaconing through reject would
   * never show up in a difference taken against the arrival set. This is the
   * only place that information exists.
   */
  const hostsAfterClick = new Set<string>();
  /**
   * When the page was last seen doing something on the network, and how much it has
   * done. The settles below wait on these rather than on the clock alone.
   */
  let lastActivityAt = Date.now();
  let requests = 0;
  const sawActivity = () => {
    lastActivityAt = Date.now();
  };
  /** Requests still waiting on their answer, by session and ID, with when each was sent. */
  const open = new Map<string, number>();
  const requestKey = (sessionId: string | undefined, params: Record<string, unknown>) =>
    `${sessionId ?? ''}\u0000${params.requestId}`;
  /** The last activity, or now while a request sent less than `OPEN_REQUEST_MS` ago is still open. */
  const activity = () => {
    const now = Date.now();
    for (const sentAt of open.values()) if (now - sentAt < OPEN_REQUEST_MS) return now;
    return lastActivityAt;
  };

  /**
   * Which cookies exist, by identity rather than by value: a cookie re-set with a
   * later expiry is the same cookie and is not the page doing something new.
   */
  /** What the page had the instant before the button was pressed; null when nothing was. */
  let beforeClick: CapturedCookie[] | null = null;
  let cookieFingerprint = '';
  const probeCookies = async () => {
    try {
      const { cookies } = (await cdp.send('Storage.getCookies')) as { cookies: CapturedCookie[] };
      const current = cookies
        .map(({ name, domain, path }) => `${name}\u0000${domain}\u0000${path}`)
        .sort()
        .join('\u0001');
      if (current !== cookieFingerprint) {
        cookieFingerprint = current;
        sawActivity();
      }
    } catch {
      // A browser that has gone is handled by the stops around this; nothing to mark.
    }
  };
  let pressed = false;
  let mainSession = '';
  let mainFrame = '';
  let documentRequest = '';
  let httpStatus: number | null = null;
  let navigating = false;
  let onLoad = () => {};
  const loaded = new Promise<void>((resolve) => {
    onLoad = resolve;
  });

  cdp.on(({ method, params = {}, sessionId }) => {
    switch (method) {
      case 'Network.requestWillBeSent': {
        // Counted before the host filtering below: a first-party request is not something
        // the check reports, but it is still the page working rather than being finished.
        sawActivity();
        requests++;
        open.set(requestKey(sessionId, params), Date.now());
        const request = params.request as { url: string };
        try {
          const { protocol, hostname } = new URL(request.url);
          if ((protocol === 'http:' || protocol === 'https:') && isThirdParty(hostname, pageHost)) {
            hosts.add(hostname);
            if (pressed) hostsAfterClick.add(hostname);
          }
        } catch {}
        if (sessionId === mainSession && params.type === 'Document' && params.frameId === mainFrame) {
          documentRequest = params.requestId as string;
        }
        break;
      }
      case 'Network.responseReceived':
        sawActivity();
        if (params.requestId === documentRequest) httpStatus = (params.response as { status: number }).status;
        break;
      // An answer arriving is the page still working: it is usually what starts the next request.
      case 'Network.loadingFinished':
      case 'Network.loadingFailed':
        sawActivity();
        open.delete(requestKey(sessionId, params));
        break;
      case 'Page.loadEventFired':
        if (sessionId === mainSession && navigating) onLoad();
        break;
      // An alert() or confirm() would stop the page loading. Dismissing one is not a consent choice.
      case 'Page.javascriptDialogOpening':
        cdp.send('Page.handleJavaScriptDialog', { accept: false }, sessionId).catch(() => {});
        break;
      // Cross-site iframes and workers run in their own targets: watch their requests too.
      case 'Target.attachedToTarget': {
        const child = params.sessionId as string;
        Promise.all([
          cdp.send('Page.enable', {}, child),
          cdp.send('Network.enable', {}, child),
          cdp.send('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: true, flatten: true }, child),
        ])
          .catch(() => {})
          .finally(() => cdp.send('Runtime.runIfWaitingForDebugger', {}, child).catch(() => {}));
        break;
      }
    }
  });

  await cdp.send('Browser.setDownloadBehavior', { behavior: 'deny' });
  const { targetId } = (await cdp.send('Target.createTarget', { url: 'about:blank' })) as { targetId: string };
  mainSession = ((await cdp.send('Target.attachToTarget', { targetId, flatten: true })) as { sessionId: string })
    .sessionId;
  await cdp.send('Page.enable', {}, mainSession);
  await cdp.send('Network.enable', {}, mainSession);
  await cdp.send('Runtime.enable', {}, mainSession);
  await cdp.send(
    'Target.setAutoAttach',
    { autoAttach: true, waitForDebuggerOnStart: true, flatten: true },
    mainSession,
  );
  const { frameTree } = (await cdp.send('Page.getFrameTree', {}, mainSession)) as {
    frameTree: { frame: { id: string } };
  };
  mainFrame = frameTree.frame.id;

  // One budget covers navigating and loading, so the outer stop in loadPage is never reached first.
  const deadline = Date.now() + timeoutMs;
  navigating = true;
  const navigation = (await withTimeout(
    cdp.send('Page.navigate', { url }, mainSession),
    timeoutMs,
    'The page did not respond in time.',
  )) as { errorText?: string };
  // Chrome reports a 4xx/5xx response with no body the same way as a network failure; the page did
  // load, so let it through and report the status instead of failing the check outright.
  if (navigation.errorText && navigation.errorText !== 'net::ERR_HTTP_RESPONSE_CODE_FAILURE') {
    throw new CheckError(`The page could not be loaded (${navigation.errorText}).`);
  }

  const loadTimedOut = await withTimeout(
    loaded.then(() => false),
    Math.max(0, deadline - Date.now()),
    'load',
  ).catch(() => true);
  // Seeded before the wait so the first probe compares against what the page had on load,
  // not against nothing, which would read every page as having just changed.
  await probeCookies();
  const settle = await settleUntilQuiet(
    activity,
    () => requests,
    probeCookies,
    // A plan asking for no settle is asking for no wait, and still gets none. Otherwise the
    // plan's figure is the least this waits, and a page still working is followed past it.
    settleMs <= 0 ? 0 : Math.max(settleMs, MAX_SETTLE_MS),
    QUIET_MS,
    settleMs,
  );

  const { cookies } = (await cdp.send('Storage.getCookies')) as { cookies: CapturedCookie[] };
  // The arrival reading, taken before anything is pressed. Each consent run compares against
  // its own, so a page that behaves differently between loads cannot invent a change.
  const arrival = { cookies: pickCookies(cookies), thirdPartyHosts: [...hosts] };

  let consent: ConsentAttempt | null = null;
  if (consentRequest) {
    // Set before the press, not after: requests the click causes start arriving
    // while `pressConsent` is still awaiting, and those are exactly the ones
    // being counted.
    // The banner gets its own window rather than the settle's leftovers: the settle now
    // runs at least as long as the plan asked for, so there are none to pass on.
    const { clicked, ...attempt } = await pressConsent(
      cdp,
      mainSession,
      consentRequest,
      LOCATE_BUDGET_MS,
      // Set here rather than before the search: what the page did while the banner was
      // being looked for is the page's own doing and must not be counted against the click.
      async () => {
        pressed = true;
        beforeClick = pickCookies(((await cdp.send('Storage.getCookies')) as { cookies: CapturedCookie[] }).cookies);
      },
    );
    let after: ConsentAttempt['after'] = null;
    if (clicked) {
      // The click itself starts the quiet window: whatever it sets off has not been sent yet,
      // so the page would otherwise look quiet in the instant before its first request.
      sawActivity();
      const { afterClickSettleMs } = consentRequest.plan;
      const afterSettle = await settleUntilQuiet(
        activity,
        () => requests,
        probeCookies,
        // As with the arrival settle: a plan asking for no wait after the click still gets none.
        afterClickSettleMs <= 0 ? 0 : Math.max(afterClickSettleMs, MAX_AFTER_CLICK_SETTLE_MS),
        CLICK_QUIET_MS,
        afterClickSettleMs,
      );
      const settled = (await cdp.send('Storage.getCookies')) as { cookies: CapturedCookie[] };
      // Absolute: every cookie still set, and only the hosts contacted since
      // the press. The server counts these rather than reconstructing them.
      after = {
        before: beforeClick ?? arrival.cookies,
        cookies: pickCookies(settled.cookies),
        thirdPartyHosts: [...hostsAfterClick],
        settle: afterSettle,
      };
    }
    consent = { ...attempt, after };
  }

  const { targetInfo } = (await cdp.send('Target.getTargetInfo', { targetId })) as {
    targetInfo: { title: unknown; url: unknown };
  };

  return {
    ...arrival,
    title: targetInfo.title,
    finalUrl: targetInfo.url,
    httpStatus,
    loadTimedOut,
    settle,
    consent,
  };
};
