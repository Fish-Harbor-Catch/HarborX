import { test, expect } from "@playwright/test";
import { startDevServer } from "./dev-server.js";
import { DEMO_PASSWORD } from "../../../backend/src/seed.js";

const dashboards = {
  seller: "Catch overview",
  buyer: "Auction overview",
  admin: "Harbor operations",
};
async function screen(page, path, heading, testInfo) {
  await expect
    .poll(() => page.evaluate(() => window.location.pathname))
    .toBe(path);
  await expect(page.locator("#main-content h1")).toHaveText(heading);
  await expect(
    page.getByRole("heading", { name: heading, exact: true, level: 1 }),
  ).toBeVisible();
  await testInfo.attach(`${path.replaceAll("/", "-")}-state`, {
    body: JSON.stringify(
      await page.evaluate(() => ({
        pathname: location.pathname,
        heading: document.querySelector("#main-content h1")?.textContent,
        index: history.state?.idx,
        length: history.length,
        calls: window.navigationCalls,
      })),
      null,
      2,
    ),
    contentType: "application/json",
  });
}
async function login(page, role, origin) {
  await page.goto(`${origin}/login`);
  await page.getByLabel("Email address").fill(`${role}@harborx.demo`);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator("#main-content h1")).toHaveText(dashboards[role]);
}
async function sidebar(page, label) {
  if (page.viewportSize().width <= 760)
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page
    .locator(".sidebar nav")
    .getByRole("button", { name: label, exact: true })
    .click();
}
async function traceHistory(page) {
  return page.evaluate(() => {
    window.navigationCalls = [];
    for (const [method, action] of [
      ["pushState", "push"],
      ["replaceState", "replace"],
    ]) {
      const original = history[method];
      history[method] = function (...args) {
        const result = original.apply(this, args);
        window.navigationCalls.push({
          action,
          pathname: location.pathname,
          index: history.state?.idx,
        });
        return result;
      };
    }
    return history.state.idx;
  });
}

function navigationCases(getOrigin = () => "") {
  for (const { role, label, pageKey, heading } of [
    {
      role: "seller",
      label: "My catches",
      pageKey: "catches",
      heading: "My catches",
    },
    { role: "buyer", label: "My bids", pageKey: "bids", heading: "My bids" },
    {
      role: "admin",
      label: "User management",
      pageKey: "users",
      heading: "User management",
    },
  ]) {
    test(`${role} sidebar creates a real entry and Back/Forward restore both URL and exact content`, async ({
      page,
    }, testInfo) => {
      await login(page, role, getOrigin());
      const dashboard = `/${role}/dashboard`;
      const destination = `/${role}/${pageKey}`;
      await screen(page, dashboard, dashboards[role], testInfo);
      const index = await traceHistory(page);
      await sidebar(page, label);
      await screen(page, destination, heading, testInfo);
      expect(await page.evaluate(() => history.state.idx)).toBe(index + 1);
      expect(await page.evaluate(() => window.navigationCalls)).toEqual([
        { action: "push", pathname: destination, index: index + 1 },
      ]);
      await page.goBack();
      await screen(page, dashboard, dashboards[role], testInfo);
      expect(await page.evaluate(() => history.state.idx)).toBe(index);
      await page.goForward();
      await screen(page, destination, heading, testInfo);
      expect(await page.evaluate(() => history.state.idx)).toBe(index + 1);
      await page.reload();
      await screen(page, destination, heading, testInfo);
      await page.goto(`${getOrigin()}${destination}`);
      await screen(page, destination, heading, testInfo);
    });

    test(`${role} dashboard actions and auction history keep visible content synchronized`, async ({
      page,
    }, testInfo) => {
      await login(page, role, getOrigin());
      const dashboard = `/${role}/dashboard`;
      const target = role === "seller" ? "catches" : "auctions";
      const targetHeading = role === "seller" ? "My catches" : "Auctions";
      await page
        .locator(".auctions-panel")
        .getByRole("button", { name: "View all", exact: true })
        .click();
      await screen(page, `/${role}/${target}`, targetHeading, testInfo);
      await page.goBack();
      await screen(page, dashboard, dashboards[role], testInfo);
      await page.goForward();
      await screen(page, `/${role}/${target}`, targetHeading, testInfo);
      await page.goBack();
      await screen(page, dashboard, dashboards[role], testInfo);
      await sidebar(page, "Auctions");
      await screen(page, `/${role}/auctions`, "Auctions", testInfo);
      await page.goBack();
      await screen(page, dashboard, dashboards[role], testInfo);
      await page.goForward();
      await screen(page, `/${role}/auctions`, "Auctions", testInfo);
      await page.getByRole("button", { name: "Sign out", exact: true }).click();
      await expect
        .poll(() => page.evaluate(() => location.pathname))
        .toBe("/login");
      await expect(
        page.getByRole("heading", { name: "Sign in to HarborX", exact: true }),
      ).toBeVisible();
      await page.goBack();
      await expect
        .poll(() => page.evaluate(() => location.pathname))
        .toBe("/login");
      await expect(
        page.getByRole("heading", { name: "Sign in to HarborX", exact: true }),
      ).toBeVisible();
      await expect(page.locator("#main-content")).toHaveCount(0);
    });
  }
}

navigationCases();

test.describe("Vite development", () => {
  let vite;
  test.beforeAll(async () => {
    vite = await startDevServer();
  });
  test.afterAll(async () => {
    await vite?.close();
  });
  navigationCases(() => vite.url);
});
