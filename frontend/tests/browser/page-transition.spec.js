import { test, expect } from "@playwright/test";
import { DEMO_PASSWORD } from "../../../backend/src/seed.js";

async function observeTransitions(page) {
  await page.addInitScript(() => {
    window.pageAnimations = [];
    window.transitionFailures = [];
    window.nativeTransitions = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      const animation = animate.call(this, frames, options);
      if (options?.id === "hx-public-page-enter")
        window.pageAnimations.push({
          name: options.id,
          duration: animation.effect.getTiming().duration,
          easing: animation.effect.getTiming().easing,
        });
      return animation;
    };
    const original = document.startViewTransition?.bind(document);
    window.supportsRouteTransitions = Boolean(original);
    if (!original) return;
    document.startViewTransition = (...args) => {
      const transition = original(...args);
      window.nativeTransitions.push(transition);
      transition.ready
        .then(() => {
          window.pageAnimations.push(
            ...document
              .getAnimations()
              .map((animation) => ({
                name: animation.animationName || "",
                duration: animation.effect?.getTiming().duration,
                easing:
                  animation.effect?.getKeyframes()[0]?.easing ||
                  animation.effect?.getTiming().easing,
                pseudo: animation.effect?.pseudoElement,
              }))
              .filter((animation) => /pageEnter|pageExit/.test(animation.name)),
          );
        })
        .catch((error) => window.transitionFailures.push(error.name));
      return transition;
    };
  });
}
async function settled(page) {
  await page.evaluate(async () => {
    await Promise.allSettled(
      (window.nativeTransitions || []).map((transition) => transition.finished),
    );
    await Promise.allSettled(
      document
        .getAnimations()
        .filter(
          (animation) =>
            /pageEnter|pageExit/.test(animation.animationName || "") ||
            animation.id === "hx-public-page-enter",
        )
        .map((animation) => animation.finished),
    );
  });
}
async function content(page, path) {
  await expect.poll(() => new URL(page.url()).pathname).toBe(path);
  const heading =
    path === "/"
      ? page.locator("#public-main h1")
      : page.locator("#auth-heading");
  await expect(heading).toContainText(
    path === "/"
      ? "Connecting Sri Lanka’s"
      : path === "/login"
        ? "Sign in to HarborX"
        : "Create your account",
  );
  await expect(heading).toBeVisible();
  return heading;
}
async function homepageLink(page, label) {
  const menu = page.getByRole("button", { name: "Open menu", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page
    .locator(".hx-public header")
    .getByRole("link", { name: label, exact: true })
    .click();
}
async function changed(page, path, count) {
  const heading = await content(page, path);
  await expect(heading).toBeFocused();
  if (await page.evaluate(() => window.supportsRouteTransitions)) {
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            window.pageAnimations.filter((animation) =>
              /pageEnter|hx-public-page-enter/.test(animation.name),
            ).length,
        ),
      )
      .toBeGreaterThan(count);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await settled(page);
  return page.evaluate(
    () =>
      window.pageAnimations.filter((animation) =>
        /pageEnter|hx-public-page-enter/.test(animation.name),
      ).length,
  );
}

test("all six public route directions animate while preserving one live layout and normal history", async ({
  page,
}) => {
  await observeTransitions(page);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await content(page, "/");
  const index = await page.evaluate(() => {
    window.publicDocument = "same";
    return history.state.idx;
  });
  let animations = 0;
  await homepageLink(page, "Login");
  animations = await changed(page, "/login", animations);
  expect(await page.evaluate(() => history.state.idx)).toBe(index + 1);
  await expect(page.locator(".hx-public")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  animations = await changed(page, "/register", animations);
  await expect(page.locator(".auth-page")).toHaveCount(1);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  animations = await changed(page, "/login", animations);
  await page.goBack();
  animations = await changed(page, "/register", animations);
  await page.goBack();
  animations = await changed(page, "/login", animations);
  await page.goBack();
  animations = await changed(page, "/", animations);
  expect(await page.evaluate(() => history.state.idx)).toBe(index);
  await homepageLink(page, "Register");
  animations = await changed(page, "/register", animations);
  await page.goBack();
  animations = await changed(page, "/", animations);
  await page.goForward();
  await changed(page, "/register", animations);
  expect(await page.evaluate(() => window.publicDocument)).toBe("same");
  const captured = await page.evaluate(() => window.pageAnimations);
  if (await page.evaluate(() => window.supportsRouteTransitions)) {
    expect(captured.some((animation) => /pageExit/.test(animation.name))).toBe(
      true,
    );
    expect(
      captured.every(
        (animation) =>
          animation.duration === 400 &&
          animation.easing === "cubic-bezier(0.4, 0, 0.2, 1)",
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("forms remain usable after transitions, preserve shared state and keep the slideshow mounted", async ({
  page,
}) => {
  await observeTransitions(page);
  await page.goto("/");
  await content(page, "/");
  await homepageLink(page, "Login");
  await content(page, "/login");
  // No forced click: interaction must resume without any leftover snapshot layer.
  await page.getByLabel("Email address").click({ timeout: 1500 });
  await page.getByLabel("Email address").fill("transition@example.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill("SharedPassword2026!");
  await settled(page);
  expect(
    await page.getByLabel("Email address").evaluate((input) => {
      const rect = input.getBoundingClientRect();
      return (
        document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        ) === input
      );
    }),
  ).toBe(true);
  await page.evaluate(() => {
    window.retainedSlideshow = document.querySelector(".auth-slideshow");
  });
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await content(page, "/register");
  await expect(page.getByLabel("Email address")).toHaveValue(
    "transition@example.test",
  );
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue(
    "SharedPassword2026!",
  );
  expect(
    await page.evaluate(
      () =>
        window.retainedSlideshow === document.querySelector(".auth-slideshow"),
    ),
  ).toBe(true);
  await page.getByLabel("Full name").fill("Transition Test");
  await page.getByRole("radio", { name: /Seller/ }).click();
  await expect(page.getByLabel("Boat name / registration")).toBeVisible();
  await settled(page);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await content(page, "/login");
  expect(
    await page.evaluate(
      () =>
        window.retainedSlideshow === document.querySelector(".auth-slideshow"),
    ),
  ).toBe(true);
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "password",
  );
});

test("reduced motion keeps route changes and keyboard focus immediate without animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await observeTransitions(page);
  await page.goto("/");
  await content(page, "/");
  await homepageLink(page, "Login");
  await expect(await content(page, "/login")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Email address")).toBeFocused();
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(await content(page, "/register")).toBeFocused();
  expect(await page.evaluate(() => window.pageAnimations)).toEqual([]);
});

test("refresh during and after navigation restores the intended page with no stale transition", async ({
  page,
}) => {
  await observeTransitions(page);
  await page.goto("/");
  await content(page, "/");
  await homepageLink(page, "Login");
  await content(page, "/login");
  await page.reload();
  await content(page, "/login");
  await expect(page.getByLabel("Email address")).toBeEditable();
  expect(await page.evaluate(() => window.pageAnimations)).toEqual([]);
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await content(page, "/register");
  await settled(page);
  await page.reload();
  await content(page, "/register");
  await expect(page.getByLabel("Full name")).toBeEditable();
  expect(await page.evaluate(() => window.pageAnimations)).toEqual([]);
});

test("protected dashboard navigation and public hash links have no page transition", async ({
  page,
}) => {
  await observeTransitions(page);
  await page.goto("/");
  await content(page, "/");
  await homepageLink(page, "Services");
  await expect(page).toHaveURL(/#services$/);
  expect(await page.evaluate(() => window.pageAnimations)).toEqual([]);
  await homepageLink(page, "Login");
  await content(page, "/login");
  await settled(page);
  await page.evaluate(() => {
    window.pageAnimations = [];
  });
  await page.getByLabel("Email address").fill("seller@harborx.demo");
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL("/seller/dashboard");
  await expect(page.locator("#main-content h1")).toHaveText("Catch overview");
  const menu = page.getByRole("button", { name: "Open menu", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page
    .locator(".sidebar nav")
    .getByRole("button", { name: "My catches", exact: true })
    .click();
  await expect(page).toHaveURL("/seller/catches");
  await expect(page.locator("#main-content h1")).toHaveText("My catches");
  expect(await page.evaluate(() => window.pageAnimations)).toEqual([]);
});

test("browsers without the snapshot API still navigate normally and focus the form", async ({
  page,
}) => {
  await page.addInitScript(() => {
    document.startViewTransition = undefined;
  });
  await page.goto("/");
  await content(page, "/");
  await homepageLink(page, "Login");
  await expect(await content(page, "/login")).toBeFocused();
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(await content(page, "/register")).toBeFocused();
});
