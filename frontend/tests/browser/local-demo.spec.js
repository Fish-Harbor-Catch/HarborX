import { test, expect } from "@playwright/test";
import { startDevServer } from "./dev-server.js";
import { readFile, readdir } from "node:fs/promises";
import { DEMO_PASSWORD } from "../../../backend/src/seed.js";

const accounts = [
  { label: "Seller", role: "seller", email: "seller@harborx.demo" },
  { label: "Buyer", role: "buyer", email: "buyer@harborx.demo" },
  { label: "Manager", role: "admin", email: "admin@harborx.demo" },
];

test("production hides local demo and excludes demo credentials from JavaScript", async ({
  page,
}) => {
  // The existing test API reports demo:true, so this also tests the build guard.
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Sign in to HarborX" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "DEMO", exact: true }),
  ).toHaveCount(0);
  const assets = new URL("../../dist/assets/", import.meta.url);
  for (const file of await readdir(assets)) {
    if (!file.endsWith(".js")) continue;
    const javascript = await readFile(new URL(file, assets), "utf8");
    expect(javascript).not.toContain(DEMO_PASSWORD);
    for (const account of accounts)
      expect(javascript).not.toContain(account.email);
  }
});

test.describe("demo-enabled development login", () => {
  let vite;
  test.beforeAll(async () => {
    // Reuse the existing disposable seeded API, serving the actual source in DEV.
    vite = await startDevServer();
  });
  test.afterAll(async () => {
    await vite?.close();
  });

  for (const account of accounts) {
    test(`${account.label} fills seeded credentials and signs in as ${account.role}`, async ({
      page,
    }) => {
      const errors = [];
      const loginRequests = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("request", (request) => {
        if (
          request.method() === "POST" &&
          request.url().endsWith("/api/auth/login")
        )
          loginRequests.push(request);
      });
      await page.goto(`${vite.url}/`);
      const panel = page.getByRole("region", {
        name: "DEMO",
        exact: true,
      });
      await expect(panel).toBeVisible();
      // Check switching roles updates both fields, without authenticating.
      for (const candidate of accounts) {
        await panel
          .getByRole("button", { name: candidate.label, exact: true })
          .click();
        await expect(page.getByLabel("Email address")).toHaveValue(
          candidate.email,
        );
        await expect(page.getByLabel("Password", { exact: true })).toHaveValue(
          DEMO_PASSWORD,
        );
        await expect(
          panel.getByRole("button", { name: candidate.label, exact: true }),
        ).toHaveAttribute("aria-pressed", "true");
        await expect(panel.locator('[aria-pressed="true"]')).toHaveCount(1);
      }
      await panel
        .getByRole("button", { name: account.label, exact: true })
        .click();
      await expect(
        page.getByRole("heading", { name: "Sign in to HarborX" }),
      ).toBeVisible();
      expect(loginRequests).toHaveLength(0);
      // Editing the filled credentials clears the selected-role indication.
      await page
        .getByLabel("Password", { exact: true })
        .fill("changed-password");
      await expect(panel.locator('[aria-pressed="true"]')).toHaveCount(0);
      await panel
        .getByRole("button", { name: account.label, exact: true })
        .click();
      const response = page.waitForResponse(
        (res) =>
          res.url().endsWith("/api/auth/login") &&
          res.request().method() === "POST",
      );
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      const login = await response;
      expect(login.ok()).toBe(true);
      expect((await login.json()).user.role).toBe(account.role);
      expect(loginRequests).toHaveLength(1);
      await expect(page).toHaveURL(`${vite.url}/${account.role}/dashboard`);
      await expect(page.locator("#main-content h1")).toBeVisible();
      if (page.viewportSize().width <= 760) {
        await page
          .getByRole("button", { name: "Open menu", exact: true })
          .click();
      }
      const expectedNavigation =
        account.role === "seller"
          ? "My catches"
          : account.role === "buyer"
            ? "My bids"
            : "User management";
      await expect(
        page
          .locator(".sidebar nav")
          .getByRole("button", { name: expectedNavigation, exact: true }),
      ).toHaveCount(1);
      await page
        .locator(".sidebar nav")
        .getByRole("button", { name: expectedNavigation, exact: true })
        .click();
      const destination = { seller: "catches", buyer: "bids", admin: "users" }[
        account.role
      ];
      await expect(page).toHaveURL(
        `${vite.url}/${account.role}/${destination}`,
      );
      await page.goBack();
      await expect(page).toHaveURL(`${vite.url}/${account.role}/dashboard`);
      await page.goForward();
      await expect(page).toHaveURL(
        `${vite.url}/${account.role}/${destination}`,
      );
      expect(errors).toEqual([]);
    });
  }

  test("demo controls are compact and touch-friendly, and stay off registration", async ({
    page,
  }, testInfo) => {
    await page.goto(`${vite.url}/`);
    const panel = page.getByRole("region", { name: "DEMO", exact: true });
    await expect(panel).toBeVisible();
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const boxes = [];
      for (const account of accounts)
        boxes.push(
          await panel
            .getByRole("button", { name: account.label, exact: true })
            .boundingBox(),
        );
      for (const box of boxes) {
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.y).toBeCloseTo(boxes[0].y, 0);
        expect(box.width).toBeCloseTo(boxes[0].width, 0);
      }
      expect((await panel.boundingBox()).y).toBeGreaterThan(
        (await page.locator(".auth-registration").boundingBox()).y,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: testInfo.outputPath(`local-demo-${width}.png`),
        fullPage: true,
      });
    }
    await page
      .getByRole("button", { name: "Create account", exact: true })
      .click();
    await expect(panel).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Create your account" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(panel).toBeVisible();
  });

  for (const enabled of [false, "unavailable"]) {
    test(`demo controls are hidden when demo health is ${enabled}`, async ({
      page,
    }) => {
      await page.route("**/api/health", (route) =>
        route.fulfill({
          status: enabled === false ? 200 : 503,
          contentType: "application/json",
          body: JSON.stringify(
            enabled === false
              ? { status: "ok", demo: false }
              : { error: "Unavailable" },
          ),
        }),
      );
      await page.goto(`${vite.url}/`);
      await expect(
        page.getByRole("heading", { name: "Sign in to HarborX" }),
      ).toBeVisible();
      await expect(
        page.getByRole("region", { name: "DEMO", exact: true }),
      ).toHaveCount(0);
    });
  }
});
