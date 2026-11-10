import { test, expect } from "@playwright/test";
import { DEMO_PASSWORD } from "../../../backend/src/seed.js";
import { startDevServer } from "./dev-server.js";

async function home(page) {
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("#public-main h1")).toContainText(
    "Connecting Sri Lanka’s",
  );
}
async function headerLink(page, label) {
  const menu = page.getByRole("button", { name: "Open menu", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page
    .locator(".hx-public header")
    .getByRole("link", { name: label, exact: true })
    .click();
}

test("homepage, existing auth pages and Back/Forward use the same router and styles stay scoped", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await home(page);
  await page.evaluate(() => {
    window.homeDocument = "same-document";
  });
  await headerLink(page, "Login");
  await expect(page).toHaveURL("/login");
  await expect(
    page.getByRole("heading", { name: "Sign in to HarborX", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.locator(".hx-public")).toHaveCount(0);
  const authStyle = await page.locator("form .btn.primary").evaluate((el) => ({
    color: getComputedStyle(el).backgroundColor,
    height: getComputedStyle(el).minHeight,
  }));
  await page.goBack();
  await home(page);
  await page.goForward();
  await expect(page).toHaveURL("/login");
  expect(
    await page.locator("form .btn.primary").evaluate((el) => ({
      color: getComputedStyle(el).backgroundColor,
      height: getComputedStyle(el).minHeight,
    })),
  ).toEqual(authStyle);
  await page.goBack();
  await home(page);
  await headerLink(page, "Register");
  await expect(page).toHaveURL("/register");
  await expect(page.getByLabel("Email address")).toBeVisible();
  await expect(page.getByRole("radio", { name: /Seller/ })).toBeVisible();
  await page.getByRole("radio", { name: /Seller/ }).click();
  await expect(page.getByLabel("Boat name / registration")).toBeVisible();
  expect(await page.evaluate(() => window.homeDocument)).toBe("same-document");
  expect(errors).toEqual([]);
});

for (const [role, heading] of [
  ["seller", "Catch overview"],
  ["buyer", "Auction overview"],
  ["admin", "Harbor operations"],
]) {
  test(`${role} authenticates through the original form, can visit Home and reaches the existing auctions`, async ({
    page,
  }) => {
    await page.goto("/");
    await home(page);
    await headerLink(page, "Login");
    await page.getByLabel("Email address").fill(`${role}@harborx.demo`);
    await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(`/${role}/dashboard`);
    await expect(page.locator("#main-content h1")).toHaveText(heading);
    await page.goBack();
    await home(page);
    await page.reload();
    await home(page);
    await page
      .getByRole("link", { name: "Go to marketplace", exact: false })
      .click();
    await expect(page).toHaveURL(`/${role}/auctions`);
    await expect(page.locator("#main-content h1")).toHaveText("Auctions");
    await page.goBack();
    await home(page);
  });
}

test("homepage imagery, section links, mobile layout and existing language preference work", async ({
  page,
}) => {
  await page.goto("/");
  await home(page);
  for (const img of await page.locator(".hx-public img").all())
    await img.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator(".hx-public img")
        .evaluateAll((images) =>
          images.every((image) => image.complete && image.naturalWidth > 0),
        ),
    )
    .toBe(true);
  for (const [label, id] of [
    ["Services", "services"],
    ["About Us", "about"],
    ["How It Works", "how-it-works"],
    ["Contact Us", "contact"],
  ]) {
    await headerLink(page, label);
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toBeInViewport();
    if (page.viewportSize().width <= 1100)
      await expect(page.locator(".navigation")).not.toHaveClass(/is-open/);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByLabel("Website language").selectOption("ta");
  await expect(page.locator("#public-main h1")).toContainText("இலங்கையின்");
  await page.locator(".hx-public header").scrollIntoViewIfNeeded();
  const menu = page.getByRole("button", { name: "Open menu", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page
    .locator(".hx-public header")
    .getByRole("link", { name: "உள்நுழைக", exact: true })
    .click();
  await expect(page).toHaveURL("/login");
  expect(await page.evaluate(() => localStorage.getItem("harborx_lang"))).toBe(
    "ta",
  );
  await expect(page.getByLabel("Email address")).toHaveCount(0); // Existing form uses its existing Tamil labels.
  await expect(page.locator(".auth-form")).toBeVisible();
});

test("public slideshow retains four-second timing, two-second fade and reduced motion", async ({
  page,
}) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date());
  await page.goto("/");
  await home(page);
  await expect(
    page.locator(".hx-public .hero-slide.is-active"),
  ).toHaveAttribute("data-slide", "0");
  expect(
    await page
      .locator(".hx-public .hero-slide")
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("2s");
  await page.clock.runFor(3999);
  await expect(
    page.locator(".hx-public .hero-slide.is-active"),
  ).toHaveAttribute("data-slide", "0");
  await page.clock.runFor(1);
  await expect(
    page.locator(".hx-public .hero-slide.is-active"),
  ).toHaveAttribute("data-slide", "1");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.getByRole("button", { name: "Slideshow paused for reduced motion" }),
  ).toBeDisabled();
  await page.clock.runFor(8000);
  await expect(
    page.locator(".hx-public .hero-slide.is-active"),
  ).toHaveAttribute("data-slide", "1");
});

test("Vite development serves the homepage and routes to the existing authentication form", async ({
  page,
}) => {
  const vite = await startDevServer();
  try {
    await page.goto(vite.url);
    await home(page);
    await headerLink(page, "Login");
    await expect(page).toHaveURL(`${vite.url}/login`);
    await expect(page.getByLabel("Email address")).toBeVisible();
  } finally {
    await vite.close();
  }
});
