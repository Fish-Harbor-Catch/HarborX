import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";

async function run() {
  console.log(`Starting Demo Role Selection Verification against ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  try {
    // 1. Visit Login screen
    console.log(`1. Navigating to ${BASE_URL}...`);
    try {
      await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 15000 });
    } catch (netErr) {
      throw new Error(
        `Failed to reach frontend at ${BASE_URL}. Ensure the development server is running via 'npm run dev'. (${netErr.message})`
      );
    }
    await page.waitForTimeout(1000);

    // 2. Verify English Demo Box content
    console.log("2. Verifying English content & structure...");
    const demoBox = page.locator(".demo-box");
    await demoBox.waitFor({ state: "visible" });

    const title = await demoBox.locator(".demo-title").innerText();
    console.log(`   Demo Title (EN): "${title}"`);
    if (!title.includes("Explore demo")) {
      throw new Error(`Expected 'Explore demo', got '${title}'`);
    }

    const subtitle = await demoBox.locator(".demo-subtitle").innerText();
    console.log(`   Demo Subtitle (EN): "${subtitle}"`);
    if (!subtitle.includes("Choose a role")) {
      throw new Error(`Expected 'Choose a role', got '${subtitle}'`);
    }

    // 3. Verify Cards and Descriptions
    const cards = demoBox.locator(".demo-role-card");
    const count = await cards.count();
    console.log(`   Number of Demo Role Cards: ${count}`);
    if (count !== 3) {
      throw new Error(`Expected 3 demo role cards, got ${count}`);
    }

    const sellerCard = cards.nth(0);
    const buyerCard = cards.nth(1);
    const adminCard = cards.nth(2);

    const sellerTitle = await sellerCard.locator('.demo-role-title').innerText();
    const sellerDesc = await sellerCard.locator('.demo-role-desc').innerText();
    const buyerTitle = await buyerCard.locator('.demo-role-title').innerText();
    const buyerDesc = await buyerCard.locator('.demo-role-desc').innerText();
    const adminTitle = await adminCard.locator('.demo-role-title').innerText();
    const adminDesc = await adminCard.locator('.demo-role-desc').innerText();

    console.log(`   Seller: "${sellerTitle}" - "${sellerDesc}"`);
    console.log(`   Buyer: "${buyerTitle}" - "${buyerDesc}"`);
    console.log(`   Admin: "${adminTitle}" - "${adminDesc}"`);

    if (sellerTitle !== "Seller" || sellerDesc !== "Sell your fish") {
      throw new Error(`Unexpected Seller content: "${sellerTitle}" - "${sellerDesc}"`);
    }
    if (buyerTitle !== "Buyer" || buyerDesc !== "Buy fish at auction") {
      throw new Error(`Unexpected Buyer content: "${buyerTitle}" - "${buyerDesc}"`);
    }
    if (adminTitle !== "Auction Manager" || adminDesc !== "Manage fish auctions") {
      throw new Error(`Unexpected Admin content: "${adminTitle}" - "${adminDesc}"`);
    }

    // Verify Desktop layout (all 3 in one row, equal width)
    const boxSeller = await sellerCard.boundingBox();
    const boxBuyer = await buyerCard.boundingBox();
    const boxAdmin = await adminCard.boundingBox();
    console.log(`   Desktop Card Widths: Seller=${boxSeller.width}px, Buyer=${boxBuyer.width}px, Admin=${boxAdmin.width}px`);
    console.log(`   Desktop Card Y Positions: Seller=${boxSeller.y}px, Buyer=${boxBuyer.y}px, Admin=${boxAdmin.y}px`);

    if (Math.abs(boxSeller.y - boxBuyer.y) > 2 || Math.abs(boxBuyer.y - boxAdmin.y) > 2) {
      throw new Error("Desktop cards should be in a single horizontal row");
    }
    if (Math.abs(boxSeller.width - boxBuyer.width) > 4 || Math.abs(boxBuyer.width - boxAdmin.width) > 4) {
      throw new Error("Desktop cards should be equal width");
    }

    // 4. Test Credential Autofill Behavior
    console.log("3. Testing Credential Autofill Behavior...");
    const emailInput = page.locator('input[type="email"]');
    const passInput = page.locator('input[type="password"]');

    // Click Seller
    await sellerCard.click();
    await page.waitForTimeout(200);
    let emailVal = await emailInput.inputValue();
    let passVal = await passInput.inputValue();
    let isSellerSelected = (await sellerCard.getAttribute("class")).includes("selected");
    console.log(`   Clicked Seller -> Email: "${emailVal}", Selected: ${isSellerSelected}`);
    if (emailVal !== "seller@harborx.demo" || !passVal || !isSellerSelected) {
      throw new Error(`Seller autofill failed: ${emailVal}`);
    }

    // Click Buyer
    await buyerCard.click();
    await page.waitForTimeout(200);
    emailVal = await emailInput.inputValue();
    let isBuyerSelected = (await buyerCard.getAttribute("class")).includes("selected");
    isSellerSelected = (await sellerCard.getAttribute("class")).includes("selected");
    console.log(`   Clicked Buyer -> Email: "${emailVal}", Selected: ${isBuyerSelected}, Seller Unselected: ${!isSellerSelected}`);
    if (emailVal !== "buyer@harborx.demo" || !isBuyerSelected || isSellerSelected) {
      throw new Error(`Buyer autofill failed: ${emailVal}`);
    }

    // Click Auction Manager
    await adminCard.click();
    await page.waitForTimeout(200);
    emailVal = await emailInput.inputValue();
    let isAdminSelected = (await adminCard.getAttribute("class")).includes("selected");
    console.log(`   Clicked Admin -> Email: "${emailVal}", Selected: ${isAdminSelected}`);
    if (emailVal !== "admin@harborx.demo" || !isAdminSelected) {
      throw new Error(`Admin autofill failed: ${emailVal}`);
    }

    // 5. Verify Tamil Localization
    console.log("4. Testing Tamil (TA) Localization...");
    await page.locator(".lang-selector-trigger").first().click();
    await page.locator('.lang-dropdown-item:has-text("தமிழ் (TA)")').click();
    await page.waitForTimeout(500);

    const titleTa = await demoBox.locator(".demo-title").innerText();
    const sellerTitleTa = await sellerCard.locator(".demo-role-title").innerText();
    const sellerDescTa = await sellerCard.locator(".demo-role-desc").innerText();
    const buyerTitleTa = await buyerCard.locator(".demo-role-title").innerText();
    const buyerDescTa = await buyerCard.locator(".demo-role-desc").innerText();
    const adminTitleTa = await adminCard.locator(".demo-role-title").innerText();
    const adminDescTa = await adminCard.locator(".demo-role-desc").innerText();

    console.log(`   Title (TA): "${titleTa}"`);
    console.log(`   Seller (TA): "${sellerTitleTa}" - "${sellerDescTa}"`);
    console.log(`   Buyer (TA): "${buyerTitleTa}" - "${buyerDescTa}"`);
    console.log(`   Admin (TA): "${adminTitleTa}" - "${adminDescTa}"`);

    if (!titleTa.includes("ஆராய்க") || !sellerTitleTa.includes("விற்பனையாளர்") || !sellerDescTa.includes("விற்க")) {
      throw new Error(`Tamil localization check failed`);
    }

    // 6. Verify Sinhala Localization
    console.log("5. Testing Sinhala (SI) Localization...");
    await page.locator(".lang-selector-trigger").first().click();
    await page.locator('.lang-dropdown-item:has-text("සිංහල (SI)")').click();
    await page.waitForTimeout(500);

    const titleSi = await demoBox.locator(".demo-title").innerText();
    const sellerTitleSi = await sellerCard.locator(".demo-role-title").innerText();
    const sellerDescSi = await sellerCard.locator(".demo-role-desc").innerText();
    const buyerTitleSi = await buyerCard.locator(".demo-role-title").innerText();
    const buyerDescSi = await buyerCard.locator(".demo-role-desc").innerText();
    const adminTitleSi = await adminCard.locator(".demo-role-title").innerText();
    const adminDescSi = await adminCard.locator(".demo-role-desc").innerText();

    console.log(`   Title (SI): "${titleSi}"`);
    console.log(`   Seller (SI): "${sellerTitleSi}" - "${sellerDescSi}"`);
    console.log(`   Buyer (SI): "${buyerTitleSi}" - "${buyerDescSi}"`);
    console.log(`   Admin (SI): "${adminTitleSi}" - "${adminDescSi}"`);

    if (!titleSi.includes("ගවේෂණය") || !sellerTitleSi.includes("විකුණුම්කරු") || !sellerDescSi.includes("විකුණන්න")) {
      throw new Error(`Sinhala localization check failed`);
    }

    // 7. Verify Responsive Layout at 360px (Mobile)
    console.log("6. Testing Mobile Viewport (360px)...");
    await page.setViewportSize({ width: 360, height: 740 });
    await page.waitForTimeout(500);

    const isOverflowing = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    console.log(`   Mobile horizontal overflow detected: ${isOverflowing}`);
    if (isOverflowing) {
      throw new Error("Horizontal overflow detected on mobile 360px viewport");
    }

    // Check touch target heights and stacked layout
    const mSeller = await sellerCard.boundingBox();
    const mBuyer = await buyerCard.boundingBox();
    const mAdmin = await adminCard.boundingBox();
    console.log(`   Seller Card Mobile Height: ${mSeller.height}px (min target: 44px)`);
    console.log(`   Buyer Card Mobile Height: ${mBuyer.height}px (min target: 44px)`);
    console.log(`   Admin Card Mobile Height: ${mAdmin.height}px (min target: 44px)`);

    if (mSeller.height < 44 || mBuyer.height < 44 || mAdmin.height < 44) {
      throw new Error(`One or more card heights are below 44px touch target minimum`);
    }

    // Verify stacked rows (Seller above Buyer above Admin)
    if (!(mSeller.y < mBuyer.y && mBuyer.y < mAdmin.y)) {
      throw new Error("Mobile cards should be stacked into three horizontal selectable rows");
    }

    // Check internal horizontal layout (icon on left, text in middle, checkmark on right)
    const iconBox = await adminCard.locator('.demo-role-icon').boundingBox();
    const textBox = await adminCard.locator('.demo-role-text').boundingBox();
    const checkmark = adminCard.locator('.demo-role-check');
    const isCheckVisible = await checkmark.isVisible();
    console.log(`   Selected Admin Card has checkmark visible: ${isCheckVisible}`);

    if (iconBox.x >= textBox.x) {
      throw new Error("Icon should be positioned on the left of the text on mobile rows");
    }
    if (isCheckVisible) {
      const checkBox = await checkmark.boundingBox();
      console.log(`   Icon X: ${iconBox.x}, Text X: ${textBox.x}, Checkmark X: ${checkBox.x}`);
      if (checkBox.x <= textBox.x) {
        throw new Error("Checkmark should be positioned on the right side of the mobile row");
      }
    }

    // Switch back to English
    await page.locator(".lang-selector-trigger").first().click();
    await page.locator('.lang-dropdown-item:has-text("English (EN)")').click();
    await page.waitForTimeout(500);

    console.log("\nALL DEMO ROLE SELECTION CHECKS PASSED SUCCESSFULLY!");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
