import { type ChildProcess, spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import type { Readable, Writable } from 'node:stream';
import { getDomain } from 'tldts';
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

export interface PageLoad {
  cookies: CapturedCookie[];
  thirdPartyHosts: string[];
  title: unknown;
  finalUrl: unknown;
  httpStatus: number | null;
  loadTimedOut: boolean;
}

interface LoadOptions {
  browserPath: string;
  url: string;
  settleMs: number;
  timeoutMs: number;
}

/**
 * Loads one page once in a fresh temporary profile and reads what was set
 * before any consent: nothing on the page is clicked and no link is followed.
 * The profile is deleted afterwards, on failure and on Ctrl-C too.
 */
export const loadPage = async ({ browserPath, url, settleMs, timeoutMs }: LoadOptions): Promise<PageLoad> => {
  const profile = mkdtempSync(join(tmpdir(), 'cookiepal-check-'));
  let chrome: ChildProcess | undefined;

  const removeProfile = () => rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  const onSignal = () => {
    chrome?.kill('SIGKILL');
    removeProfile();
    process.exit(130);
  };
  process.once('SIGINT', onSignal);
  process.once('SIGTERM', onSignal);

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
    const run = capture(cdp, url, settleMs, timeoutMs);
    // Past the plan's own budget (timeoutMs to load, then settleMs), something is stuck: give up rather than hang.
    return await withTimeout(
      Promise.race([run, started, closed]),
      timeoutMs + settleMs + 20_000,
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
    process.removeListener('SIGINT', onSignal);
    process.removeListener('SIGTERM', onSignal);
  }
};

type Cdp = ReturnType<typeof connect>;

const capture = async (cdp: Cdp, url: string, settleMs: number, timeoutMs: number): Promise<PageLoad> => {
  const pageHost = new URL(url).hostname;
  const hosts = new Set<string>();
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
          if ((protocol === 'http:' || protocol === 'https:') && isThirdParty(hostname, pageHost)) hosts.add(hostname);
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
  const { targetInfo } = (await cdp.send('Target.getTargetInfo', { targetId })) as {
    targetInfo: { title: unknown; url: unknown };
  };

  return {
    // Picked field by field, so the value the protocol also returns goes no further.
    cookies: cookies.map(({ name, domain, path, expires, httpOnly, secure, sameSite }) => ({
      name,
      domain,
      path,
      expires,
      httpOnly,
      secure,
      sameSite,
    })),
    thirdPartyHosts: [...hosts],
    title: targetInfo.title,
    finalUrl: targetInfo.url,
    httpStatus,
    loadTimedOut,
  };
};
