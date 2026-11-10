import { test, expect } from "@playwright/test";

const email = (page) => page.getByLabel("Email address");
const password = (page) => page.getByLabel("Password", { exact: true });
const createAccount = (page) =>
  page.getByRole("button", { name: "Create account", exact: true });
const signIn = (page) =>
  page.getByRole("button", { name: "Sign in", exact: true });

test("switching pages retains credentials and role, masks passwords and updates URLs", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await email(page).fill("switch@example.com");
  await password(page).fill("SharedPassword2026!");
  await page
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  await createAccount(page).click();
  await expect(page).toHaveURL(/\/register$/);
  await expect(email(page)).toHaveValue("switch@example.com");
  await expect(password(page)).toHaveValue("SharedPassword2026!");
  await expect(password(page)).toHaveAttribute("type", "password");
  await expect(password(page)).toHaveAttribute("minlength", "12");
  await expect(password(page)).toHaveAttribute("autocomplete", "new-password");
  await expect(page.getByRole("radio", { name: /Buyer/ })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.getByRole("radio", { name: /Seller/ }).click();
  await page.getByLabel("Full name").fill("Temporary Name");
  await page
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  await signIn(page).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(password(page)).toHaveAttribute("type", "password");
  await expect(password(page)).toHaveAttribute("minlength", "1");
  await expect(password(page)).toHaveAttribute(
    "autocomplete",
    "current-password",
  );
  await expect(email(page)).toHaveValue("switch@example.com");
  await expect(password(page)).toHaveValue("SharedPassword2026!");
  await createAccount(page).click();
  await expect(page.getByRole("radio", { name: /Seller/ })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(page.getByLabel("Boat name / registration")).toBeVisible();
  await expect(page.getByLabel("Full name")).toHaveValue("");
  await expect(page).toHaveURL(/\/register$/);
});

for (const mode of ["login", "register"]) {
  test(`${mode} page preserves request payload, busy state, errors and retry`, async ({
    page,
  }) => {
    let release;
    const pending = new Promise((resolve) => {
      release = resolve;
    });
    const requests = [];
    await page.route(`**/api/auth/${mode}`, async (route) => {
      requests.push(route.request().postDataJSON());
      if (requests.length === 1) await pending;
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "Authentication test error" }),
      });
    });
    await page.goto("/");
    if (mode === "register") {
      await createAccount(page).click();
      await page.getByLabel("Full name").fill("Auth Test");
      await page.getByRole("radio", { name: /Seller/ }).click();
      await page
        .getByLabel("Boat name / registration")
        .fill("Ocean Test LK-1234");
      await page.getByLabel("Phone number").fill("0771234567");
    }
    await email(page).fill("auth-test@example.com");
    await password(page).fill("Authentication2026!");
    const submit = page.locator("form .btn.primary");
    await submit.click();
    await expect(
      page.getByRole("button", { name: "Please wait…", exact: true }),
    ).toBeDisabled();
    await expect(
      mode === "login" ? createAccount(page) : signIn(page),
    ).toBeDisabled();
    await expect.poll(() => requests.length).toBe(1);
    expect(requests[0]).toEqual({
      email: "auth-test@example.com",
      password: "Authentication2026!",
      ...(mode === "register"
        ? {
            name: "Auth Test",
            role: "seller",
            phone: "0771234567",
            boat_name: "Ocean Test LK-1234",
          }
        : {}),
    });
    release();
    await expect(page.locator(".toast.error")).toContainText(
      "Authentication test error",
    );
    await expect(submit).toBeEnabled();
    await submit.click();
    await expect.poll(() => requests.length).toBe(2);
  });
}

test("registration validates required fields and password length without sending requests", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (request) => {
    if (request.url().endsWith("/api/auth/register")) requests.push(request);
  });
  await page.goto("/");
  await createAccount(page).click();
  const submit = page
    .locator("form")
    .getByRole("button", { name: "Create account", exact: true });
  await submit.click();
  expect(
    await page
      .getByLabel("Full name")
      .evaluate((input) => input.validity.valueMissing),
  ).toBe(true);
  await page.getByLabel("Full name").fill("Auth Test");
  await email(page).fill("validation@example.com");
  await password(page).fill("too-short");
  await submit.click();
  expect(
    await password(page).evaluate((input) => input.validity.tooShort),
  ).toBe(true);
  expect(requests).toHaveLength(0);
  await expect(
    page.getByText(
      "Buyers need manager verification before placing bids. Admin accounts are created separately.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(2);
});

test("registration follows the selected language across page switches", async ({
  page,
}) => {
  await page.goto("/");
  await createAccount(page).click();
  for (const [language, registerHeading, loginHeading] of [
    ["தமிழ் (TA)", "உங்கள் கணக்கை உருவாக்கவும்", "HarborX இல் உள்நுழையவும்"],
    ["සිංහල (SI)", "ඔබේ ගිණුම සාදන්න", "HarborX වෙත පිවිසෙන්න"],
  ]) {
    await page.getByRole("button", { name: "Select display language" }).click();
    await page.getByRole("option", { name: language, exact: true }).click();
    await expect(page.locator("#auth-heading")).toHaveText(registerHeading);
    await page.locator(".auth-registration button").click();
    await expect(page.locator("#auth-heading")).toHaveText(loginHeading);
    await page.locator(".auth-registration button").click();
    await expect(page.locator("#auth-heading")).toHaveText(registerHeading);
  }
});
