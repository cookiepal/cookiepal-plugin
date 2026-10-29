#!/usr/bin/env node
// Built from src/ by pnpm build. Do not edit: CI fails when this file is out of date.

// src/scan.ts
import { rmSync as rmSync3 } from "node:fs";
import { pathToFileURL } from "node:url";

// src/browser.ts
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { delimiter, join } from "node:path";

// src/url.ts
import { getDomain } from "./tldts.mjs";

// src/browser.ts
var CheckError = class extends Error {
};
var MAC_APPS = [
  "Google Chrome.app/Contents/MacOS/Google Chrome",
  "Chromium.app/Contents/MacOS/Chromium",
  "Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "Brave Browser.app/Contents/MacOS/Brave Browser"
];
var LINUX_BINARIES = [
  "google-chrome",
  "google-chrome-stable",
  "chromium",
  "chromium-browser",
  "microsoft-edge",
  "brave-browser"
];
var WINDOWS_EXES = [
  "Google\\Chrome\\Application\\chrome.exe",
  "Microsoft\\Edge\\Application\\msedge.exe",
  "BraveSoftware\\Brave-Browser\\Application\\brave.exe",
  "Chromium\\Application\\chrome.exe"
];
var findBrowser = () => {
  const override = process.env.COOKIEPAL_BROWSER;
  if (override) return existsSync(override) ? override : null;
  let candidates;
  if (process.platform === "darwin") {
    const roots = ["/Applications", join(process.env.HOME ?? "", "Applications")];
    candidates = roots.flatMap((root) => MAC_APPS.map((app) => join(root, app)));
  } else if (process.platform === "win32") {
    const roots = [process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"], process.env.LOCALAPPDATA];
    candidates = roots.filter((root) => root !== void 0).flatMap((root) => WINDOWS_EXES.map((exe) => join(root, exe)));
  } else {
    const dirs = (process.env.PATH ?? "").split(delimiter).filter(Boolean);
    candidates = LINUX_BINARIES.flatMap((name) => dirs.map((dir) => join(dir, name)));
  }
  return candidates.find((path) => existsSync(path)) ?? null;
};

// src/engine.ts
import { spawnSync } from "node:child_process";
import { existsSync as existsSync2, mkdirSync, readFileSync } from "node:fs";
import { join as join2 } from "node:path";
var ENGINE_VERSION = "1.3.1";
var engineDir = (dataDir) => join2(dataDir, "engine");
var enginePackageJson = (dataDir) => join2(engineDir(dataDir), "node_modules", "@cookiepal-oss", "cli", "package.json");
var engineEntry = (dataDir) => join2(engineDir(dataDir), "node_modules", "@cookiepal-oss", "cli", "dist", "engine.js");
var installedVersion = (dataDir) => {
  try {
    const parsed = JSON.parse(readFileSync(enginePackageJson(dataDir), "utf8"));
    return typeof parsed === "object" && parsed !== null && typeof parsed.version === "string" ? parsed.version : null;
  } catch {
    return null;
  }
};
var installArgs = (dataDir) => [
  "install",
  "--prefix",
  engineDir(dataDir),
  "--no-audit",
  "--no-fund",
  "--ignore-scripts",
  `@cookiepal-oss/cli@${ENGINE_VERSION}`
];
var ensureEngine = (dataDir) => {
  if (installedVersion(dataDir) === ENGINE_VERSION) return;
  if (!existsSync2(engineDir(dataDir))) mkdirSync(engineDir(dataDir), { recursive: true });
  const result = spawnSync("npm", installArgs(dataDir), { encoding: "utf8" });
  if (result.error) {
    throw new CheckError(`Could not run npm to install the crawl engine: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const lastLines = (result.stderr ?? "").trim().split("\n").slice(-5).join("\n");
    throw new CheckError(
      `Installing the crawl engine failed.${lastLines ? ` ${lastLines}` : ""} Check this machine has npm and a network connection, then try again.`
    );
  }
  if (installedVersion(dataDir) !== ENGINE_VERSION) {
    throw new CheckError("The crawl engine did not install correctly. Try again.");
  }
};

// src/savedPlans.ts
import { mkdirSync as mkdirSync2, readdirSync, readFileSync as readFileSync2, rmSync as rmSync2, statSync, writeFileSync } from "node:fs";
import { join as join3 } from "node:path";
var SCANS = "scans";
var SCAN_PROGRESS = "scan-progress";
var UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
var MAX_AGE_MS = 30 * 60 * 1e3;
var PRIVATE_DIR = { recursive: true, mode: 448 };
var isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
var isExpired = (path) => Date.now() - statSync(path).mtimeMs > MAX_AGE_MS;
var liveFiles = (dir) => {
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return [];
  }
  const live = [];
  for (const name of names) {
    const path = join3(dir, name);
    try {
      if (isExpired(path)) rmSync2(path, { force: true });
      else live.push({ path, mtime: statSync(path).mtimeMs });
    } catch {
    }
  }
  return live.sort((a, b) => b.mtime - a.mtime).map(({ path }) => path);
};
var write = (dir, name, value) => {
  mkdirSync2(dir, PRIVATE_DIR);
  liveFiles(dir);
  writeFileSync(join3(dir, name), JSON.stringify(value), { mode: 384 });
};
var isScanId = (value) => typeof value === "string" && UUID.test(value);
var isCrawlableUrl = (value) => {
  let url;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase().replace(/^\x5B|\x5D$/g, "").replace(/\.$/, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    return false;
  }
  if (host.includes(":")) return !/^(::|f[cd]|fe[89abc])/.test(host);
  const octets = host.split(".").map(Number);
  if (octets.length === 4 && octets.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) {
    const [a, b] = octets;
    return !(a === 0 || a === 10 || a === 127 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168);
  }
  return true;
};
var readScan = (dataDir, scanId) => {
  if (!isScanId(scanId)) return null;
  const path = join3(dataDir, SCANS, `${scanId}.json`);
  try {
    if (isExpired(path)) {
      rmSync2(path, { force: true });
      return null;
    }
    const saved = JSON.parse(readFileSync2(path, "utf8"));
    if (!isRecord(saved)) return null;
    const { scanId: id, domainId, url, maxPages, savedAt } = saved;
    if (typeof id !== "string" || typeof domainId !== "string" || typeof url !== "string") return null;
    if (typeof maxPages !== "number" || typeof savedAt !== "number") return null;
    return { scanId: id, domainId, url, maxPages, savedAt };
  } catch {
    return null;
  }
};
var saveScanProgress = (dataDir, scanId, progress) => {
  if (!isScanId(scanId)) return false;
  write(join3(dataDir, SCAN_PROGRESS), `${scanId}.json`, { scanId, ...progress, savedAt: Date.now() });
  return true;
};

// src/categorise.ts
import { readFileSync as readFileSync3 } from "node:fs";
var catalogue;
var loadCatalogue = () => {
  const cookies = JSON.parse(
    readFileSync3(new URL("../dist/cookies.json", import.meta.url), "utf8")
  );
  const exact = /* @__PURE__ */ new Map();
  const prefixes = [];
  for (const entry of cookies) {
    const match = { category: entry.category, vendor: entry.vendor === "Unknown" ? null : entry.vendor, known: true };
    const name = entry.name.toLowerCase();
    if (entry.wildcard) prefixes.push({ prefix: name, match });
    else if (!exact.has(name)) exact.set(name, match);
  }
  prefixes.sort((a, b) => b.prefix.length - a.prefix.length);
  return { exact, prefixes };
};
var UNKNOWN = { category: "other", vendor: null, known: false };
var categorise = (name) => {
  catalogue ??= loadCatalogue();
  const lower = name.toLowerCase();
  const found = catalogue.exact.get(lower);
  if (found) return found;
  for (const { prefix, match } of catalogue.prefixes) {
    if (lower.startsWith(prefix) && lower.length > prefix.length) return match;
  }
  return UNKNOWN;
};

// src/result.ts
var COOKIE_NAME = /^[\x21-\x3A\x3C\x3E-\x7E]*$/;
var COOKIE_DOMAIN = /^\.?[A-Za-z0-9_.:\x5B\x5D\x2D]+$/;
var COOKIE_PATH = /^\/[\x21-\x3A\x3C-\x7E]*$/;
var fits = (value, pattern, max, min = 1) => value.length >= min && value.length <= max && pattern.test(value);
var cookieFits = (cookie, limits) => fits(cookie.name, COOKIE_NAME, limits.maxCookieNameLength, 0) && fits(cookie.domain, COOKIE_DOMAIN, limits.maxCookieDomainLength) && fits(cookie.path, COOKIE_PATH, limits.maxCookiePathLength);

// src/scanReport.ts
var SCAN_COOKIE_LIMITS = { maxCookieNameLength: 128, maxCookieDomainLength: 253, maxCookiePathLength: 128 };
var MAX_SCAN_COOKIES = 500;
var reportCookies = (cookies) => {
  const fitting = cookies.filter((cookie) => cookieFits(cookie, SCAN_COOKIE_LIMITS));
  return {
    cookies: fitting.slice(0, MAX_SCAN_COOKIES).map((cookie) => {
      const { category, vendor } = categorise(cookie.name);
      return {
        name: cookie.name,
        domain: cookie.domain,
        path: cookie.path,
        duration: cookie.duration,
        category,
        ...vendor ? { description: vendor } : {}
      };
    }),
    capped: fitting.length > MAX_SCAN_COOKIES
  };
};

// src/scanStart.ts
import { getDomain as getDomain2 } from "./tldts.mjs";
var START_TIMEOUT_MS = 15e3;
var resolveStart = async (url, fetchImpl = fetch) => {
  let landed;
  try {
    const response = await fetchImpl(url, { redirect: "follow", signal: AbortSignal.timeout(START_TIMEOUT_MS) });
    await response.body?.cancel();
    landed = response.url || url;
  } catch {
    return url;
  }
  if (landed === url) return url;
  const from = new URL(url).hostname;
  const to = new URL(landed).hostname;
  if (getDomain2(to) !== getDomain2(from) || !isCrawlableUrl(landed)) {
    throw new CheckError(
      `${from} redirects to another site, so a crawl from it would not cover this domain. Check the domain's URL in CookiePal.`
    );
  }
  return landed;
};

// src/scan.ts
var MAX_DEPTH = 3;
var CONCURRENCY = 3;
var run = async () => {
  const scanId = process.argv[2];
  const dataDir = process.env.COOKIEPAL_DATA_DIR || null;
  if (!scanId || !dataDir) return;
  const scan = readScan(dataDir, scanId);
  if (!scan) {
    saveScanProgress(dataDir, scanId, {
      status: "failed",
      error: "The scan could not be found. Start a new one with start_scan."
    });
    return;
  }
  const storageDir = `${dataDir}/crawl-storage/${scanId}`;
  try {
    ensureEngine(dataDir);
    saveScanProgress(dataDir, scanId, { status: "running", pagesVisited: 0 });
    const browserPath = findBrowser();
    if (!browserPath) {
      throw new CheckError(
        "No Chrome, Edge, Brave or Chromium was found. Install one, or set COOKIEPAL_BROWSER to its executable."
      );
    }
    process.env.PUPPETEER_EXECUTABLE_PATH = browserPath;
    const engineUrl = pathToFileURL(engineEntry(dataDir)).href;
    const { crawl } = await import(engineUrl);
    saveScanProgress(dataDir, scanId, { status: "running", pagesVisited: 0 });
    const start = await resolveStart(scan.url);
    let pagesVisited = 0;
    const result = await crawl({
      url: start,
      maxPages: scan.maxPages,
      maxDepth: MAX_DEPTH,
      concurrency: CONCURRENCY,
      storageDir,
      keepImages: true,
      markRequests: false,
      respectRobots: true,
      // It runs the user's own browser over up to maxPages of third-party scripts, so the sandbox stays on, as in the page check.
      sandbox: true,
      onPageCrawled: () => {
        pagesVisited += 1;
        saveScanProgress(dataDir, scanId, { status: "running", pagesVisited });
      }
    });
    if (result.startBlockedByRobots) {
      saveScanProgress(dataDir, scanId, {
        status: "blocked",
        blockedUrl: result.robotsBlocked[0] ?? start
      });
      return;
    }
    const { cookies, capped } = reportCookies(result.cookies);
    saveScanProgress(dataDir, scanId, {
      status: "done",
      pagesScanned: result.pagesVisited,
      cookies,
      thirdPartyHosts: [],
      // A heuristic: the engine reports no truncation signal, so a site with exactly maxPages pages reads as truncated too.
      truncated: result.pagesVisited >= scan.maxPages || capped
    });
  } catch (error) {
    saveScanProgress(dataDir, scanId, {
      status: "failed",
      error: error instanceof CheckError ? error.message : "The crawl could not be completed."
    });
  } finally {
    rmSync3(storageDir, { recursive: true, force: true });
  }
};
run();
