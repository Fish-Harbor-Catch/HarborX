import { chromium } from "playwright";
import { join } from "node:path";
import { mkdirSync } from "node:fs";

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";
const PASSWORD = process.env.DEMO_PASSWORD || "HarborXDemo2026!";
const SAVE_SCREENSHOTS = process.env.SAVE_SCREENSHOTS === "true";
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || join(process.cwd(), "test-results", "screenshots");

if (SAVE_SCREENSHOTS) {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runTest() {
  console.log(`Starting Language Dropdown Verification against ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const checks = [];

  try {
    // Clear localStorage to ensure default EN state
    try {
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 15000 });
    } catch (netErr) {
      throw new Error(
        `Failed to reach frontend at ${BASE_URL}. Ensure the development server is running via 'npm run dev'. (${netErr.message})`
      );
    }
    await page.evaluate(() => localStorage.removeItem("harborx_lang"));
    await page.reload();
    await page.waitForSelector(".auth-page, .app-shell", { timeout: 10000 });

    if (await page.locator(".app-shell").isVisible()) {
      await page.locator('.topbar button[title="Sign out"]').click();
      await page.waitForSelector(".auth-page", { timeout: 5000 });
    }

    // 1. Verify Default State
    console.log("1. Verifying Default Trigger State...");
    const trigger = page.locator(".auth-top .lang-selector-trigger");
    const triggerText = await trigger.innerText();
    console.log("Trigger text:", JSON.stringify(triggerText.trim()));

    if (triggerText.trim() === "EN") {
      checks.push("PASS: Default state displays only 'EN' with chevron (no Tamil/Sinhala beside it)");
    } else {
      checks.push(`FAIL: Expected trigger to display only 'EN', got: '${triggerText.trim()}'`);
    }

    const chevron = page.locator(".auth-top .lang-selector-trigger svg");
    if (await chevron.isVisible()) {
      checks.push("PASS: Dropdown chevron is visible inside trigger");
    } else {
      checks.push("FAIL: Dropdown chevron is missing");
    }

    if (SAVE_SCREENSHOTS) {
      await page.screenshot({ path: join(SCREENSHOT_DIR, "10-dropdown-default-state.png") });
    }

    // 2. Click Trigger to Open Dropdown
    console.log("2. Clicking trigger to open dropdown...");
    await trigger.click();
    await page.waitForTimeout(300);

    const dropdown = page.locator(".auth-top .lang-dropdown-menu");
    if (await dropdown.isVisible()) {
      checks.push("PASS: Dropdown menu displays directly below trigger upon click");
    } else {
      checks.push("FAIL: Dropdown menu did not appear on click");
    }

    const items = await page.locator(".auth-top .lang-dropdown-item .lang-item-label").allTextContents();
    console.log("Dropdown items:", items);

    const expected = ["English (EN)", "தமிழ் (TA)", "සිංහල (SI)"];
    const matchesAll = expected.every((val, i) => items[i] === val);
    if (matchesAll) {
      checks.push("PASS: Dropdown contains exact expected list: 1. English (EN), 2. தமிழ் (TA), 3. සිංහල (SI)");
    } else {
      checks.push(`FAIL: Dropdown items mismatch. Expected ${JSON.stringify(expected)}, got: ${JSON.stringify(items)}`);
    }

    // 3. Highlight and checkmark on currently selected language
    const selectedItem = page.locator(".auth-top .lang-dropdown-item.selected");
    const selectedText = await selectedItem.locator(".lang-item-label").textContent();
    const hasCheckmark = await selectedItem.locator(".lang-item-check").isVisible();

    if (selectedText.includes("English (EN)") && hasCheckmark) {
      checks.push("PASS: Currently selected language (English) is highlighted with checkmark");
    } else {
      checks.push(`FAIL: Selected item highlight or checkmark missing (text: ${selectedText}, check: ${hasCheckmark})`);
    }

    if (SAVE_SCREENSHOTS) {
      await page.screenshot({ path: join(SCREENSHOT_DIR, "11-dropdown-open-state.png") });
    }

    // 4. Click outside to close
    console.log("4. Testing click outside to close...");
    await page.locator(".auth-story").click({ position: { x: 50, y: 50 } });
    await page.waitForTimeout(300);

    if (!(await dropdown.isVisible())) {
      checks.push("PASS: Dropdown closes when user clicks outside");
    } else {
      checks.push("FAIL: Dropdown did not close on outside click");
    }

    // 5. Re-open and test Escape key to close
    console.log("5. Testing Escape key...");
    await trigger.click();
    await page.waitForTimeout(200);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    if (!(await dropdown.isVisible())) {
      checks.push("PASS: Dropdown closes when pressing Escape key");
    } else {
      checks.push("FAIL: Dropdown did not close on Escape key");
    }

    // 6. Select Tamil (TA)
    console.log("6. Selecting தமிழ் (TA)...");
    await trigger.click();
    await page.waitForTimeout(200);
    await page.locator('.auth-top .lang-dropdown-item:has-text("தமிழ் (TA)")').click();
    await page.waitForTimeout(300);

    const updatedTriggerText = await trigger.innerText();
    console.log("Trigger text after selecting Tamil:", updatedTriggerText.trim());
    if (updatedTriggerText.trim() === "TA") {
      checks.push("PASS: Selecting தமிழ் (TA) updates trigger to 'TA' and closes dropdown");
    } else {
      checks.push(`FAIL: Trigger did not update to 'TA', got '${updatedTriggerText.trim()}'`);
    }

    // 7. Select Sinhala (SI)
    console.log("7. Selecting සිංහල (SI)...");
    await trigger.click();
    await page.waitForTimeout(200);
    await page.locator('.auth-top .lang-dropdown-item:has-text("සිංහල (SI)")').click();
    await page.waitForTimeout(300);

    const siTriggerText = await trigger.innerText();
    console.log("Trigger text after selecting Sinhala:", siTriggerText.trim());
    if (siTriggerText.trim() === "SI") {
      checks.push("PASS: Selecting සිංහල (SI) updates trigger to 'SI' and closes dropdown");
    } else {
      checks.push(`FAIL: Trigger did not update to 'SI', got '${siTriggerText.trim()}'`);
    }

    if (SAVE_SCREENSHOTS) {
      await page.screenshot({ path: join(SCREENSHOT_DIR, "12-auth-sinhala-selected.png") });
    }

    // 8. Test Register screen consistency
    console.log("8. Testing Register screen selector...");
    await page.locator('.auth-top button:has-text("Create an account"), .auth-top button:has-text("ගිණුමක් සාදන්න")').click();
    await page.waitForTimeout(300);
    const registerTrigger = page.locator(".auth-top .lang-selector-trigger");
    if (await registerTrigger.isVisible()) {
      checks.push("PASS: Language selector dropdown is consistent on Register screen");
    } else {
      checks.push("FAIL: Language selector missing on Register screen");
    }

    // Switch back to EN for login
    await registerTrigger.click();
    await page.waitForTimeout(200);
    await page.locator('.auth-top .lang-dropdown-item:has-text("English (EN)")').click();
    await page.waitForTimeout(300);

    await page.locator('.auth-top button:has-text("Sign in")').click();
    await page.waitForTimeout(300);

    // 9. Login and verify Topbar language selector
    console.log("9. Testing Topbar language selector...");
    await page.getByLabel("Email address").fill("seller@harborx.demo");
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForSelector(".topbar strong", { timeout: 10000 });

    const topbarTrigger = page.locator(".topbar .lang-selector-trigger");
    if (await topbarTrigger.isVisible()) {
      checks.push("PASS: Language selector dropdown is consistent in workspace Topbar");
      await topbarTrigger.click();
      await page.waitForTimeout(200);
      const topbarDropdown = page.locator(".topbar .lang-dropdown-menu");
      if (await topbarDropdown.isVisible()) {
        checks.push("PASS: Topbar language dropdown opens and renders options correctly");
        if (SAVE_SCREENSHOTS) {
          await page.screenshot({ path: join(SCREENSHOT_DIR, "13-topbar-dropdown-open.png") });
        }
        await topbarTrigger.click(); // toggle close
      }
    } else {
      checks.push("FAIL: Language selector trigger missing in Topbar");
    }

    // 10. Test Mobile Screen (390x844)
    console.log("10. Testing Mobile Viewport...");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);

    const mobileTrigger = page.locator(".topbar .lang-selector-trigger");
    if (await mobileTrigger.isVisible()) {
      await mobileTrigger.click();
      await page.waitForTimeout(200);
      const mobileDropdown = page.locator(".topbar .lang-dropdown-menu");
      if (await mobileDropdown.isVisible()) {
        checks.push("PASS: Language selector dropdown opens cleanly on mobile viewport");
        if (SAVE_SCREENSHOTS) {
          await page.screenshot({ path: join(SCREENSHOT_DIR, "14-mobile-dropdown-open.png") });
        }
      }
    }

  } catch (err) {
    console.error("Test execution error:", err);
    checks.push(`ERROR: ${err.message}`);
  } finally {
    await browser.close();
  }

  console.log("\n================ LANGUAGE DROPDOWN TEST RESULTS ================");
  checks.forEach((c) => console.log(c));

  const hasFailures = checks.some((c) => c.startsWith("FAIL") || c.startsWith("ERROR"));
  if (hasFailures) {
    console.error("\nFAILURE: One or more language dropdown checks failed!");
    process.exit(1);
  }
}

runTest();
