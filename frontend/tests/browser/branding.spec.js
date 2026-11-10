import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { DEMO_PASSWORD } from "../../../backend/src/seed.js";

async function logo(image, variant = "harborx-logo") {
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate((image) => image.complete && image.naturalWidth > 0),
    )
    .toBe(true);
  const dimensions = await image.evaluate((image) => {
    const bounds = image.getBoundingClientRect();
    return {
      width: bounds.width,
      height: bounds.height,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      source: image.currentSrc,
      alt: image.alt,
    };
  });
  const compact = variant === "icon";
  expect(dimensions.naturalWidth).toBe(compact ? 96 : 556);
  expect(dimensions.naturalHeight).toBe(compact ? 96 : 168);
  expect(dimensions.width / dimensions.height).toBeCloseTo(
    compact ? 1 : 556 / 168,
    2,
  );
  expect(dimensions.alt).toBe("HarborX");
  if (!compact)
    expect(dimensions.source).toMatch(new RegExp(`${variant}-[^/]+\\.svg$`));
}
async function noOverflow(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}

test("public and authentication surfaces use official full logos without changing navigation", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("#public-main h1")).toBeVisible();
    await logo(page.locator(".site-header .logo-wordmark"));
    await noOverflow(page);
    await page.screenshot({
      path: testInfo.outputPath(`homepage-${width}.png`),
      animations: "disabled",
    });
    await page.locator(".site-footer .brand").scrollIntoViewIfNeeded();
    await logo(
      page.locator(".site-footer .logo-wordmark"),
      "harborx-logo-dark-bg",
    );
    await page.screenshot({
      path: testInfo.outputPath(`footer-${width}.png`),
      animations: "disabled",
    });
    await page.locator(".site-footer .brand").click();
    await expect(page).toHaveURL(/\/$/);
    for (const path of ["/login", "/register"]) {
      await page.goto(path);
      await expect(page.locator("#auth-heading")).toBeVisible();
      await logo(page.locator(".auth-brand .logo-wordmark"));
      await noOverflow(page);
      await page.screenshot({
        path: testInfo.outputPath(`${path.slice(1)}-${width}.png`),
        animations: "disabled",
      });
    }
  }
  expect(errors).toEqual([]);
});

for (const role of ["seller", "buyer", "admin"]) {
  test(`${role} sidebar uses the official dark wordmark and compact icon`, async ({
    page,
  }, testInfo) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill(`${role}@harborx.demo`);
    await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.locator("#main-content h1")).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 900 });
    await logo(page.locator(".sidebar .logo-wordmark"), "harborx-logo-dark-bg");
    await page.screenshot({
      path: testInfo.outputPath(`${role}-expanded.png`),
      animations: "disabled",
    });
    await page
      .getByRole("button", { name: "Collapse sidebar navigation", exact: true })
      .click();
    await logo(page.locator(".sidebar .logo-symbol"), "icon");
    await page
      .getByRole("button", { name: "Expand sidebar navigation", exact: true })
      .click();
    await page.setViewportSize({ width: 768, height: 900 });
    await logo(page.locator(".sidebar .logo-symbol"), "icon");
    await expect(page.locator(".sidebar .logo-wordmark")).toBeHidden();
    await page.screenshot({
      path: testInfo.outputPath(`${role}-tablet.png`),
      animations: "disabled",
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    await logo(page.locator(".sidebar .logo-wordmark"), "harborx-logo-dark-bg");
    await page.screenshot({
      path: testInfo.outputPath(`${role}-mobile.png`),
      animations: "disabled",
    });
    await noOverflow(page);
  });
}

test("favicon and install icons derive from the official source and retain existing manifest URLs", async ({
  page,
}) => {
  await page.goto("/");
  const iconSource = await readFile(
    new URL("../../src/harborx-icon.svg", import.meta.url),
    "utf8",
  );
  const href = await page.locator('link[rel="icon"]').getAttribute("href");
  expect(href).toBe("/favicon.svg");
  const favicon = await page.request.get(href);
  expect(favicon.ok()).toBe(true);
  expect(await favicon.text()).toBe(iconSource);
  const manifest = await (
    await page.request.get("/manifest.webmanifest")
  ).json();
  expect(manifest.id).toBe("/");
  expect(manifest.scope).toBe("/");
  for (const icon of manifest.icons) {
    const response = await page.request.get(icon.src);
    expect(response.ok()).toBe(true);
    const image = await sharp(await response.body()).metadata();
    expect(`${image.width}x${image.height}`).toBe(icon.sizes);
    expect(image.format).toBe("png");
  }
  const appleHref = await page
    .locator('link[rel="apple-touch-icon"]')
    .getAttribute("href");
  const apple = await sharp(
    await (await page.request.get(appleHref)).body(),
  ).metadata();
  expect([apple.width, apple.height]).toEqual([180, 180]);
});
