import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "HarborXDemo2026!";

async function run() {
  console.log(`Starting Global Localization E2E Verification against ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const checks = [];

  page.on("pageerror", (err) => {
    console.error("Browser page error:", err);
  });

  try {
    // 1. Visit App
    console.log("1. Visiting frontend...");
    try {
      await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 15000 });
    } catch (netErr) {
      throw new Error(
        `Failed to reach frontend at ${BASE_URL}. Ensure the development server is running via 'npm run dev'. (${netErr.message})`
      );
    }

    // Reset language to default en
    await page.evaluate(() => localStorage.removeItem("harborx_lang"));
    await page.reload();
    await page.waitForSelector(".auth-page, .app-shell", { timeout: 10000 });

    if (await page.locator(".app-shell").isVisible()) {
      await page.locator('.topbar button[title="Sign out"], .topbar button[aria-label="Sign out"]').click();
      await page.waitForSelector(".auth-page", { timeout: 5000 });
    }

    // Verify initial EN selector
    const langBtn = page.locator(".auth-top .lang-selector-trigger").first();
    await langBtn.waitFor({ state: "visible" });
    const initialText = await langBtn.innerText();
    console.log(`   Initial Language Button Text: "${initialText.trim()}"`);
    if (initialText.includes("EN")) {
      checks.push("PASS: Initial auth language selector displays 'EN'");
    } else {
      checks.push(`FAIL: Expected EN button, got: ${initialText}`);
    }

    // Verify initial EN title
    const authEyebrow = await page.locator(".auth-form .eyebrow").innerText();
    console.log(`   Auth Eyebrow (EN): "${authEyebrow}"`);
    if (authEyebrow.includes("WELCOME TO HARBORX")) {
      checks.push("PASS: Auth screen renders English eyebrow 'WELCOME TO HARBORX'");
    } else {
      checks.push(`FAIL: Expected 'WELCOME TO HARBORX', got: ${authEyebrow}`);
    }

    // 2. Switch to Tamil (TA)
    console.log("2. Switching to Tamil (TA)...");
    await langBtn.click();
    await page.locator('.auth-top .lang-dropdown-item:has-text("தமிழ் (TA)")').click();
    await page.waitForTimeout(400);

    const taBtnText = await page.locator(".auth-top .lang-selector-trigger").first().innerText();
    console.log(`   Tamil Language Button Text: "${taBtnText.trim()}"`);
    if (taBtnText.includes("TA")) {
      checks.push("PASS: Language trigger updated to 'TA'");
    } else {
      checks.push(`FAIL: Expected TA button, got: ${taBtnText}`);
    }

    const authEyebrowTa = await page.locator(".auth-form .eyebrow").innerText();
    console.log(`   Auth Eyebrow (TA): "${authEyebrowTa}"`);
    if (authEyebrowTa.includes("ஹார்பர்எக்ஸ்")) {
      checks.push("PASS: Auth screen renders Tamil eyebrow 'ஹார்பர்எக்ஸ்'");
    } else {
      checks.push(`FAIL: Expected Tamil eyebrow, got: ${authEyebrowTa}`);
    }

    // 3. Demo Login as Seller in Tamil
    console.log("3. Logging in as Seller with Demo credentials...");
    const sellerCard = page.locator('.demo-roles .demo-role-card:has-text("விற்பனையாளர்"), .demo-roles button:has-text("விற்பனையாளர்")');
    await sellerCard.click();
    await page.locator('.auth-form button.primary').click();
    await page.waitForSelector(".app-shell", { timeout: 10000 });
    checks.push("PASS: Logged into Seller workspace with Tamil active");

    // Verify Seller Workspace in Tamil
    const ribbonText = await page.locator(".demo-ribbon").innerText();
    console.log(`   Ribbon Text (TA): "${ribbonText.trim()}"`);
    if (ribbonText.includes("விற்பனையாளர் பார்வை")) {
      checks.push("PASS: Demo ribbon renders Tamil text 'விற்பனையாளர் பார்வை'");
    } else {
      checks.push(`FAIL: Expected Tamil ribbon, got: ${ribbonText}`);
    }

    const heroTitleTa = await page.locator(".hero-banner h2").innerText();
    console.log(`   Overview Hero Title (TA): "${heroTitleTa}"`);
    if (heroTitleTa.includes("பிடிகள்") || heroTitleTa.includes("ஏல")) {
      checks.push("PASS: Overview hero title rendered simplified Tamil heading");
    } else {
      checks.push(`FAIL: Expected simplified Tamil hero title, got: ${heroTitleTa}`);
    }

    // Verify Catch Registration Modal in Tamil
    console.log("   Opening Catch Form modal in Tamil...");
    await page.locator('button:has-text("பிடி பதிவு செய்க")').first().click();
    await page.waitForSelector(".modal-dialog, .modal", { timeout: 5000 });

    const modalTitleTa = await page.locator(".modal-dialog h2, .modal h2").first().innerText();
    console.log(`   Modal Title (TA): "${modalTitleTa}"`);
    if (modalTitleTa.includes("பிடி")) {
      checks.push("PASS: Catch Registration modal title rendered in Tamil");
    } else {
      checks.push(`FAIL: Expected Tamil modal title, got: ${modalTitleTa}`);
    }

    const step1TitleTa = await page.locator(".workflow-step:first-child strong").innerText();
    console.log(`   Step 1 Title (TA): "${step1TitleTa}"`);
    if (step1TitleTa.includes("பிரகடனம்") || step1TitleTa.includes("படகு")) {
      checks.push("PASS: Catch modal step 1 instruction rendered in Tamil");
    } else {
      checks.push(`FAIL: Expected Tamil step 1, got: ${step1TitleTa}`);
    }

    // Close modal
    await page.locator('button[aria-label="Close dialog"]').click();
    await page.waitForTimeout(400);

    // 4. Switch to Sinhala (SI) from Topbar
    console.log("4. Switching to Sinhala (SI) from Topbar...");
    const topbarLangBtn = page.locator(".topbar-actions .lang-selector-trigger");
    await topbarLangBtn.click();
    await page.locator('.topbar-actions .lang-dropdown-item:has-text("සිංහල (SI)")').click();
    await page.waitForTimeout(400);

    const siBtnText = await page.locator(".topbar-actions .lang-selector-trigger").innerText();
    console.log(`   Sinhala Language Button Text: "${siBtnText.trim()}"`);
    if (siBtnText.includes("SI")) {
      checks.push("PASS: Topbar language selector updated to 'SI'");
    } else {
      checks.push(`FAIL: Expected SI button, got: ${siBtnText}`);
    }

    const ribbonTextSi = await page.locator(".demo-ribbon").innerText();
    console.log(`   Ribbon Text (SI): "${ribbonTextSi.trim()}"`);
    if (ribbonTextSi.includes("විකුණුම්කරු") || ribbonTextSi.includes("ධීවරයා")) {
      checks.push("PASS: Demo ribbon renders Sinhala text 'විකුණුම්කරු'");
    } else {
      checks.push(`FAIL: Expected Sinhala ribbon, got: ${ribbonTextSi}`);
    }

    const heroTitleSi = await page.locator(".hero-banner h2").innerText();
    console.log(`   Overview Hero Title (SI): "${heroTitleSi}"`);
    if (heroTitleSi.includes("අස්වැන්න") || heroTitleSi.includes("වෙන්දේසි")) {
      checks.push("PASS: Overview hero title rendered simplified Sinhala heading");
    } else {
      checks.push(`FAIL: Expected simplified Sinhala hero title, got: ${heroTitleSi}`);
    }

    // Verify Catch Form modal in Sinhala
    console.log("   Opening Catch Form modal in Sinhala...");
    await page.locator('button:has-text("අස්වැන්න ලියාපදිංචි කරන්න")').first().click();
    await page.waitForSelector(".modal-dialog, .modal", { timeout: 5000 });

    const modalTitleSi = await page.locator(".modal-dialog h2, .modal h2").first().innerText();
    console.log(`   Modal Title (SI): "${modalTitleSi}"`);
    if (modalTitleSi.includes("අස්වැන්න")) {
      checks.push("PASS: Catch Registration modal title rendered in Sinhala");
    } else {
      checks.push(`FAIL: Expected Sinhala modal title, got: ${modalTitleSi}`);
    }

    const step1TitleSi = await page.locator(".workflow-step:first-child strong").innerText();
    console.log(`   Step 1 Title (SI): "${step1TitleSi}"`);
    if (step1TitleSi.includes("බෝට්ටු") || step1TitleSi.includes("ප්‍රකාශනය")) {
      checks.push("PASS: Catch modal step 1 instruction rendered in Sinhala");
    } else {
      checks.push(`FAIL: Expected Sinhala step 1, got: ${step1TitleSi}`);
    }

    // Close modal
    await page.locator('button[aria-label="Close dialog"]').click();
    await page.waitForTimeout(400);

    // 5. Test Navigation to Auctions in Sinhala
    console.log("5. Testing Navigation to Auctions in Sinhala...");
    await page.locator('#harbor-navigation nav button:has-text("වෙන්දේසි")').click();
    await page.waitForTimeout(500);

    const auctionsTitleSi = await page.locator(".page-heading h1").innerText();
    console.log(`   Auctions Title (SI): "${auctionsTitleSi}"`);
    if (auctionsTitleSi.includes("වෙන්දේසි")) {
      checks.push("PASS: Auctions screen heading rendered in Sinhala");
    } else {
      checks.push(`FAIL: Expected Sinhala auctions title, got: ${auctionsTitleSi}`);
    }

    // Inspect an auction lot in Sinhala if available
    const lotCount = await page.locator(".lot-card").count();
    console.log(`   Found ${lotCount} lot cards on Auctions page.`);
    if (lotCount > 0) {
      console.log("   Opening Lot Details Modal in Sinhala...");
      await page.locator(".lot-card button:has-text('View lot'), .lot-card .lot-art").first().click();
      await page.waitForSelector(".detail-top, .modal-header", { timeout: 5000 });

      const lotModalTitle = await page.locator(".modal-header h2").innerText();
      console.log(`   Lot Modal Title (SI): "${lotModalTitle}"`);

      const lotTabDetails = await page.locator(".detail-tabs button.selected").innerText();
      console.log(`   Active Tab (SI): "${lotTabDetails}"`);
      if (lotTabDetails.includes("විස්තර")) {
        checks.push("PASS: Lot detail tab rendered in Sinhala ('විස්තර')");
      } else {
        checks.push(`FAIL: Expected Sinhala Details tab ('විස්තර'), got: ${lotTabDetails}`);
      }

      // Close lot modal
      await page.locator('button[aria-label="Close dialog"]').click();
      await page.waitForTimeout(400);
    }

    // 6. Test Persistence on Page Reload
    console.log("6. Testing Persistence across page reload...");
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForSelector(".topbar-actions .lang-selector-trigger", { timeout: 10000 });

    const reloadedLangText = await page.locator(".topbar-actions .lang-selector-trigger").innerText();
    console.log(`   Reloaded Language Button: "${reloadedLangText.trim()}"`);
    if (reloadedLangText.includes("SI")) {
      checks.push("PASS: Language selection (SI) persists across page reload");
    } else {
      checks.push(`FAIL: Expected persistent SI after reload, got: ${reloadedLangText}`);
    }

    // 7. Switch back to English (EN) and Sign Out
    console.log("7. Switching back to English and Signing Out...");
    await page.locator(".topbar-actions .lang-selector-trigger").click();
    await page.locator('.topbar-actions .lang-dropdown-item:has-text("English (EN)")').click();
    await page.waitForTimeout(400);

    const enBtnText = await page.locator(".topbar-actions .lang-selector-trigger").innerText();
    console.log(`   English Language Button Text: "${enBtnText.trim()}"`);
    if (enBtnText.includes("EN")) {
      checks.push("PASS: Language restored to 'EN'");
    } else {
      checks.push(`FAIL: Expected EN button, got: ${enBtnText}`);
    }

    // Sign out
    const signOutBtn = page.locator('.topbar button[title="Sign out"], .topbar button[aria-label="Sign out"]');
    await signOutBtn.click();
    await page.waitForSelector(".auth-page", { timeout: 8000 });

    const finalAuthEyebrow = await page.locator(".auth-form .eyebrow").innerText();
    console.log(`   Signed Out Auth Eyebrow (EN): "${finalAuthEyebrow}"`);
    if (finalAuthEyebrow.includes("WELCOME TO HARBORX")) {
      checks.push("PASS: Auth screen restored in English after sign-out");
    } else {
      checks.push(`FAIL: Expected English eyebrow, got: ${finalAuthEyebrow}`);
    }

  } catch (err) {
    console.error("Test execution error:", err);
    checks.push(`ERROR: ${err.message}`);
  } finally {
    await browser.close();
  }

  console.log("\n================ GLOBAL LOCALIZATION E2E RESULTS ================");
  checks.forEach((c) => console.log(c));

  const hasFailures = checks.some((c) => c.startsWith("FAIL") || c.startsWith("ERROR"));
  if (hasFailures) {
    console.error("\nFAILURE: One or more global localization checks failed!");
    process.exit(1);
  } else {
    console.log("\nALL GLOBAL LOCALIZATION E2E CHECKS PASSED SUCCESSFULLY!");
  }
}

run();
