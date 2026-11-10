import { test, expect } from "@playwright/test";
import { startDevServer } from "./dev-server.js";
import { DEMO_PASSWORD } from "../../../backend/src/seed.js";

let vite;
test.beforeAll(async () => {
  vite = await startDevServer();
});
test.afterAll(async () => {
  await vite?.close();
});

test("opt-in real-tab diagnostics preserve history, observe redirects and redact private data", async ({
  page,
}) => {
  await page.goto(`${vite.url}/login`);
  expect(await page.evaluate(() => typeof window.harborxNavigationDebug)).toBe(
    "undefined",
  );
  await page.evaluate(() =>
    sessionStorage.setItem("harborx.navigationDebug", "1"),
  );
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => Boolean(window.harborxNavigationDebug)))
    .toBe(true);
  await page.getByLabel("Email address").fill("seller@harborx.demo");
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator("#main-content h1")).toHaveText("Catch overview");
  const index = await page.evaluate(() => history.state.idx);
  if (page.viewportSize().width <= 760)
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page
    .locator(".sidebar nav")
    .getByRole("button", { name: "My catches", exact: true })
    .click();
  await expect(page).toHaveURL(`${vite.url}/seller/catches`);
  await expect(page.locator("#main-content h1")).toHaveText("My catches");
  expect(await page.evaluate(() => history.state.idx)).toBe(index + 1);
  await page.goBack();
  await expect(page).toHaveURL(`${vite.url}/seller/dashboard`);
  await expect(page.locator("#main-content h1")).toHaveText("Catch overview");
  await page.goForward();
  await expect(page).toHaveURL(`${vite.url}/seller/catches`);
  await expect(page.locator("#main-content h1")).toHaveText("My catches");
  await page.evaluate(() => {
    history.replaceState(
      {
        ...history.state,
        usr: { token: "DO_NOT_EXPORT", email: "private@example.test" },
      },
      "",
      "/seller/catches?token=DO_NOT_EXPORT#private@example.test",
    );
    window.harborxNavigationDebug.record("redirect", {
      reason: "guest",
      destination: "/login?token=DO_NOT_EXPORT",
      token: "DO_NOT_EXPORT",
    });
  });
  await page.reload();
  await expect(page.locator("#main-content h1")).toHaveText("My catches");
  const report = await page.evaluate(() =>
    window.harborxNavigationDebug.snapshot(),
  );
  const serialized = JSON.stringify(report);
  for (const secret of [
    "DO_NOT_EXPORT",
    "private@example.test",
    "seller@harborx.demo",
    DEMO_PASSWORD,
  ])
    expect(serialized).not.toContain(secret);
  expect(report.port).toBe(new URL(vite.url).port);
  expect(report.scripts).toContain("/src/main.jsx");
  expect(report.entries.filter((e) => e.event === "boot")).toHaveLength(2);
  expect(report.entries).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        event: "redirect",
        reason: "authenticated",
        destination: "/seller/dashboard",
      }),
      expect.objectContaining({
        event: "push",
        pathname: "/seller/catches",
        index: index + 1,
      }),
      expect.objectContaining({
        event: "popstate",
        pathname: "/seller/dashboard",
        index,
      }),
      expect.objectContaining({
        event: "popstate",
        pathname: "/seller/catches",
        index: index + 1,
      }),
      expect.objectContaining({
        event: "session",
        phase: "valid",
        role: "seller",
      }),
    ]),
  );
  await page.evaluate(() => window.harborxNavigationDebug.disable());
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem("harborx.navigationDebug"),
    ),
  ).toBeNull();
  expect(await page.evaluate(() => typeof window.harborxNavigationDebug)).toBe(
    "undefined",
  );
});

test("production never loads the diagnostic utility, even with the opt-in flag", async ({
  page,
}) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("harborx.navigationDebug", "1"),
  );
  const loaded = [];
  page.on("request", (request) => loaded.push(request.url()));
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Sign in to HarborX", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => typeof window.harborxNavigationDebug)).toBe(
    "undefined",
  );
  expect(loaded.some((url) => url.includes("navigation-debug"))).toBe(false);
});
