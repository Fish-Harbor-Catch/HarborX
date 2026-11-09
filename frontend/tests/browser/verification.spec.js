import { test, expect } from "@playwright/test";
import { DEMO_PASSWORD } from "../../../backend/src/seed.js";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const SCREENSHOT_DIR = join(process.cwd(), "test-results", "screenshots");
try {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
} catch {}

function setupDiagnostics(page) {
  const consoleErrors = [];
  const consoleWarnings = [];
  const failedRequests = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    } else if (msg.type() === "warning") {
      consoleWarnings.push(msg.text());
    }
  });

  page.on("pageerror", (err) => {
    consoleErrors.push(`PageError: ${err.message}`);
  });

  page.on("requestfailed", (request) => {
    failedRequests.push({
      url: request.url(),
      method: request.method(),
      failure: request.failure()?.errorText || "unknown",
    });
  });

  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedRequests.push({
        url: response.url(),
        method: response.request().method(),
        status: response.status(),
      });
    }
  });

  return { consoleErrors, consoleWarnings, failedRequests };
}

async function noOverflow(page, screenName = "") {
  const details = await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const bodyWidth = document.body.scrollWidth;
    const winWidth = window.innerWidth;
    const isOverflowing = docWidth > winWidth + 1 || bodyWidth > winWidth + 1;
    let offenders = [];
    if (isOverflowing) {
      for (const el of document.querySelectorAll("*")) {
        const rect = el.getBoundingClientRect();
        if (rect.right > winWidth + 2) {
          offenders.push({
            tag: el.tagName,
            id: el.id,
            className: typeof el.className === "string" ? el.className.slice(0, 50) : "",
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          });
        }
      }
    }
    return { isOverflowing, docWidth, bodyWidth, winWidth, offenders: offenders.slice(0, 5) };
  });

  expect(
    details.isOverflowing,
    `Horizontal overflow on ${screenName}: docWidth=${details.docWidth}, bodyWidth=${details.bodyWidth}, winWidth=${details.winWidth}. Offenders: ${JSON.stringify(details.offenders)}`,
  ).toBe(false);
}

async function signIn(page, role = "seller") {
  await page.goto("/");
  await page.getByLabel("Email address").fill(`${role}@harborx.demo`);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
  const login = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/auth/login") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await (await login).finished();
  await expect(page.locator("#main-content h1")).toBeVisible();
  return (await (await login).json()).user;
}

async function go(page, name) {
  const width = page.viewportSize()?.width || 1440;
  if (width <= 760) {
    const isOpen = await page.locator(".sidebar").evaluate((el) => el.classList.contains("open"));
    if (!isOpen) {
      const menu = page.getByRole("button", { name: "Open menu" });
      if (await menu.isVisible()) {
        await menu.click();
        await page.waitForTimeout(200);
      }
    }
  }
  const button = page
    .locator(".sidebar nav")
    .getByRole("button", { name: new RegExp(`^${name}`) });
  await button.scrollIntoViewIfNeeded();
  await button.click();
  await page.waitForTimeout(200);
}

test.describe("PHASE 2: Desktop Browser Testing (1440x900)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("Admin Experience — complete workspace verification", async ({ page }) => {
    const diagnostics = setupDiagnostics(page);
    await signIn(page, "admin");

    // 1. Dashboard rendering
    await expect(page.locator("#main-content h1")).toBeVisible();
    await expect(page.locator(".hero-banner")).toHaveCount(0);
    await expect(page.locator(".stats-grid").first()).toBeVisible();
    await expect(page.locator(".stats-grid")).toBeVisible();
    await expect(page.locator(".pipeline")).toBeVisible();
    await noOverflow(page, "Admin Overview");
    await page.screenshot({ path: join(SCREENSHOT_DIR, "desktop-admin-01-overview.png"), fullPage: true });

    // 2. Auctions Screen
    await go(page, "Auctions");
    await expect(page.getByRole("heading", { name: "Auctions" })).toBeVisible();
    await expect(page.locator(".search-box input")).toBeVisible();
    await expect(page.locator(".status-tabs button[role='tab']").first()).toBeVisible();
    await noOverflow(page, "Admin Auctions");
    await page.screenshot({ path: join(SCREENSHOT_DIR, "desktop-admin-02-auctions.png"), fullPage: true });

    // 3. User Management Screen
    await go(page, "User management");
    await expect(page.getByRole("heading", { name: "User management" })).toBeVisible();
    await expect(page.locator(".table-wrap table")).toBeVisible();
    await noOverflow(page, "Admin Users");
    await page.screenshot({ path: join(SCREENSHOT_DIR, "desktop-admin-03-users.png"), fullPage: true });

    // 4. Payments Screen
    await go(page, "Payments");
    await expect(page.getByRole("heading", { name: "Payments" })).toBeVisible();
    await expect(page.locator(".stats-grid.three")).toBeVisible();
    await noOverflow(page, "Admin Payments");
    await page.screenshot({ path: join(SCREENSHOT_DIR, "desktop-admin-04-payments.png"), fullPage: true });

    // 5. Reports Screen
    await go(page, "Reports");
    await expect(page.getByRole("heading", { name: "Reports" })).toBeVisible();
    await expect(page.locator(".reports-grid")).toBeVisible();
    await noOverflow(page, "Admin Reports");
    await page.screenshot({ path: join(SCREENSHOT_DIR, "desktop-admin-05-reports.png"), fullPage: true });

    // 6. Activity Screen
    await go(page, "Activity log");
    await expect(page.getByRole("heading", { name: "Activity log" })).toBeVisible();
    await expect(page.locator(".activity-list")).toBeVisible();
    await noOverflow(page, "Admin Activity");
    await page.screenshot({ path: join(SCREENSHOT_DIR, "desktop-admin-06-activity.png"), fullPage: true });

    // 7. Settings Screen
    await go(page, "Settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(page.locator(".settings-grid")).toBeVisible();
    await noOverflow(page, "Admin Settings");
    await page.screenshot({ path: join(SCREENSHOT_DIR, "desktop-admin-07-settings.png"), fullPage: true });

    // Check diagnostics
    const isPreAuthMe = (err) => err.includes("status of 401") || err.includes("/api/auth/me");
    expect(diagnostics.consoleErrors.filter((e) => !e.includes("favicon") && !isPreAuthMe(e))).toHaveLength(0);
    expect(diagnostics.failedRequests.filter((r) => !r.url.includes("favicon") && !r.url.includes("/api/auth/me"))).toHaveLength(0);
  });

  test("Seller Experience — dashboard, catches, draft panel, registration modal, auctions, payments", async ({ page }) => {
    const diagnostics = setupDiagnostics(page);
    await signIn(page, "seller");

    // 1. Seller Dashboard
    await expect(page.locator("#main-content h1")).toBeVisible();
    await expect(page.locator(".hero-banner")).toHaveCount(0);
    await expect(page.locator(".stats-grid").first()).toBeVisible();
    await expect(page.locator(".stats-grid")).toBeVisible();
    await noOverflow(page, "Seller Overview");
    await page.screenshot({ path: join(SCREENSHOT_DIR, "desktop-seller-01-overview.png"), fullPage: true });

    // 2. Catches Screen & Draft Panel
    await go(page, "My catches");
    await expect(page.getByRole("heading", { name: "My catches" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Local catch drafts" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Local catch drafts" })).toBeVisible();
    await noOverflow(page, "Seller Catches");
    await page.screenshot({ path: join(SCREENSHOT_DIR, "desktop-seller-02-catches.png"), fullPage: true });

    // 3. Catch Registration Modal
    await page.getByRole("button", { name: "Register catch", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Register a new catch" })).toBeVisible();
    await expect(page.locator("form.catch-form")).toBeVisible();
    await page.screenshot({ path: join(SCREENSHOT_DIR, "desktop-seller-03-register-modal.png") });

    // Test Escape to close modal
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);

    // 4. Auctions Navigation
    await go(page, "Auctions");
    await expect(page.getByRole("heading", { name: "Auctions" })).toBeVisible();
    await noOverflow(page, "Seller Auctions");

    // 5. Payments Screen
    await go(page, "Payments");
    await expect(page.getByRole("heading", { name: "Payments" })).toBeVisible();
    await noOverflow(page, "Seller Payments");
    await page.screenshot({ path: join(SCREENSHOT_DIR, "desktop-seller-04-payments.png"), fullPage: true });

    // Check diagnostics
    const isPreAuthMe = (err) => err.includes("status of 401") || err.includes("/api/auth/me");
    expect(diagnostics.consoleErrors.filter((e) => !e.includes("favicon") && !isPreAuthMe(e))).toHaveLength(0);
    expect(diagnostics.failedRequests.filter((r) => !r.url.includes("favicon") && !r.url.includes("/api/auth/me"))).toHaveLength(0);
  });

  test("Buyer Experience — dashboard, auctions, lot details modal, bids, won lots, payments", async ({ page }) => {
    const diagnostics = setupDiagnostics(page);
    await signIn(page, "buyer");

    // 1. Buyer Dashboard
    await expect(page.locator("#main-content h1")).toBeVisible();
    await expect(page.locator(".hero-banner")).toHaveCount(0);
    await expect(page.locator(".stats-grid").first()).toBeVisible();
    await expect(page.locator(".stats-grid")).toBeVisible();
    await noOverflow(page, "Buyer Overview");
    await page.screenshot({ path: join(SCREENSHOT_DIR, "desktop-buyer-01-overview.png"), fullPage: true });

    // 2. Auctions & Filtering
    await go(page, "Auctions");
    await expect(page.getByRole("heading", { name: "Auctions" })).toBeVisible();
    const searchInput = page.locator(".search-box input");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Tuna");
    await page.waitForTimeout(200);
    await noOverflow(page, "Buyer Auctions Filtered");

    // 3. Lot Details Modal
    const lotCard = page.locator(".lot-card").first();
    await expect(lotCard).toBeVisible();
    await lotCard.getByRole("button", { name: "View lot", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.locator(".detail-top")).toBeVisible();
    await page.screenshot({ path: join(SCREENSHOT_DIR, "desktop-buyer-02-lot-detail-modal.png") });

    // Close modal via Escape
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);

    // 4. Bid History (My bids)
    await go(page, "My bids");
    await expect(page.getByRole("heading", { name: "My bids" })).toBeVisible();
    await noOverflow(page, "Buyer Bids");
    await page.screenshot({ path: join(SCREENSHOT_DIR, "desktop-buyer-03-bids.png"), fullPage: true });

    // 5. Won Lots
    await go(page, "Won lots");
    await expect(page.getByRole("heading", { name: "Won lots" })).toBeVisible();
    await noOverflow(page, "Buyer Won Lots");
    await page.screenshot({ path: join(SCREENSHOT_DIR, "desktop-buyer-04-won.png"), fullPage: true });

    // 6. Payments
    await go(page, "Payments");
    await expect(page.getByRole("heading", { name: "Payments" })).toBeVisible();
    await noOverflow(page, "Buyer Payments");
    await page.screenshot({ path: join(SCREENSHOT_DIR, "desktop-buyer-05-payments.png"), fullPage: true });

    // Check diagnostics
    const isPreAuthMe = (err) => err.includes("status of 401") || err.includes("/api/auth/me");
    expect(diagnostics.consoleErrors.filter((e) => !e.includes("favicon") && !isPreAuthMe(e))).toHaveLength(0);
    expect(diagnostics.failedRequests.filter((r) => !r.url.includes("favicon") && !r.url.includes("/api/auth/me"))).toHaveLength(0);
  });
});

test.describe("PHASE 3: Responsive Viewport Testing", () => {
  const viewports = [
    { label: "mobile-320", width: 320, height: 720 },
    { label: "mobile-360", width: 360, height: 800 },
    { label: "tablet-760", width: 760, height: 1024 },
    { label: "desktop-1200", width: 1200, height: 800 },
    { label: "desktop-1440", width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    test(`Responsive verification at ${vp.label} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const diagnostics = setupDiagnostics(page);

      // 1. Auth Page
      await page.goto("/");
      await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
      await noOverflow(page, `Auth ${vp.label}`);
      await page.screenshot({ path: join(SCREENSHOT_DIR, `responsive-auth-${vp.label}.png`), fullPage: true });

      // Check input font-size >= 16px on mobile to prevent iOS zoom
      if (vp.width <= 760) {
        const emailInput = page.getByLabel("Email address");
        const fontSize = await emailInput.evaluate((el) => parseFloat(window.getComputedStyle(el).fontSize));
        expect(fontSize).toBeGreaterThanOrEqual(16);
      }

      // Sign in as seller
      await signIn(page, "seller");
      await noOverflow(page, `Seller Overview ${vp.label}`);
      await page.screenshot({ path: join(SCREENSHOT_DIR, `responsive-seller-overview-${vp.label}.png`), fullPage: true });

      // 2. Navigation behavior
      if (vp.width <= 760) {
        // Mobile bottom navigation bar should be visible
        const bottomNav = page.locator(".mobile-bottom-nav");
        await expect(bottomNav).toBeVisible();

        // Hamburger menu triggers drawer
        const hamburger = page.getByRole("button", { name: "Open menu" });
        await expect(hamburger).toBeVisible();
        await hamburger.click();
        await page.waitForTimeout(200);

        const sidebar = page.locator(".sidebar");
        await expect(sidebar).toHaveClass(/open/);
        const scrim = page.locator(".sidebar-scrim");
        await expect(scrim).toHaveClass(/show/);
        await page.screenshot({ path: join(SCREENSHOT_DIR, `responsive-drawer-${vp.label}.png`) });

        // Close drawer with close button
        const closeBtn = page.getByRole("button", { name: "Close navigation drawer" });
        await closeBtn.click();
        await page.waitForTimeout(200);
        await expect(sidebar).not.toHaveClass(/open/);
      }

      // 3. Catches view and modal fit
      await go(page, "My catches");
      await noOverflow(page, `Seller Catches ${vp.label}`);

      // Open Catch registration modal
      await page.getByRole("button", { name: "Register catch", exact: true }).click();
      const modal = page.locator(".modal");
      await expect(modal).toBeVisible();

      // Check modal fits within viewport
      const modalBox = await modal.boundingBox();
      expect(modalBox?.width).toBeLessThanOrEqual(vp.width + 1);
      await page.screenshot({ path: join(SCREENSHOT_DIR, `responsive-catch-modal-${vp.label}.png`) });

      await page.keyboard.press("Escape");
      await expect(modal).toHaveCount(0);

      // Diagnostics check
      const isPreAuthMe = (err) => err.includes("status of 401") || err.includes("/api/auth/me");
      expect(diagnostics.consoleErrors.filter((e) => !e.includes("favicon") && !isPreAuthMe(e))).toHaveLength(0);
      expect(diagnostics.failedRequests.filter((r) => !r.url.includes("favicon") && !r.url.includes("/api/auth/me"))).toHaveLength(0);
    });
  }
});

test.describe("PHASE 4: Functional & Accessibility Checks", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("Buyer functional checks — Search & filtering, empty states, tabs, modal focus trapping", async ({ page }) => {
    const diagnostics = setupDiagnostics(page);
    await signIn(page, "buyer");

    // 1. Search filtering
    await go(page, "Auctions");
    const searchInput = page.locator(".search-box input");
    await searchInput.fill("NonExistentFishQuery12345");
    await page.waitForTimeout(300);

    // Verify empty state is displayed gracefully
    await expect(page.getByRole("heading", { name: "No catches match your filters" })).toBeVisible();
    await page.screenshot({ path: join(SCREENSHOT_DIR, "a11y-empty-state-search.png") });

    // Clear search
    await searchInput.fill("");
    await page.waitForTimeout(200);
    await expect(page.locator(".lot-card").first()).toBeVisible();

    // 2. Filter tabs
    const filterTabs = page.locator(".status-tabs button[role='tab']");
    const tabCount = await filterTabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(3);
    for (let i = 0; i < tabCount; i++) {
      const tab = filterTabs.nth(i);
      await tab.click();
      await page.waitForTimeout(150);
      await noOverflow(page, `Auctions filter tab ${i}`);
    }

    await filterTabs.first().click();

    // 3. Modal Focus Trap and Escape dismissal
    const firstLot = page.locator(".lot-card").first();
    await firstLot.getByRole("button", { name: "View lot", exact: true }).click();
    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(page.locator(".detail-top")).toBeVisible();

    // Verify focus is inside modal
    await expect.poll(async () => {
      return page.evaluate(() => {
        const dialog = document.querySelector(".modal, [role='dialog']");
        return dialog ? dialog.contains(document.activeElement) : false;
      });
    }).toBe(true);

    // Tab key navigation stays trapped in dialog
    await page.keyboard.press("Tab");
    const tabStillInside = await page.evaluate(() => {
      const dialog = document.querySelector(".modal, [role='dialog']");
      return dialog ? dialog.contains(document.activeElement) : false;
    });
    expect(tabStillInside).toBe(true);

    // Dismiss with backdrop click
    const backdrop = page.locator(".modal-backdrop");
    await backdrop.click({ position: { x: 10, y: 10 } });
    await expect(modal).toHaveCount(0);

    // Diagnostics check
    const isPreAuthMe = (err) => err.includes("status of 401") || err.includes("/api/auth/me");
    expect(diagnostics.consoleErrors.filter((e) => !e.includes("favicon") && !isPreAuthMe(e))).toHaveLength(0);
    expect(diagnostics.failedRequests.filter((r) => !r.url.includes("favicon") && !r.url.includes("/api/auth/me"))).toHaveLength(0);
  });

  test("Seller functional checks — Catch form validation, required attributes, keyboard escape", async ({ page }) => {
    const diagnostics = setupDiagnostics(page);
    await signIn(page, "seller");

    await go(page, "My catches");
    await page.getByRole("button", { name: "Register catch", exact: true }).click();
    const catchForm = page.locator("form.catch-form");
    await expect(catchForm).toBeVisible();

    // Try submitting with required weight missing
    const weightInput = page.locator('[name="weight"]');
    await weightInput.fill("");
    await catchForm.getByRole("button", { name: "Submit catch" }).click();

    // HTML5 validation prevents submit
    const isValid = await weightInput.evaluate((el) => el.checkValidity());
    expect(isValid).toBe(false);

    // Dismiss with Escape key
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);

    // Diagnostics check
    const isPreAuthMe = (err) => err.includes("status of 401") || err.includes("/api/auth/me");
    expect(diagnostics.consoleErrors.filter((e) => !e.includes("favicon") && !isPreAuthMe(e))).toHaveLength(0);
    expect(diagnostics.failedRequests.filter((r) => !r.url.includes("favicon") && !r.url.includes("/api/auth/me"))).toHaveLength(0);
  });
});
