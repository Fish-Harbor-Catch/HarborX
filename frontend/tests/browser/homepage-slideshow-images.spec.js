import { test, expect } from "@playwright/test";

const filenames = [
  "matara-harbor",
  "arugam-coast",
  "fresh-catch",
  "negombo-fish-market-tour",
  "negombo-fish-market-wet",
  "pexels-dimitri-dim-380720-1802183",
  "pexels-roman-odintsov-6534202",
];

test("hero retains its original order, loads all seven photos and preserves playback controls", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await page.goto("/");
  const slides = page.locator(".hx-public .hero-slide");
  const active = page.locator(".hx-public .hero-slide.is-active");
  await expect(slides).toHaveCount(7);
  await expect(page.getByRole("button", { name: /^Show photo/ })).toHaveCount(
    7,
  );
  for (let i = 0; i < filenames.length; i++) {
    await expect(slides.nth(i)).toHaveAttribute(
      "src",
      new RegExp(filenames[i]),
    );
    await expect
      .poll(() =>
        slides
          .nth(i)
          .evaluate((image) => image.complete && image.naturalWidth > 0),
      )
      .toBe(true);
    expect(
      await slides.nth(i).evaluate((image) => {
        const css = getComputedStyle(image);
        return [
          css.objectFit,
          css.transitionDuration,
          css.transitionTimingFunction,
        ];
      }),
    ).toEqual(["cover", "2s", "ease-in-out"]);
  }
  const overlay = await page
    .locator(".hero-shade")
    .evaluate((element) => getComputedStyle(element).backgroundImage);
  expect(overlay).toContain("rgba(6, 28, 43, 0.4)");
  expect(overlay).toContain("rgba(5, 29, 39, 0.8)");
  await page.clock.runFor(3999);
  await expect(active).toHaveAttribute("data-slide", "0");
  await page.clock.runFor(1);
  await expect(active).toHaveAttribute("data-slide", "1");
  for (let step = 2; step <= 14; step++) {
    await page.clock.runFor(4000);
    await expect(active).toHaveAttribute("data-slide", String(step % 7));
  }
  await page
    .getByRole("button", { name: "Pause slideshow", exact: true })
    .click();
  await page.clock.runFor(8000);
  await expect(active).toHaveAttribute("data-slide", "0");
  for (let i = 3; i < 7; i++) {
    await page
      .getByRole("button", { name: `Show photo ${i + 1}`, exact: true })
      .click();
    await page.clock.runFor(2100);
    await expect(active).toHaveAttribute("data-slide", String(i));
    await expect(page.locator("#public-main h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page
    .getByRole("button", { name: "Play slideshow", exact: true })
    .click();
  await page.clock.runFor(4000);
  await expect(active).toHaveAttribute("data-slide", "0");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(8000);
  await expect(active).toHaveAttribute("data-slide", "0");
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(4000);
  await expect(active).toHaveAttribute("data-slide", "1");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.getByRole("button", { name: "Slideshow paused for reduced motion" }),
  ).toBeDisabled();
  await page.clock.runFor(8000);
  await expect(active).toHaveAttribute("data-slide", "1");
  // Capture the final visible photographs with motion disabled, independently
  // of the virtual timer checks above.
  for (let i = 3; i < 7; i++) {
    await page
      .getByRole("button", { name: `Show photo ${i + 1}`, exact: true })
      .click();
    await expect(active).toHaveAttribute("data-slide", String(i));
    await expect(active).toHaveCSS("opacity", "1");
    await page.screenshot({
      path: testInfo.outputPath(`hero-photo-${i + 1}.png`),
      animations: "disabled",
    });
  }
  expect(errors).toEqual([]);
});
