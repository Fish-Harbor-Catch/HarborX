import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { DEMO_PASSWORD } from "../../../backend/src/seed.js";

const passphrase = "browser-test-local-passphrase";
async function signIn(page, role = "seller") {
  await page.goto("/");
  await page.getByLabel("Email address").fill(`${role}@harborx.demo`);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
  const login = page.waitForResponse(response => response.url().endsWith("/api/auth/login") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await (await login).finished();
  await expect(page.locator("#main-content h1")).toBeVisible();
  return (await (await login).json()).user;
}
async function go(page, name) {
  const menu = page.getByRole("button", { name: "Open menu" });
  if (page.viewportSize().width <= 760) await menu.click();
  await page.locator(".sidebar nav").getByRole("button", { name: new RegExp(`^${name}`) }).click();
}
async function unlock(page, create = false) {
  await page.getByLabel("Local draft passphrase", { exact: true }).fill(passphrase);
  await page.getByRole("button", { name: create ? "Enable offline drafts" : "Unlock drafts", exact: true }).click();
  await expect(page.getByRole("button", { name: "Lock drafts" })).toBeVisible();
}
async function ready(page) {
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
}
async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
}

test("manifest, worker registration, mobile layout and public-only cache", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  await noOverflow(page);
  const manifest = await (await page.request.get("/manifest.webmanifest")).json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons.some(icon => icon.sizes === "192x192")).toBe(true);
  expect(manifest.icons.some(icon => icon.purpose === "maskable")).toBe(true);
  await ready(page);
  await signIn(page);
  await go(page, "My catches");
  await expect(page.getByRole("heading", { name: "Local catch drafts" })).toBeVisible();
  await noOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("seller-layout.png"), fullPage: true });
  const urls = await page.evaluate(async () => {
    const urls = [];
    for (const name of await caches.keys()) {
      for (const request of await (await caches.open(name)).keys()) urls.push(request.url);
    }
    return urls;
  });
  expect(urls.some(url => new URL(url).pathname.startsWith("/api"))).toBe(false);
  expect(urls.some(url => new URL(url).pathname === "/index.html")).toBe(true);
  const response = await page.request.get("/sw.js");
  expect(response.headers()["cache-control"]).toBe("no-cache");
});

test("legacy migration, offline cold reopen, catch recording and safe manual retry", async ({ page, context }, testInfo) => {
  const user = await signIn(page);
  await ready(page);
  const marker = `PWA-${randomUUID().slice(0, 8)}`;
  const id = randomUUID();
  await page.evaluate(async ({ marker, id, user }) => {
    localStorage.setItem(`harborx-drafts-${user.id}`, JSON.stringify([{
      client_id: id, species: "Sardine", grade: "A", weight: 42,
      base_price: 1000, min_increment: 50, harbor: "Dikkowita",
      boat_name: marker, arrival_at: new Date(Date.now() + 7200000).toISOString(),
      notes: "Migrated test draft", image_key: "sardine",
    }]));
  }, { marker, id, user });
  await go(page, "My catches");
  await unlock(page, true);
  await expect(page.locator(".draft-row").filter({ hasText: marker })).toHaveCount(1);
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith("harborx-drafts-")).length)).toBe(0);
  await context.setOffline(true);
  await page.close();
  const offline = await context.newPage();
  await offline.goto("/");
  await expect(offline.getByRole("heading", { name: "HarborX · Local catch drafts" })).toBeVisible();
  await expect(offline.locator(".draft-row")).toHaveCount(0);
  await offline.getByLabel("Local draft passphrase").fill("wrong");
  await offline.getByRole("button", { name: "Unlock drafts", exact: true }).click();
  await expect(offline.getByRole("alert")).toContainText("incorrect");
  await unlock(offline);
  await expect(offline.locator(".draft-row").filter({ hasText: marker })).toHaveCount(1);
  await offline.getByRole("button", { name: "Register catch" }).click();
  await offline.locator('[name="weight"]').fill("55");
  await offline.locator('[name="base_price"]').fill("1200");
  await offline.locator('[name="boat_name"]').fill(`${marker}-new`);
  await noOverflow(offline);
  await offline.screenshot({ path: testInfo.outputPath("offline-catch-form.png"), fullPage: true });
  await offline.getByRole("button", { name: "Save offline draft", exact: true }).click();
  await expect(offline.locator(".draft-row")).toHaveCount(2);
  await offline.reload();
  await unlock(offline);
  await expect(offline.locator(".draft-row")).toHaveCount(2);
  const failedApi = await offline.evaluate(async () => {
    try { await fetch("/api/auth/me"); return false; } catch { return true; }
  });
  expect(failedApi).toBe(true);
  await context.setOffline(false);
  await offline.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(offline.locator("#main-content h1")).toBeVisible();
  await go(offline, "My catches");
  await unlock(offline);
  await offline.request.post("/__test/lose-catch-confirmation");
  await offline.getByRole("button", { name: "Sync pending drafts", exact: true }).click();
  await expect(offline.locator(".draft-state.failed")).toHaveCount(1);
  await expect(offline.locator(".draft-row")).toHaveCount(2);
  await offline.getByRole("button", { name: "Sync pending drafts", exact: true }).click();
  await expect(offline.locator(".draft-state.synced")).toHaveCount(2);
  const stored = await offline.evaluate(async marker => {
    const { lots } = await (await fetch("/api/lots")).json();
    return lots.filter(lot => lot.boat_name.startsWith(marker)).map(lot => lot.id);
  }, marker);
  expect(stored).toHaveLength(2);
  expect(stored).toContain(id);
});

test("expired session blocks sync and reauthentication recovers retained drafts", async ({ page, context }) => {
  await signIn(page);
  await go(page, "My catches");
  await unlock(page, true);
  await page.getByRole("button", { name: "Register catch", exact: true }).click();
  await page.locator('[name="weight"]').fill("25");
  await page.locator('[name="base_price"]').fill("900");
  await page.locator('[name="boat_name"]').fill("Session test boat");
  await page.getByRole("button", { name: "Save on device", exact: true }).click();
  await expect(page.locator(".draft-row")).toHaveCount(1);
  await context.clearCookies();
  await page.getByRole("button", { name: "Sync pending drafts", exact: true }).click();
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  expect((await page.request.get("/api/lots")).status()).toBe(401);
  await signIn(page);
  await go(page, "My catches");
  await unlock(page);
  await expect(page.locator(".draft-row")).toHaveCount(1);
  await expect(page.locator(".draft-state.pending")).toHaveCount(1);
});

test("offline bidding is disabled and never queued", async ({ page, context }) => {
  await signIn(page, "buyer");
  await go(page, "Auctions");
  await page.locator(".lot-card").filter({ hasText: "Live" }).first().getByRole("button").first().click();
  const bid = page.getByRole("button", { name: "Place bid", exact: true });
  await expect(bid).toBeVisible();
  await context.setOffline(true);
  await expect(bid).toBeDisabled();
  let requests = 0;
  page.on("request", request => { if (request.method() === "POST" && /\/bids$/.test(request.url())) requests++; });
  await page.getByLabel("Your bid amount").fill("9999");
  await page.locator(".bid-form").evaluate(form => form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
  await context.setOffline(false);
  expect(requests).toBe(0);
});

test("an installed update waits without reloading an unsaved form", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await page.getByLabel("Email address").fill("unsaved@example.com");
  await page.request.post("/__test/update-worker");
  await page.evaluate(async () => { const registration = await navigator.serviceWorker.getRegistration(); await registration.update(); });
  await expect.poll(() => page.evaluate(async () => Boolean((await navigator.serviceWorker.getRegistration()).waiting))).toBe(true);
  await expect(page.getByLabel("Email address")).toHaveValue("unsaved@example.com");
  await expect(page.getByText(/Update ready\. Save drafts/)).toBeVisible();
});

test("common small screens retain usable forms without horizontal overflow", async ({ page }) => {
  await page.goto("/");
  for (const [width, height] of [[320, 568], [360, 640], [375, 667], [430, 932], [390, 360]]) {
    await page.setViewportSize({ width, height });
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
    await noOverflow(page);
    const target = await page.getByRole("button", { name: "Sign in", exact: true }).boundingBox();
    expect(target.height).toBeGreaterThanOrEqual(44);
    expect(await page.getByLabel("Email address").evaluate(input => parseFloat(getComputedStyle(input).fontSize))).toBeGreaterThanOrEqual(16);
  }
});

test("switching accounts in another window locks the previous seller workspace", async ({ page, context }) => {
  await signIn(page);
  await go(page, "My catches");
  await unlock(page, true);
  const other = await context.newPage();
  await other.goto("/");
  await expect(other.getByRole("button", { name: "Sign out", exact: true })).toBeVisible();
  await other.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  await signIn(other, "buyer");
  await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open saved local drafts" })).toHaveCount(0);
});
