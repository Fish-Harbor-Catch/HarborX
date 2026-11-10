// Loaded only by the development entry point, and enabled explicitly per tab.
// No request bodies, URL queries, raw history state, or arbitrary DOM text are stored.
const flag = "harborx.navigationDebug";
const storageKey = "harborx.navigationTrace";
const reasons = new Set([
  "entry",
  "offline",
  "authenticated",
  "guest",
  "wrong-role",
]);
const events = new Set([
  "boot",
  "push",
  "replace",
  "popstate",
  "pageshow",
  "pagehide",
  "render",
  "session",
  "redirect",
  "menu",
  "logout",
]);
// Only fixed UI labels are eligible; arbitrary page text never enters the trace.
const headings = new Set([
  "Catch overview",
  "Auction overview",
  "Harbor operations",
  "My catches",
  "Auctions",
  "My bids",
  "Won lots",
  "Payments",
  "User management",
  "Reports",
  "Activity log",
  "Settings",
  "Sign in to HarborX",
  "Create your account",
]);
export function safePath(value) {
  if (typeof value !== "string") return "[unknown]";
  const path = value.split(/[?#]/, 1)[0];
  return /^\/(?:login|register|offline)?$/.test(path) ||
    /^\/(seller|buyer|admin)\/(dashboard|catches|auctions|bids|won|users|payments|reports|activity|settings)$/.test(
      path,
    )
    ? path
    : "[unknown]";
}
export function safeDetails(details = {}) {
  const result = {};
  if (details.destination !== undefined)
    result.destination = safePath(details.destination);
  if (reasons.has(details.reason)) result.reason = details.reason;
  if (["seller", "buyer", "admin", "guest"].includes(details.role))
    result.role = details.role;
  if (typeof details.ready === "boolean") result.ready = details.ready;
  if (typeof details.persisted === "boolean")
    result.persisted = details.persisted;
  if (
    ["start", "valid", "unauthenticated", "unavailable"].includes(details.phase)
  )
    result.phase = details.phase;
  return result;
}

export function installNavigationDebug(win = window) {
  try {
    if (win.sessionStorage.getItem(flag) !== "1") return;
  } catch {
    return;
  }
  if (win.harborxNavigationDebug) return;
  let entries = []; // Previous documents are retained as sanitized JSON in this tab.
  let previous = null;
  const handlers = [];
  const originals = {};
  const save = () => {
    try {
      win.sessionStorage.setItem(storageKey, JSON.stringify(entries));
    } catch {
      /* quota/private mode */
    }
  };
  const screen = () => {
    const doc = win.document;
    if (doc.querySelector(".loading")) return "loading";
    if (doc.querySelector(".auth-form")) return "auth";
    if (doc.querySelector("#main-content")) return "workspace";
    if (doc.querySelector(".offline-workspace")) return "offline-or-not-found";
    return "other";
  };
  const record = (event, details) => {
    if (!events.has(event)) return;
    const entry = {
      time: Date.now(),
      event,
      pathname: safePath(win.location.pathname),
      index: Number.isSafeInteger(win.history.state?.idx)
        ? win.history.state.idx
        : null,
      length: win.history.length,
      screen: screen(),
      ...safeDetails(details),
      heading: headings.has(
        win.document.querySelector("h1")?.textContent?.trim(),
      )
        ? win.document.querySelector("h1").textContent.trim()
        : "[unlisted-or-translated]",
    };
    entries.push(entry);
    entries = entries.slice(-300);
    save();
  };
  // Do not import arbitrary stored objects into the report.
  try {
    const saved = JSON.parse(win.sessionStorage.getItem(storageKey) || "[]");
    if (Array.isArray(saved))
      entries = saved
        .slice(-300)
        .filter((e) => events.has(e.event) && Number.isFinite(e.time))
        .map((e) => ({
          time: e.time,
          event: e.event,
          pathname: safePath(e.pathname),
          index: Number.isSafeInteger(e.index) ? e.index : null,
          length: Number.isSafeInteger(e.length) ? e.length : 0,
          screen: [
            "loading",
            "auth",
            "workspace",
            "offline-or-not-found",
            "other",
          ].includes(e.screen)
            ? e.screen
            : "other",
          heading: headings.has(e.heading)
            ? e.heading
            : "[unlisted-or-translated]",
          ...safeDetails(e),
        }));
  } catch {
    /* invalid diagnostic storage */
  }
  for (const [method, event] of [
    ["pushState", "push"],
    ["replaceState", "replace"],
  ]) {
    const original = win.history[method];
    originals[method] = original;
    win.history[method] = function (...args) {
      const result = original.apply(this, args);
      record(event);
      return result;
    };
  }
  for (const name of ["popstate", "pageshow", "pagehide"]) {
    const handler = (e) => record(name, { persisted: e.persisted });
    win.addEventListener(name, handler);
    handlers.push([name, handler]);
  }
  const observer = new win.MutationObserver(() => {
    const current = screen();
    if (previous !== current) {
      previous = current;
      record("render");
    }
  });
  observer.observe(win.document, { childList: true, subtree: true });
  async function snapshot() {
    // Read-only inspection. Never update/unregister workers or touch draft caches.
    let workers = { supported: Boolean(win.navigator.serviceWorker) };
    try {
      const sw = win.navigator.serviceWorker;
      if (sw) {
        const registrations = await sw.getRegistrations();
        workers = {
          ...workers,
          controlled: Boolean(sw.controller),
          controller: sw.controller
            ? workerPath(sw.controller.scriptURL)
            : null,
          registrations: registrations.map((r) => ({
            rootScope: new URL(r.scope).pathname === "/",
            active: Boolean(r.active),
            waiting: Boolean(r.waiting),
            installing: Boolean(r.installing),
            script: workerPath(
              (r.active || r.waiting || r.installing)?.scriptURL,
            ),
          })),
        };
      }
    } catch {
      workers.inspectionFailed = true;
    }
    const scripts = [...win.document.scripts].map((s) => {
      try {
        const path = new URL(s.src).pathname;
        if (path === "/@vite/client" || path === "/src/main.jsx") return path;
        if (/^\/assets\/index-[a-zA-Z0-9_-]{8}\.js$/.test(path)) return path;
      } catch {
        /* inline script */
      }
      return "[other-script]";
    });
    return {
      marker: "harborx-navigation-debug-v1",
      development: true,
      loopback: ["localhost", "127.0.0.1", "[::1]"].includes(
        win.location.hostname,
      ),
      port: /^\d*$/.test(win.location.port) ? win.location.port : "[unknown]",
      documentNavigation:
        win.performance.getEntriesByType("navigation")[0]?.type,
      scripts,
      workers,
      entries: structuredClone(entries),
    };
  }
  function workerPath(url) {
    try {
      return new URL(url).pathname === "/sw.js" ? "/sw.js" : "[other-worker]";
    } catch {
      return "[unknown]";
    }
  }
  win.harborxNavigationDebug = {
    record,
    snapshot,
    clear() {
      entries = [];
      save();
    },
    disable() {
      observer.disconnect();
      handlers.forEach(([name, handler]) =>
        win.removeEventListener(name, handler),
      );
      Object.assign(win.history, originals);
      try {
        win.sessionStorage.removeItem(flag);
        win.sessionStorage.removeItem(storageKey);
      } catch {
        /* private mode */
      }
      delete win.harborxNavigationDebug;
    },
  };
  record("boot");
}
