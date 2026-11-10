import { test, expect } from "@playwright/test";
import { DEMO_PASSWORD } from "../../../backend/src/seed.js";

async function login(page, role = "seller", path = "/login") {
  await page.goto(path);
  await page.getByLabel("Email address").fill(`${role}@harborx.demo`);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator("#main-content h1")).toBeVisible();
}
async function go(page, name) {
  if (page.viewportSize().width <= 760)
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page
    .locator(".sidebar nav")
    .getByRole("button", { name, exact: true })
    .click();
}

// Each configured project exercises these flows on mobile or desktop.
test("public page navigation participates in Back and Forward history without reloading", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Email address").fill("history@example.com");
  await page.evaluate(() => {
    window.navigationMarker = "same-document";
  });
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page).toHaveURL(/\/register$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel("Email address")).toHaveValue(
    "history@example.com",
  );
  await page.goForward();
  await expect(page).toHaveURL(/\/register$/);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => window.navigationMarker)).toBe(
    "same-document",
  );
});

for (const role of ["seller", "buyer", "admin"]) {
  test(`${role} login, menus, Back, Forward and protected refresh follow the URL`, async ({
    page,
  }) => {
    await login(page, role);
    await expect(page).toHaveURL(`/${role}/dashboard`);
    await page.evaluate(() => {
      window.navigationMarker = "same-document";
    });
    await go(page, "Auctions");
    await expect(page).toHaveURL(`/${role}/auctions`);
    await go(page, "Payments");
    await expect(page).toHaveURL(`/${role}/payments`);
    await page.goBack();
    await expect(page).toHaveURL(`/${role}/auctions`);
    await expect(
      page.locator('.sidebar nav [aria-current="page"]'),
    ).toHaveAttribute("aria-label", "Auctions");
    await page.goBack();
    await expect(page).toHaveURL(`/${role}/dashboard`);
    await page.goForward();
    await expect(page).toHaveURL(`/${role}/auctions`);
    expect(await page.evaluate(() => window.navigationMarker)).toBe(
      "same-document",
    );
    await page.reload();
    await expect(page).toHaveURL(`/${role}/auctions`);
    await expect(page.locator("#main-content h1")).toBeVisible();
  });

  test(`${role} direct protected URL restores the intended destination after login`, async ({
    page,
  }) => {
    const destination = `/${role}/payments?source=direct#invoices`;
    await login(page, role, destination);
    await expect(page).toHaveURL(destination);
    await page.goto(`/${role}/activity`);
    await expect(page).toHaveURL(`/${role}/activity`);
    await expect(page.locator("#main-content h1")).toBeVisible();
  });
}

test("guests and the wrong role cannot render protected pages", async ({
  page,
}) => {
  await page.goto("/admin/users");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator("#main-content")).toHaveCount(0);
  await page.getByLabel("Email address").fill("seller@harborx.demo");
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL("/seller/dashboard");
  await page.goto("/admin/users");
  await expect(page).toHaveURL("/seller/dashboard");
  await expect(
    page
      .locator(".sidebar nav")
      .getByRole("button", { name: "User management", exact: true }),
  ).toHaveCount(0);
  await page.goto("/buyer/bids");
  await expect(page).toHaveURL("/seller/dashboard");
});

test("logout and browser Back never reveal protected content", async ({
  page,
}) => {
  await login(page);
  await go(page, "My catches");
  await go(page, "Auctions");
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL("/login");
  expect((await page.request.get("/api/auth/me")).status()).toBe(401);
  await page.goBack();
  await expect(page).toHaveURL("/login");
  await expect(page.locator("#main-content")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Sign in to HarborX" }),
  ).toBeVisible();
});

test.describe("Session restoration", () => {
  // WebKit service-worker requests bypass page.route. Block workers only for
  // this deliberately stalled API response; offline routing is tested below.
  test.use({ serviceWorkers: "block" });
  test("session restoration waits without flashing login and expiry redirects safely", async ({
    page,
    context,
  }) => {
    await login(page);
    let release;
    const pending = new Promise((resolve) => {
      release = resolve;
    });
    await page.route("**/api/auth/me", async (route) => {
      await pending;
      await route.continue();
    });
    await page.goto("/seller/catches");
    await expect(page.locator(".loading")).toBeVisible();
    await expect(page.locator(".auth-form")).toHaveCount(0);
    await expect(page.locator("#main-content")).toHaveCount(0);
    release();
    await expect(page).toHaveURL("/seller/catches");
    await expect(page.locator("#main-content h1")).toBeVisible();
    await context.clearCookies();
    await page.reload();
    await expect(page).toHaveURL("/login");
    await expect(page.locator("#main-content")).toHaveCount(0);
  });

  test("retrying a failed session probe clears stale errors and refreshes demo health without reloading", async ({
    page,
  }) => {
    let probes = 0;
    let healthChecks = 0;
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({
        status: ++probes === 1 ? 503 : 401,
        json: {
          error:
            probes === 1 ? "Temporary session failure" : "Sign in required",
        },
      }),
    );
    await page.route("**/api/health", (route) =>
      route.fulfill({ json: { status: "ok", demo: ++healthChecks > 1 } }),
    );
    await page.goto("/login");
    await expect(page.locator(".server-error")).toContainText(
      "Temporary session failure",
    );
    await page.evaluate(() => {
      window.navigationMarker = "same-document";
    });
    await page.getByRole("button", { name: "Retry", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Sign in to HarborX" }),
    ).toBeVisible();
    await expect(page.locator(".server-error")).toHaveCount(0);
    await expect.poll(() => healthChecks).toBe(2);
    expect(probes).toBe(2);
    expect(await page.evaluate(() => window.navigationMarker)).toBe(
      "same-document",
    );
  });
});

test("unknown routes show Not Found and hosting keeps API misses out of the SPA fallback", async ({
  page,
}) => {
  await page.goto("/missing/page");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
  await expect(page).toHaveURL("/missing/page");
  await page.getByRole("link", { name: "Return to HarborX" }).click();
  await expect(page).toHaveURL("/login");
  await login(page, "buyer");
  await page.goto("/buyer/unknown");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Return to HarborX" }).click();
  await expect(page).toHaveURL("/buyer/dashboard");
  const response = await page.request.get("/api/missing-route");
  expect(response.status()).toBe(404);
  expect(response.headers()["content-type"]).toContain("application/json");
});

test("language switching preserves the URL and continues across history navigation", async ({
  page,
}) => {
  await login(page, "buyer");
  await go(page, "Auctions");
  await page.getByRole("button", { name: "Select display language" }).click();
  await page.getByRole("option", { name: "தமிழ் (TA)", exact: true }).click();
  await expect(page).toHaveURL("/buyer/auctions");
  await page.goBack();
  await expect(page).toHaveURL("/buyer/dashboard");
  await expect(page.locator(".lang-selector-trigger")).toContainText("TA");
  await page.reload();
  await expect(page.locator(".lang-selector-trigger")).toContainText("TA");
  await expect(page).toHaveURL("/buyer/dashboard");
});

test("mobile bottom tabs update URLs and Back restores the previous tab", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await login(page, "buyer");
  const nav = page.getByRole("navigation", { name: "Mobile navigation bar" });
  await nav.getByRole("button", { name: "My bids", exact: true }).click();
  await expect(page).toHaveURL("/buyer/bids");
  await nav.getByRole("button", { name: "Won lots", exact: true }).click();
  await expect(page).toHaveURL("/buyer/won");
  await page.goBack();
  await expect(page).toHaveURL("/buyer/bids");
  await expect(
    nav.getByRole("button", { name: "My bids", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

test("a protected deep link cold-loads the PWA offline workspace and returns to the server session", async ({
  page,
  context,
}) => {
  await login(page);
  await go(page, "My catches");
  await page
    .getByLabel("Local draft passphrase", { exact: true })
    .fill("route-offline-passphrase");
  await page
    .getByRole("button", { name: "Enable offline drafts", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Lock drafts", exact: true }),
  ).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
    )
    .toBe(true);
  await context.setOffline(true);
  await page.goto("/seller/catches");
  await expect(page).toHaveURL("/offline");
  await expect(
    page.getByRole("heading", { name: "HarborX · Local catch drafts" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "HarborX · Local catch drafts" }),
  ).toBeVisible();
  await context.setOffline(false);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL("/seller/dashboard");
  await expect(page.locator("#main-content h1")).toBeVisible();
});
