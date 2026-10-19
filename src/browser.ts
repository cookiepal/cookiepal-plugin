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
import type { ButtonMatchers, ConsentPlan } from './plan.ts';
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
  /** What the page had after the click. Null when nothing was pressed. */
  after: { cookies: CapturedCookie[]; thirdPartyHosts: string[] } | null;
}

export interface PageLoad {
  cookies: CapturedCookie[];
  thirdPartyHosts: string[];
  title: unknown;
  finalUrl: unknown;
  httpStatus: number | null;
  loadTimedOut: boolean;
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
    // is stuck: give up rather than hang.
    return await withTimeout(
      Promise.race([run, started, closed]),
      timeoutMs + settleMs + (consent ? consent.plan.afterClickSettleMs + 10_000 : 0) + 20_000,
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
 */
const pressConsent = async (
  cdp: Cdp,
  sessionId: string,
  request: ConsentRequest,
): Promise<Omit<ConsentAttempt, 'after'> & { clicked: boolean }> => {
  const located = parseLocated(await evaluate(cdp, sessionId, locateExpression(request.plan, request.matchers)));
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
        if (params.requestId === documentRequest) httpStatus = (params.response as { status: number }).status;
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
  await delay(settleMs);

  const { cookies } = (await cdp.send('Storage.getCookies')) as { cookies: CapturedCookie[] };
  // The arrival reading, taken before anything is pressed. Each consent run compares against
  // its own, so a page that behaves differently between loads cannot invent a change.
  const arrival = { cookies: pickCookies(cookies), thirdPartyHosts: [...hosts] };

  let consent: ConsentAttempt | null = null;
  if (consentRequest) {
    // Set before the press, not after: requests the click causes start arriving
    // while `pressConsent` is still awaiting, and those are exactly the ones
    // being counted.
    pressed = true;
    const { clicked, ...attempt } = await pressConsent(cdp, mainSession, consentRequest);
    let after: ConsentAttempt['after'] = null;
    if (clicked) {
      await delay(consentRequest.plan.afterClickSettleMs);
      const settled = (await cdp.send('Storage.getCookies')) as { cookies: CapturedCookie[] };
      // Absolute: every cookie still set, and only the hosts contacted since
      // the press. The server counts these rather than reconstructing them.
      after = { cookies: pickCookies(settled.cookies), thirdPartyHosts: [...hostsAfterClick] };
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
    consent,
  };
};
