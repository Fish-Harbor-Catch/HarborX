import { test, expect } from "@playwright/test";
import { writeFile } from "node:fs/promises";

async function ready(page) {
  await page.goto("/");
  await expect(page.locator("#public-main h1")).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".hero-slide")
        .first()
        .evaluate((image) => image.complete && image.naturalWidth > 0),
    )
    .toBe(true);
  // Keep the existing arrival animation out of foreground-position measurements.
  await page.locator(".hero-copy").evaluate(async (element) => {
    await Promise.allSettled(
      element.getAnimations().map((animation) => animation.finished),
    );
  });
}
async function frame(page) {
  return page.evaluate(() => {
    const rect = (selector) => {
      const r = document.querySelector(selector).getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, height: r.height };
    };
    return {
      image: rect(".hero-images"),
      shade: rect(".hero-shade"),
      hero: rect(".hero"),
      title: rect("#public-main h1"),
      header: rect(".site-header"),
      scroll: scrollY,
    };
  });
}
async function scrollTo(page, y) {
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: "instant" }),
    y,
  );
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(y, 0);
}

test("hero separates fixed desktop photography from flowing content and clips later sections", async ({
  page,
}, testInfo) => {
  const errors = [];
  const consoleErrors = [];
  const guestProbes = new Set();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (
      response.status() === 401 &&
      new URL(response.url()).pathname === "/api/auth/me"
    )
      guestProbes.add(response.url());
  });
  page.on("console", (message) => {
    if (message.type() === "error")
      consoleErrors.push({ text: message.text(), url: message.location().url });
  });
  await ready(page);
  const desktop = await page.evaluate(
    () =>
      matchMedia(
        "(min-width: 1025px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      ).matches,
  );
  const before = await frame(page);
  await page.screenshot({
    path: testInfo.outputPath("hero-before-scroll.png"),
  });
  await scrollTo(page, 240);
  const after = await frame(page);
  const delta = after.scroll - before.scroll;
  expect(after.title.top - before.title.top).toBeCloseTo(-delta, 0);
  expect(after.image.top - before.image.top).toBeCloseTo(
    desktop ? 0 : -delta,
    0,
  );
  expect(after.shade.top - before.shade.top).toBeCloseTo(
    desktop ? 0 : -delta,
    0,
  );
  expect(after.header.top).toBeCloseTo(0, 0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("hero-after-scroll.png") });
  const measurements = testInfo.outputPath("scroll-measurements.json");
  await writeFile(
    measurements,
    JSON.stringify({ desktop, before, after }, null, 2),
  );
  await testInfo.attach("scroll-measurements", {
    path: measurements,
    contentType: "application/json",
  });

  await scrollTo(page, Math.ceil(before.hero.bottom + 100));
  await expect(page.locator(".intro-section")).toBeVisible();
  expect(
    await page.evaluate(() => {
      const hit = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
      return !hit?.closest(".hero-images, .hero-shade, .hero");
    }),
  ).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("following-section.png") });
  const menu = page.getByRole("button", { name: "Open menu", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page
    .locator(".hx-public header")
    .getByRole("link", { name: "Login", exact: true })
    .click();
  await expect(page).toHaveURL("/login");
  await expect(page.locator("#auth-heading")).toContainText(
    "Sign in to HarborX",
  );
  await page.goBack();
  await expect(page.locator("#public-main h1")).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL("/login");
  await expect(page.locator("#auth-heading")).toBeVisible();
  expect(errors).toEqual([]);
  // Guest session restoration legitimately receives 401 from the existing API.
  // Only allow the browser diagnostic for that observed response, not other errors.
  expect(
    consoleErrors.filter(
      (message) =>
        !guestProbes.has(message.url) ||
        !message.text.includes("status of 401"),
    ),
  ).toEqual([]);
});

test("reduced motion retains normal background scrolling and accessible controls", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  const before = await frame(page);
  await scrollTo(page, 200);
  const after = await frame(page);
  expect(after.image.top - before.image.top).toBeCloseTo(-200, 0);
  expect(after.shade.top - before.shade.top).toBeCloseTo(-200, 0);
  await expect(
    page.getByRole("button", { name: "Slideshow paused for reduced motion" }),
  ).toBeDisabled();
  await scrollTo(page, 0);
  await expect(
    page.getByRole("link", { name: "Join our community", exact: true }),
  ).toBeVisible();
});
