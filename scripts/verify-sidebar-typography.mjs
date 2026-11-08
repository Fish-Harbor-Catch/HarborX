import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";

async function run() {
  console.log(`Starting Sidebar Typography & Readability Verification against ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 850 } });
  const page = await context.newPage();

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

    // 2. Click Seller Demo Card & Sign In
    console.log("2. Signing in via Seller Demo Card...");
    const sellerCard = page.locator(".demo-role-card").first();
    await sellerCard.click();
    await page.waitForTimeout(300);

    const submitBtn = page.locator(".auth-form .btn.primary");
    await submitBtn.click();
    await page.waitForTimeout(2000);

    // Verify inside dashboard
    const sidebar = page.locator(".sidebar");
    await sidebar.waitFor({ state: "visible" });
    console.log("   Logged in successfully. Sidebar is visible.");

    // 3. Inspect Navigation Labels Typography
    console.log("3. Inspecting Navigation Labels Typography...");
    const navLabels = page.locator(".sidebar nav button .nav-label");
    const navCount = await navLabels.count();
    console.log(`   Found ${navCount} navigation items.`);

    const firstLabelStyle = await page.evaluate(() => {
      const el = document.querySelector(".sidebar nav button .nav-label");
      const btn = document.querySelector(".sidebar nav button");
      const cs = window.getComputedStyle(el);
      const csBtn = window.getComputedStyle(btn);
      return {
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        btnFontSize: csBtn.fontSize,
        btnFontWeight: csBtn.fontWeight,
      };
    });
    console.log("   Nav label style:", firstLabelStyle);

    const labelSizeNum = parseFloat(firstLabelStyle.fontSize);
    if (labelSizeNum < 13 || labelSizeNum > 14) {
      throw new Error(`Expected nav label font size 13-14px, got ${firstLabelStyle.fontSize}`);
    }

    // Check active button font weight
    const activeLabelStyle = await page.evaluate(() => {
      const activeBtn = document.querySelector(".sidebar nav button.active");
      const activeLabel = activeBtn ? activeBtn.querySelector(".nav-label") : null;
      return {
        btnWeight: activeBtn ? window.getComputedStyle(activeBtn).fontWeight : null,
        labelWeight: activeLabel ? window.getComputedStyle(activeLabel).fontWeight : null,
      };
    });
    console.log("   Active nav button style:", activeLabelStyle);
    if (parseInt(activeLabelStyle.btnWeight) < 600 && parseInt(activeLabelStyle.labelWeight) < 600) {
      throw new Error(`Expected active button font-weight >= 600, got ${JSON.stringify(activeLabelStyle)}`);
    }

    // 4. Inspect Section Headings Typography
    console.log("4. Inspecting Section Headings (.workspace-label)...");
    const headingStyles = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll(".workspace-label"));
      return headings.map((h) => {
        const cs = window.getComputedStyle(h);
        return {
          text: h.textContent.trim(),
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          letterSpacing: cs.letterSpacing,
          color: cs.color,
          textTransform: cs.textTransform,
        };
      });
    });
    console.log("   Section headings:", headingStyles);

    for (const h of headingStyles) {
      const sizeNum = parseFloat(h.fontSize);
      if (sizeNum < 11 || sizeNum > 12) {
        throw new Error(`Expected section heading font size 11-12px, got ${h.fontSize} for "${h.text}"`);
      }
      if (parseInt(h.fontWeight) < 600) {
        throw new Error(`Expected section heading font-weight >= 600, got ${h.fontWeight}`);
      }
    }

    // 5. Inspect User Profile Typography
    console.log("5. Inspecting User Profile (.sidebar-user)...");
    const userStyle = await page.evaluate(() => {
      const strong = document.querySelector(".sidebar-user strong");
      const small = document.querySelector(".sidebar-user small");
      const avatar = document.querySelector(".sidebar-user .avatar");
      return {
        nameText: strong ? strong.textContent.trim() : null,
        nameFontSize: strong ? window.getComputedStyle(strong).fontSize : null,
        nameFontWeight: strong ? window.getComputedStyle(strong).fontWeight : null,
        roleText: small ? small.textContent.trim() : null,
        roleFontSize: small ? window.getComputedStyle(small).fontSize : null,
        roleFontWeight: small ? window.getComputedStyle(small).fontWeight : null,
        avatarWidth: avatar ? window.getComputedStyle(avatar).width : null,
        avatarHeight: avatar ? window.getComputedStyle(avatar).height : null,
        avatarFontSize: avatar ? window.getComputedStyle(avatar).fontSize : null,
      };
    });
    console.log("   User info style:", userStyle);

    const nameSizeNum = parseFloat(userStyle.nameFontSize);
    if (nameSizeNum < 13 || nameSizeNum > 14) {
      throw new Error(`Expected user name font size 13-14px, got ${userStyle.nameFontSize}`);
    }

    const roleSizeNum = parseFloat(userStyle.roleFontSize);
    if (roleSizeNum < 11.5 || roleSizeNum > 12.5) {
      throw new Error(`Expected user role font size ~12px, got ${userStyle.roleFontSize}`);
    }

    // 6. Inspect Navigation Badges
    console.log("6. Inspecting Navigation Badges (.nav-badge)...");
    const badgeStyle = await page.evaluate(() => {
      const testBadge = document.createElement("span");
      testBadge.className = "nav-badge";
      testBadge.textContent = "3";
      document.body.appendChild(testBadge);
      const cs = window.getComputedStyle(testBadge);
      const res = {
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        borderRadius: cs.borderRadius,
      };
      testBadge.remove();
      return res;
    });
    console.log("   Badge style:", badgeStyle);
    const badgeSizeNum = parseFloat(badgeStyle.fontSize);
    if (badgeSizeNum < 12 || badgeSizeNum > 13) {
      throw new Error(`Expected nav badge font size 12-13px, got ${badgeStyle.fontSize}`);
    }

    // 7. Inspect Sidebar Icons
    console.log("7. Inspecting Sidebar Icons...");
    const iconDimensions = await page.evaluate(() => {
      const svgs = Array.from(document.querySelectorAll(".sidebar nav button svg"));
      return svgs.slice(0, 3).map((svg) => {
        const rect = svg.getBoundingClientRect();
        const widthAttr = svg.getAttribute("width");
        const heightAttr = svg.getAttribute("height");
        return {
          widthAttr,
          heightAttr,
          renderedWidth: rect.width,
          renderedHeight: rect.height,
        };
      });
    });
    console.log("   Icon dimensions:", iconDimensions);
    for (const icon of iconDimensions) {
      const w = parseFloat(icon.widthAttr || icon.renderedWidth);
      if (w < 19 || w > 21) {
        throw new Error(`Expected sidebar icon size 19-21px, got ${w}px`);
      }
    }

    // 8. Test Collapse / Expand Behavior
    console.log("8. Testing Sidebar Collapse / Expand...");
    const collapseToggle = page.locator(".sidebar-collapse-toggle");
    await collapseToggle.click();
    await page.waitForTimeout(400);

    const isCollapsed = await page.evaluate(() => {
      const appShell = document.querySelector(".app-shell");
      const sidebarEl = document.querySelector(".sidebar");
      const labelsHidden = Array.from(document.querySelectorAll(".sidebar nav button .nav-label"))
        .every((el) => window.getComputedStyle(el).display === "none");
      const headingsHidden = Array.from(document.querySelectorAll(".workspace-label"))
        .length === 0;
      return {
        appShellClass: appShell.className,
        sidebarWidth: sidebarEl.getBoundingClientRect().width,
        labelsHidden,
        headingsHidden,
      };
    });
    console.log("   Collapsed state check:", isCollapsed);
    if (!isCollapsed.appShellClass.includes("sidebar-collapsed")) {
      throw new Error("Expected .app-shell to have .sidebar-collapsed class");
    }
    if (Math.abs(isCollapsed.sidebarWidth - 68) > 2) {
      throw new Error(`Expected collapsed sidebar width ~68px, got ${isCollapsed.sidebarWidth}px`);
    }

    // Expand sidebar again
    await collapseToggle.click();
    await page.waitForTimeout(400);

    // 9. Multilingual Readability & Overflow Check (EN, TA, SI)
    console.log("9. Testing Multilingual Text Rendering & No-Overflow...");
    const languages = [
      { code: "en", name: "English", match: "English", expectedNav: "Overview", expectedHeading: "HARBOR WORKSPACE" },
      { code: "ta", name: "Tamil", match: "தமிழ்", expectedNav: "மேலோட்டம்", expectedHeading: "துறைமுகப் பணித்தளம்" },
      { code: "si", name: "Sinhala", match: "සිංහල", expectedNav: "දළ විශ්ලේෂණය", expectedHeading: "වරාය වැඩබිම" },
    ];

    for (const lang of languages) {
      console.log(`   Switching to ${lang.name} (${lang.code})...`);
      // Open language dropdown in topbar
      const langTrigger = page.locator(".topbar-actions .lang-selector-trigger");
      await langTrigger.click();
      await page.waitForTimeout(300);

      // Select language option
      const opt = page.locator(`.topbar-actions .lang-dropdown-item:has-text("${lang.match}")`);
      await opt.click();
      await page.waitForTimeout(400);

      // Verify no horizontal overflow in sidebar
      const overflowCheck = await page.evaluate(() => {
        const sb = document.querySelector(".sidebar");
        const labels = Array.from(document.querySelectorAll(".sidebar nav button .nav-label")).map(l => l.textContent.trim());
        const headings = Array.from(document.querySelectorAll(".workspace-label")).map(h => h.textContent.trim());
        return {
          sidebarScrollWidth: sb.scrollWidth,
          sidebarClientWidth: sb.clientWidth,
          hasHorizontalOverflow: sb.scrollWidth > sb.clientWidth,
          labels,
          headings,
        };
      });
      console.log(`   ${lang.code.toUpperCase()} check:`, {
        overflow: overflowCheck.hasHorizontalOverflow,
        scrollWidth: overflowCheck.sidebarScrollWidth,
        clientWidth: overflowCheck.sidebarClientWidth,
        firstLabel: overflowCheck.labels[0],
        firstHeading: overflowCheck.headings[0],
      });

      if (overflowCheck.hasHorizontalOverflow) {
        throw new Error(`Horizontal overflow detected in .sidebar for language ${lang.code}!`);
      }
      if (overflowCheck.labels[0] !== lang.expectedNav) {
        throw new Error(`Expected first nav label "${lang.expectedNav}", got "${overflowCheck.labels[0]}"`);
      }
      if (overflowCheck.headings[0] !== lang.expectedHeading) {
        throw new Error(`Expected first heading "${lang.expectedHeading}", got "${overflowCheck.headings[0]}"`);
      }
    }

    // Switch back to EN
    const langTriggerEn = page.locator(".topbar-actions .lang-selector-trigger");
    await langTriggerEn.click();
    await page.waitForTimeout(300);
    await page.locator('.topbar-actions .lang-dropdown-item:has-text("English")').click();
    await page.waitForTimeout(400);

    // 10. Intermediate Screen Size (1200px)
    console.log("10. Testing intermediate screen width (1200px)...");
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(300);
    const width1200 = await page.evaluate(() => {
      const sb = document.querySelector(".sidebar");
      return {
        width: sb.getBoundingClientRect().width,
        hasHorizontalOverflow: sb.scrollWidth > sb.clientWidth,
      };
    });
    console.log("    1200px viewport sidebar:", width1200);
    if (width1200.hasHorizontalOverflow) {
      throw new Error("Horizontal overflow at 1200px viewport!");
    }

    // 11. Mobile Screen Size (760px) and Drawer
    console.log("11. Testing mobile screen width (760px) and Drawer...");
    await page.setViewportSize({ width: 760, height: 800 });
    await page.waitForTimeout(400);

    // Click mobile hamburger menu in topbar
    const menuBtn = page.locator(".topbar button[aria-label='Open menu']");
    await menuBtn.click();
    await page.waitForTimeout(400);

    const drawerOpen = await page.evaluate(() => {
      const sb = document.querySelector(".sidebar");
      const scrim = document.querySelector(".sidebar-scrim");
      return {
        hasOpenClass: sb.classList.contains("open"),
        isVisible: window.getComputedStyle(sb).visibility === "visible",
        scrimVisible: scrim ? window.getComputedStyle(scrim).opacity !== "0" : false,
      };
    });
    console.log("    Mobile drawer open:", drawerOpen);
    if (!drawerOpen.hasOpenClass || !drawerOpen.isVisible) {
      throw new Error("Mobile drawer did not open properly!");
    }

    // Click close button
    const closeBtn = page.locator(".sidebar-close-btn");
    await closeBtn.click();
    await page.waitForTimeout(400);

    const drawerClosed = await page.evaluate(() => {
      const sb = document.querySelector(".sidebar");
      return !sb.classList.contains("open");
    });
    console.log("    Mobile drawer closed:", drawerClosed);
    if (!drawerClosed) {
      throw new Error("Mobile drawer did not close properly!");
    }

    console.log("\n ALL SIDEBAR TYPOGRAPHY & READABILITY CHECKS PASSED SUCCESSFULLY!");
  } catch (err) {
    console.error("Verification failed:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
