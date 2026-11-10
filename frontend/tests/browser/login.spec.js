import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { DEMO_PASSWORD } from "../../../backend/src/seed.js";

function diagnostics(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    // The existing session probe returns 401 before a user has signed in.
    if (
      message.type() === "error" &&
      !message.text().includes("status of 401")
    ) {
      errors.push(message.text());
    }
  });
  return errors;
}

test("login photograph and form adapt to desktop, tablet and small mobile", async ({
  page,
}, testInfo) => {
  const errors = diagnostics(page);
  for (const width of [1440, 900, 768, 375, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Sign in to HarborX" }),
    ).toBeVisible();
    await expect(
      page.getByText("Sri Lanka's Digital Fish Auction Platform.", {
        exact: true,
      }),
    ).toBeVisible();
    const photo = page.locator(".auth-photo img").first();
    await expect(photo).toBeVisible();
    expect(
      await photo.evaluate((img) => img.complete && img.naturalWidth > 0),
    ).toBe(true);
    await expect(photo).toHaveCSS("object-fit", "cover");
    const imageBox = await page.locator(".auth-photo").boundingBox();
    const panelBox = await page.locator(".auth-form-wrap").boundingBox();
    if (width > 1024) {
      expect(imageBox.width).toBeCloseTo(width / 2, 0);
      expect(imageBox.height).toBeGreaterThanOrEqual(900);
      expect(panelBox.x).toBeCloseTo(width / 2, 0);
    } else if (width <= 760) {
      expect(imageBox.height).toBeLessThanOrEqual(250);
      expect(panelBox.y).toBeGreaterThanOrEqual(imageBox.height);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(
      page.locator(".demo-box, .auth-story, .auth-form-wrap footer"),
    ).toHaveCount(0);
    for (const field of [
      page.getByLabel("Email address"),
      page.getByLabel("Password", { exact: true }),
    ]) {
      expect((await field.boundingBox()).height).toBeGreaterThanOrEqual(44);
    }
    await page.screenshot({
      path: testInfo.outputPath(`login-${width}.png`),
      fullPage: true,
    });
  }
  expect(errors).toEqual([]);
});

for (const role of ["seller", "buyer", "admin"]) {
  test(`${role} email login and session survive reload`, async ({ page }) => {
    const errors = diagnostics(page);
    await page.goto("/login");
    await page.getByLabel("Email address").fill(`${role}@harborx.demo`);
    await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
    const response = page.waitForResponse(
      (res) =>
        res.url().endsWith("/api/auth/login") &&
        res.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    const login = await response;
    expect(login.ok()).toBe(true);
    expect((await login.json()).user.role).toBe(role);
    await expect(page.locator("#main-content h1")).toBeVisible();
    await page.reload();
    await expect(page.locator("#main-content h1")).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("password visibility, required fields and login error handling", async ({
  page,
}) => {
  await page.goto("/login");
  const password = page.getByLabel("Password", { exact: true });
  await password.fill("incorrect-password");
  await page
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  await expect(password).toHaveAttribute("type", "text");
  await expect(password).toHaveValue("incorrect-password");
  await page
    .getByRole("button", { name: "Hide password", exact: true })
    .click();
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  expect(
    await page
      .getByLabel("Email address")
      .evaluate((input) => input.validity.valueMissing),
  ).toBe(true);
  await page.getByLabel("Email address").fill("seller@harborx.demo");
  const response = page.waitForResponse(
    (res) =>
      res.url().endsWith("/api/auth/login") &&
      res.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  const failed = await response;
  expect(failed.status()).toBe(401);
  await expect(page.locator(".toast")).toContainText(
    (await failed.json()).error,
  );
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeEnabled();
});

for (const role of ["buyer", "seller"]) {
  test(`${role} registration still submits to the existing API`, async ({
    page,
  }) => {
    const errors = diagnostics(page);
    await page.goto("/login");
    await page
      .getByRole("button", { name: "Create account", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Create your account" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(
      page.getByRole("heading", { name: "Sign in to HarborX" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Create account", exact: true })
      .click();
    await page.getByLabel("Full name").fill("Login Redesign Test");
    await page
      .getByRole("radio", { name: role === "seller" ? /Seller/ : /Buyer/ })
      .click();
    if (role === "seller")
      await page
        .getByLabel("Boat name / registration")
        .fill("Ocean Test LK-1234");
    await page
      .getByLabel("Email address")
      .fill(`login-${randomUUID()}@example.com`);
    await page
      .getByLabel("Password", { exact: true })
      .fill("LoginRedesign2026!");
    const response = page.waitForResponse(
      (res) =>
        res.url().endsWith("/api/auth/register") &&
        res.request().method() === "POST",
    );
    await page
      .locator("form")
      .getByRole("button", { name: "Create account", exact: true })
      .click();
    const registration = await response;
    expect(registration.ok()).toBe(true);
    expect((await registration.json()).user.role).toBe(role);
    await expect(page.locator("#main-content h1")).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("language selection translates login and persists after reload", async ({
  page,
}) => {
  await page.goto("/login");
  for (const [language, heading] of [
    ["தமிழ் (TAMIL)", "HarborX இல் உள்நுழையவும்"],
    ["සිංහල (SINHALA)", "HarborX වෙත පිවිසෙන්න"],
    ["English (ENGLISH)", "Sign in to HarborX"],
  ]) {
    await page.getByRole("button", { name: "Select display language" }).click();
    await page.getByRole("option", { name: language, exact: true }).click();
    await expect(
      page.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
  }
});

test("login photograph remains available on an offline reload", async ({
  page,
  context,
}) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Sign in to HarborX" }),
  ).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Sign in to HarborX" }),
  ).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Sign in to HarborX" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".auth-photo img")
        .first()
        .evaluate((img) => img.complete && img.naturalWidth > 0),
    )
    .toBe(true);
});
