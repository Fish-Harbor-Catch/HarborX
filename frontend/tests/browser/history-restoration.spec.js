import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { once } from "node:events";
import { startDevServer } from "./dev-server.js";
import { DEMO_PASSWORD } from "../../../backend/src/seed.js";

let externalServer, externalURL, developmentURL;
test.beforeAll(async () => {
  // A real second origin creates normal cross-document browser history.
  externalServer = createServer((request, response) => {
    const appOrigin =
      new URL(request.url, "http://localhost").searchParams.get("app") === "dev"
        ? developmentURL
        : "http://127.0.0.1:4173";
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(
      `<!doctype html><title>External website</title><h1>External website</h1><a href="${appOrigin}/login">Open HarborX login</a><a href="${appOrigin}/seller/dashboard">Open seller dashboard</a>`,
    );
  }).listen(0, "127.0.0.1");
  await once(externalServer, "listening");
  externalURL = `http://127.0.0.1:${externalServer.address().port}/`;
});
test.afterAll(async () => {
  if (externalServer)
    await new Promise((resolve, reject) =>
      externalServer.close((error) => (error ? reject(error) : resolve())),
    );
});

async function watchRenderedAuth(page) {
  await page.addInitScript(() => {
    window.authRenderHistory = [];
    new MutationObserver(() => {
      for (const [selector, state] of [
        [".auth-form", "login"],
        [".loading", "loading"],
        ["#main-content", "workspace"],
      ]) {
        if (
          document.querySelector(selector) &&
          window.authRenderHistory.at(-1) !== state
        )
          window.authRenderHistory.push(state);
      }
    }).observe(document, { subtree: true, childList: true });
  });
}

async function signIn(page, role, origin = "http://127.0.0.1:4173") {
  await page.getByLabel("Email address").fill(`${role}@harborx.demo`);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(`${origin}/${role}/dashboard`);
  await expect(page.locator("#main-content h1")).toBeVisible();
}

async function navigate(page, label) {
  if (page.viewportSize().width <= 760)
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page
    .locator(".sidebar nav")
    .getByRole("button", { name: label, exact: true })
    .click();
}

for (const role of ["seller", "buyer", "admin"]) {
  test(`${role} login replaces the entry: Back returns outside HarborX and Forward restores the dashboard`, async ({
    page,
  }) => {
    await watchRenderedAuth(page);
    await page.goto(externalURL);
    await page
      .getByRole("link", { name: "Open HarborX login", exact: true })
      .click();
    await signIn(page, role);
    await page.evaluate(() => {
      window.authRenderHistory = [];
    });
    await page.goBack();
    await expect(page).toHaveURL(externalURL);
    await expect(
      page.getByRole("heading", { name: "External website" }),
    ).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(`/${role}/dashboard`);
    await expect(page.locator("#main-content h1")).toBeVisible();
    expect(await page.evaluate(() => window.authRenderHistory)).not.toContain(
      "login",
    );
  });
}

test("seller Catches and Auctions keep real internal Back and Forward entries", async ({
  page,
}) => {
  await page.goto(externalURL);
  await page
    .getByRole("link", { name: "Open HarborX login", exact: true })
    .click();
  await signIn(page, "seller");
  await page.evaluate(() => {
    window.historyDocumentMarker = "unchanged";
  });
  for (const [label, path] of [
    ["My catches", "/seller/catches"],
    ["Auctions", "/seller/auctions"],
  ]) {
    await navigate(page, label);
    await expect(page).toHaveURL(path);
    await page.goBack();
    await expect(page).toHaveURL("/seller/dashboard");
    await expect(page.locator("#main-content h1")).toBeVisible();
    await page.goForward();
    await expect(page).toHaveURL(path);
    await page.goBack();
    await expect(page).toHaveURL("/seller/dashboard");
    expect(await page.evaluate(() => window.historyDocumentMarker)).toBe(
      "unchanged",
    );
  }
});

test.describe("Delayed session validation", () => {
  // Only these intercepted-request tests block service workers: WebKit worker
  // traffic can bypass page.route. Existing PWA tests keep workers enabled.
  test.use({ serviceWorkers: "block" });

  test("external direct entry, refresh and Forward show loading until the authenticated session is validated", async ({
    page,
  }) => {
    await watchRenderedAuth(page);
    const response = await page.request.post("/api/auth/login", {
      data: { email: "seller@harborx.demo", password: DEMO_PASSWORD },
    });
    expect(response.ok()).toBe(true);
    let release;
    let pending;
    await page.route("**/api/auth/me", async (route) => {
      if (pending) await pending;
      await route.continue();
    });
    const delay = () => {
      pending = new Promise((resolve) => {
        release = resolve;
      });
    };
    const validated = async () => {
      await expect(page.locator(".loading")).toBeVisible();
      await expect(page.locator(".auth-form, #main-content")).toHaveCount(0);
      expect(await page.evaluate(() => window.authRenderHistory)).not.toContain(
        "login",
      );
      release();
      await expect(page).toHaveURL("/seller/dashboard");
      await expect(page.locator("#main-content h1")).toBeVisible();
      expect(await page.evaluate(() => window.authRenderHistory)).not.toContain(
        "login",
      );
    };
    await page.goto(externalURL);
    delay();
    await page
      .getByRole("link", { name: "Open seller dashboard", exact: true })
      .click();
    await validated();
    delay();
    await page.reload();
    await validated();
    await page.goBack();
    await expect(page).toHaveURL(externalURL);
    delay();
    await page.goForward();
    await validated();
  });

  test("an unauthenticated direct dashboard entry waits for validation before showing Login", async ({
    page,
  }) => {
    let release;
    const pending = new Promise((resolve) => {
      release = resolve;
    });
    await page.route("**/api/auth/me", async (route) => {
      await pending;
      await route.continue();
    });
    await watchRenderedAuth(page);
    await page.goto("/seller/dashboard");
    await expect(page.locator(".loading")).toBeVisible();
    await expect(page.locator(".auth-form, #main-content")).toHaveCount(0);
    expect(await page.evaluate(() => window.authRenderHistory)).not.toContain(
      "login",
    );
    release();
    await expect(page).toHaveURL("/login");
    await expect(
      page.getByRole("heading", { name: "Sign in to HarborX" }),
    ).toBeVisible();
    await expect(page.locator("#main-content")).toHaveCount(0);
  });
});

test.describe("Development StrictMode", () => {
  let vite;
  test.beforeAll(async () => {
    vite = await startDevServer();
    developmentURL = vite.url;
  });
  test.afterAll(async () => {
    await vite?.close();
  });

  test("external Back and Forward restore the seller dashboard without rendering Login again", async ({
    page,
  }) => {
    await watchRenderedAuth(page);
    const external = `${externalURL}?app=dev`;
    await page.goto(external);
    await page
      .getByRole("link", { name: "Open HarborX login", exact: true })
      .click();
    await signIn(page, "seller", developmentURL);
    await page.evaluate(() => {
      window.authRenderHistory = [];
    });
    await page.goBack();
    await expect(page).toHaveURL(external);
    await page.goForward();
    await expect(page).toHaveURL(`${developmentURL}/seller/dashboard`);
    await expect(page.locator("#main-content h1")).toBeVisible();
    expect(await page.evaluate(() => window.authRenderHistory)).not.toContain(
      "login",
    );
  });
});

// Playwright disables BFCache by default and its navigation tracking does not
// support restored documents. Drive this Chromium-specific case through CDP,
// and require pageshow.persisted so a cold reload cannot make the test pass.
test("cached browser Forward revalidates the session before revealing protected content", async ({
  browser,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== "chromium",
    "CDP cache diagnostics require Chromium",
  );
  const cachedBrowser = await browser.browserType().launch({
    ...testInfo.project.use.launchOptions,
    // The standalone headless shell disables BFCache at the embedder level.
    // Use full Chromium's new headless mode for a real cached-document test.
    channel: "chromium",
    ignoreDefaultArgs: ["--disable-back-forward-cache"],
    args: ["--enable-features=BackForwardCache"],
  });
  try {
    const context = await cachedBrowser.newContext();
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.cachedPageShows = [];
      addEventListener("pageshow", (event) =>
        window.cachedPageShows.push(event.persisted),
      );
    });
    await watchRenderedAuth(page);
    await page.goto(externalURL);
    await page
      .getByRole("link", { name: "Open HarborX login", exact: true })
      .click();
    await signIn(page, "seller");
    await page.evaluate(() => {
      window.authRenderHistory = [];
    });
    const cdp = await context.newCDPSession(page);
    await cdp.send("Page.enable");
    const read = async (expression) =>
      (await cdp.send("Runtime.evaluate", { expression, returnByValue: true }))
        .result.value;
    const poll = async (expression) => {
      await expect
        .poll(async () => {
          try {
            return await read(expression);
          } catch {
            return undefined;
          }
        })
        .toBe(true);
    };
    let pendingProbe;
    const probes = [];
    await cdp.send("Fetch.enable", {
      patterns: [{ urlPattern: "*/api/auth/me", requestStage: "Request" }],
    });
    cdp.on("Fetch.requestPaused", (event) => {
      probes.push(event.requestId);
      pendingProbe = event.requestId;
    });
    const history = await cdp.send("Page.getNavigationHistory");
    const externalEntry = history.entries[history.currentIndex - 1].id;
    const appEntry = history.entries[history.currentIndex].id;
    const back = async () => {
      await cdp.send("Page.navigateToHistoryEntry", { entryId: externalEntry });
      await poll(`location.href === ${JSON.stringify(externalURL)}`);
    };
    const forward = async (expectedRestores) => {
      pendingProbe = undefined;
      await cdp.send("Page.navigateToHistoryEntry", { entryId: appEntry });
      await poll(
        `location.pathname === '/seller/dashboard' && window.cachedPageShows?.filter(Boolean).length === ${expectedRestores}`,
      );
      await expect.poll(() => pendingProbe).toBeTruthy();
      await poll(
        "!!document.querySelector('.loading') && !document.querySelector('.auth-form, #main-content')",
      );
      expect(await read("window.authRenderHistory")).not.toContain("login");
      expect(await read("window.authRenderHistory")).not.toContain("workspace");
    };
    await back();
    await forward(1);
    await cdp.send("Fetch.continueRequest", { requestId: pendingProbe });
    await poll("!!document.querySelector('#main-content')");
    expect(await read("window.authRenderHistory")).not.toContain("login");
    await read("window.authRenderHistory = []");
    await back();
    await context.clearCookies();
    // Watch the second restore independently from the successful first one.
    // The page was masked before entering the cache on the second departure.
    await forward(2);
    await cdp.send("Fetch.continueRequest", { requestId: pendingProbe });
    await poll(
      "location.pathname === '/login' && !!document.querySelector('.auth-form') && !document.querySelector('#main-content')",
    );
    expect(probes).toHaveLength(2);
  } finally {
    await cachedBrowser.close();
  }
});
