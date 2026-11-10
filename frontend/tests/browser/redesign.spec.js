import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { DEMO_PASSWORD } from "../../../backend/src/seed.js";

async function navigate(page, name) {
  if (page.viewportSize().width <= 760) {
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
  }
  await page
    .locator(".sidebar nav")
    .getByRole("button", { name, exact: true })
    .click();
}

for (const width of [375, 768, 1440]) {
  for (const role of ["seller", "buyer", "admin"]) {
    test(`${role} operational workspace at ${width}px`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      const pageErrors = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      await page.goto("/login");
      await expect(
        page.getByRole("heading", { name: "Sign in to HarborX" }),
      ).toBeVisible();
      await page.getByLabel("Email address").fill(`${role}@harborx.demo`);
      await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      await expect(page.locator("#main-content h1")).toBeVisible();
      await expect(page.locator(".demo-ribbon")).toContainText(
        "Sample environment",
      );
      await expect(page.locator(".hero-banner")).toHaveCount(0);
      await page.screenshot({
        path: testInfo.outputPath(`${role}-overview-${width}.png`),
        fullPage: true,
      });

      const pages =
        role === "seller"
          ? ["My catches", "Auctions", "Payments"]
          : role === "buyer"
            ? ["Auctions", "My bids", "Won lots", "Payments"]
            : ["Auctions", "User management", "Payments", "Reports"];
      for (const name of pages) {
        await navigate(page, name);
        await expect(page.locator("#main-content h1")).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          name,
        ).toBe(true);
      }

      if (role === "seller") {
        await navigate(page, "My catches");
        const { user } = await (await page.request.get("/api/auth/me")).json();
        const { lots } = await (await page.request.get("/api/lots")).json();
        await expect(page.locator(".lot-card")).toHaveCount(
          lots.filter((lot) => lot.seller_id === user.id).length,
        );
        await page.locator(".search-box input").fill("no-matching-catch-qa");
        await expect(page.locator(".lot-card")).toHaveCount(0);
        await page
          .getByRole("button", { name: "Clear filters", exact: true })
          .click();
        await expect(page.locator(".lot-card").first()).toBeVisible();
        await page
          .getByRole("button", { name: "Register catch", exact: true })
          .click();
        await expect(page.locator(".catch-form")).toBeVisible();
        const box = await page.getByRole("dialog").boundingBox();
        expect(box.width).toBeLessThanOrEqual(width);
        await page.keyboard.press("Escape");
      } else {
        await navigate(page, "Auctions");
        await page
          .locator(".lot-card")
          .filter({ hasText: "Live auction" })
          .first()
          .getByRole("button")
          .first()
          .click();
        await expect(page.getByRole("dialog")).toBeVisible();
        if (role === "buyer")
          await expect(
            page.getByRole("button", { name: "Place bid", exact: true }),
          ).toBeVisible();
        else
          await expect(
            page.getByRole("heading", { name: "Auction manager controls" }),
          ).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        await page.keyboard.press("Escape");
      }
      await page.screenshot({
        path: testInfo.outputPath(`${role}-workspace-${width}.png`),
        fullPage: true,
      });
      expect(pageErrors).toEqual([]);
    });
  }
}

async function login(page, role) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(`${role}@harborx.demo`);
  await page.getByLabel("Password", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator("#main-content h1")).toBeVisible();
}
const go = navigate;
const response = (page, path, method) =>
  page.waitForResponse(
    (r) => r.url().endsWith(path) && r.request().method() === method,
  );

test("online seller to admin to buyer auction and payment workflow", async ({
  browser,
}) => {
  const contexts = [];
  try {
    const pages = {};
    for (const role of ["seller", "admin", "buyer"]) {
      const c = await browser.newContext({
        baseURL: "http://127.0.0.1:4173",
        viewport: { width: 1440, height: 900 },
      });
      contexts.push(c);
      pages[role] = await c.newPage();
      await login(pages[role], role);
    }
    const { seller, admin, buyer } = pages;
    await go(seller, "My catches");
    const marker = "QA-FLOW-" + randomUUID().slice(0, 8);
    await seller
      .getByRole("button", { name: "Register catch", exact: true })
      .click();
    await seller.locator("[name=weight]").fill("25");
    await seller.locator("[name=base_price]").fill("1000");
    await seller.locator("[name=boat_name]").fill(marker);
    const created = response(seller, "/api/lots", "POST");
    await seller
      .getByRole("button", { name: "Submit catch", exact: true })
      .click();
    const lot = (await (await created).json()).lot;
    await admin.reload();
    await go(admin, "Auctions");
    await admin
      .locator(".lot-card")
      .filter({ hasText: marker })
      .getByRole("button", { name: "View lot", exact: true })
      .click();
    await admin
      .getByRole("button", { name: "Approve & publish", exact: true })
      .click();
    await expect(
      admin.getByRole("button", { name: "Start round 1", exact: true }),
    ).toBeVisible();
    await admin
      .getByRole("button", { name: "Start round 1", exact: true })
      .click();
    await expect(
      admin.getByRole("button", { name: "End current round", exact: true }),
    ).toBeVisible();
    await buyer.reload();
    await go(buyer, "Auctions");
    await buyer
      .locator(".lot-card")
      .filter({ hasText: marker })
      .getByRole("button", { name: "View lot", exact: true })
      .click();
    await buyer.getByLabel("Your bid amount").fill("1000");
    const accepted = response(buyer, `/api/lots/${lot.id}/bids`, "POST");
    await buyer.getByRole("button", { name: "Place bid", exact: true }).click();
    expect((await accepted).status()).toBe(201);
    await expect(
      buyer.getByText("Your bid was accepted.", { exact: true }),
    ).toBeVisible();
    await admin
      .getByRole("button", { name: "Verify arrival", exact: true })
      .click();
    await admin.getByRole("button", { name: "Confirm", exact: true }).click();
    await expect(
      admin.getByRole("button", { name: "Verify arrival", exact: true }),
    ).toHaveCount(0);
    await admin
      .getByRole("button", { name: "End current round", exact: true })
      .click();
    await admin.getByRole("button", { name: "Confirm", exact: true }).click();
    await expect(
      admin.getByRole("button", { name: "Finalize auction", exact: true }),
    ).toBeVisible();
    await admin
      .getByRole("button", { name: "Finalize auction", exact: true })
      .click();
    await admin.getByRole("button", { name: "Confirm", exact: true }).click();
    await admin
      .locator(".detail-tabs")
      .getByRole("button", { name: "Payments", exact: true })
      .click();
    await admin.locator(".payment-form [name=amount]").fill("25000");
    await admin.locator(".payment-form [name=reference]").fill("QA-UI-PAID");
    const paid = response(admin, `/api/lots/${lot.id}/payments`, "POST");
    await admin
      .getByRole("button", { name: "Record payment", exact: true })
      .click();
    expect((await paid).status()).toBe(201);
    await expect(admin.getByText("QA-UI-PAID", { exact: true })).toBeVisible();
    const result = (
      await (await admin.request.get(`/api/lots/${lot.id}`)).json()
    ).lot;
    expect(result.payment_status).toBe("Paid");
    expect(result.balance).toBe(0);
    const me = (await (await buyer.request.get("/api/auth/me")).json()).user;
    expect(result.winner_id).toBe(me.id);
  } finally {
    for (const c of contexts) await c.close();
  }
});
