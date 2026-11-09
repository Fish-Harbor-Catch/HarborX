import { test, expect } from "@playwright/test";
import { DEMO_PASSWORD } from "../../../backend/src/seed.js";

async function freezeClock(page) {
  await page.clock.install({ time: new Date("2026-11-09T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-11-09T00:00:01Z"));
  await page.addInitScript(() => {
    const originalSet = window.setTimeout;
    const originalClear = window.clearTimeout;
    window.slideshowTimers = { pending: new Set(), fired: 0 };
    window.setTimeout = function (callback, delay, ...args) {
      if (delay !== 4000) return originalSet(callback, delay, ...args);
      const id = originalSet(() => {
        window.slideshowTimers.pending.delete(id);
        window.slideshowTimers.fired++;
        callback(...args);
      }, delay);
      window.slideshowTimers.pending.add(id);
      return id;
    };
    window.clearTimeout = function (id) {
      window.slideshowTimers.pending.delete(id);
      return originalClear(id);
    };
  });
}

async function ready(page) {
  await page.goto("/");
  await expect(page.locator(".auth-slideshow img")).toHaveCount(6);
  await expect
    .poll(() =>
      page
        .locator(".auth-slideshow img")
        .evaluateAll((images) =>
          images.every((image) => image.complete && image.naturalWidth > 0),
        ),
    )
    .toBe(true);
}
async function current(page, index) {
  await expect(page.locator(".auth-slideshow img").nth(index)).toHaveClass(
    "is-current",
  );
}

test("supplied photographs preload and crossfade in order through repeated loops", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("status of 401"))
      errors.push(message.text());
  });
  await freezeClock(page);
  await ready(page);
  const images = page.locator(".auth-slideshow img");
  for (const [index, filename] of [
    "beautiful-group-fish-undersea",
    "fish_1_cropped",
    "fish_3_cropped",
    "fish_5_cropped",
    "fish_6_cropped",
    "fish_7_cropped",
  ].entries()) {
    await expect(images.nth(index)).toHaveAttribute(
      "src",
      new RegExp(filename),
    );
    await expect(images.nth(index)).toHaveCSS("object-fit", "cover");
    await expect(images.nth(index)).toHaveCSS("transition-duration", "2s");
  }
  await current(page, 0);
  await expect(images.first()).toHaveCSS("opacity", "1");
  await expect
    .poll(() => page.evaluate(() => window.slideshowTimers.pending.size))
    .toBe(1);
  await page.clock.runFor(3999);
  await current(page, 0);
  await page.clock.runFor(1);
  await current(page, 1);
  // Both layers fade together; additive compositing keeps their combined
  // opacity at 1 so the panel never reveals a blank background.
  await expect(images.nth(0)).toHaveClass("is-previous");
  await expect(page.locator(".auth-slideshow")).toHaveCSS(
    "isolation",
    "isolate",
  );
  await expect(images.nth(0)).toHaveCSS("mix-blend-mode", "plus-lighter");
  await expect
    .poll(
      () =>
        images.evaluateAll((layers) => {
          const outgoing = Number(getComputedStyle(layers[0]).opacity);
          const incoming = Number(getComputedStyle(layers[1]).opacity);
          return (
            incoming > 0.25 &&
            incoming < 0.75 &&
            outgoing > 0.25 &&
            outgoing < 0.75 &&
            Math.abs(incoming + outgoing - 1) < 0.02
          );
        }),
      { intervals: [50] },
    )
    .toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("slideshow-crossfade.png"),
  });
  for (const next of [2, 3, 4, 5, 0, 1, 2, 3, 4, 5, 0]) {
    await page.clock.runFor(4000);
    await current(page, next);
    await expect(images.nth((next + 5) % 6)).toHaveClass("is-previous");
  }
  expect(errors).toEqual([]);
});

test("reduced motion keeps the first photograph and responds to preference changes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await freezeClock(page);
  await ready(page);
  await page.clock.runFor(30000);
  await current(page, 0);
  await expect(page.locator(".auth-slideshow img").first()).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect
    .poll(() => page.evaluate(() => window.slideshowTimers.pending.size))
    .toBe(1);
  await page.clock.runFor(4000);
  await current(page, 1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await current(page, 0);
  await page.clock.runFor(30000);
  await current(page, 0);
});

test("hidden-tab notification pauses advancement and visibility resumes it", async ({
  page,
}) => {
  await freezeClock(page);
  await ready(page);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect
    .poll(() => page.evaluate(() => window.slideshowTimers.pending.size))
    .toBe(0);
  await page.clock.runFor(30000);
  await current(page, 0);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect
    .poll(() => page.evaluate(() => window.slideshowTimers.pending.size))
    .toBe(1);
  await page.clock.runFor(4000);
  await current(page, 1);
});

test("signing in unmounts the slideshow and clears its timer", async ({
  page,
}) => {
  await freezeClock(page);
  await ready(page);
  await expect
    .poll(() => page.evaluate(() => window.slideshowTimers.pending.size))
    .toBe(1);
  await page.getByLabel("Email address").fill("seller@harborx.demo");
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator("#main-content h1")).toBeVisible();
  await expect(page.locator(".auth-slideshow")).toHaveCount(0);
  expect(await page.evaluate(() => window.slideshowTimers.pending.size)).toBe(
    0,
  );
  const fired = await page.evaluate(() => window.slideshowTimers.fired);
  await page.clock.runFor(30000);
  expect(await page.evaluate(() => window.slideshowTimers.fired)).toBe(fired);
});
