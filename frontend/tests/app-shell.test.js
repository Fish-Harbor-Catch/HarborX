import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

import {
  NAV,
  ROLES_LABEL,
  ROLE_NAV_ITEMS,
  SECONDARY_NAV_ITEMS,
  MOBILE_NAV_ITEMS,
} from "../src/components/layout/nav-config.js";

test("layout component files exist in frontend/src/components/layout", async () => {
  const files = [
    "AppShell.jsx",
    "Sidebar.jsx",
    "Topbar.jsx",
    "MobileNavigation.jsx",
    "DemoRibbon.jsx",
    "Logo.jsx",
    "nav-config.js",
    "index.js",
  ];

  for (const file of files) {
    const fileStat = await stat(
      new URL(`../src/components/layout/${file}`, import.meta.url),
    );
    assert.ok(fileStat.isFile(), `${file} should exist as a regular file`);
  }
});

test("nav-config defines expected navigation items and role-specific configurations", () => {
  // All 10 navigation items
  const expectedKeys = [
    "overview",
    "auctions",
    "catches",
    "bids",
    "won",
    "payments",
    "users",
    "reports",
    "activity",
    "settings",
  ];
  for (const key of expectedKeys) {
    assert.ok(NAV[key], `NAV[${key}] should exist`);
    assert.equal(typeof NAV[key][0], "string", `NAV[${key}][0] should be a label`);
    assert.ok(NAV[key][1], `NAV[${key}][1] should be a valid icon component`);
  }

  // Role labels
  assert.equal(ROLES_LABEL.admin, "Auction Manager");
  assert.equal(ROLES_LABEL.seller, "Seller");
  assert.equal(ROLES_LABEL.buyer, "Buyer");

  // Role navigation items
  assert.deepEqual(ROLE_NAV_ITEMS.admin, [
    "overview",
    "auctions",
    "users",
    "payments",
    "reports",
  ]);
  assert.deepEqual(ROLE_NAV_ITEMS.seller, [
    "overview",
    "catches",
    "auctions",
    "payments",
  ]);
  assert.deepEqual(ROLE_NAV_ITEMS.buyer, [
    "overview",
    "auctions",
    "bids",
    "won",
    "payments",
  ]);

  // Secondary items
  assert.deepEqual(SECONDARY_NAV_ITEMS, ["activity", "settings"]);

  // Mobile navigation max 4 primary keys per role
  assert.equal(MOBILE_NAV_ITEMS.admin.length, 4);
  assert.equal(MOBILE_NAV_ITEMS.seller.length, 4);
  assert.equal(MOBILE_NAV_ITEMS.buyer.length, 4);
});

test("layout index.js barrel exports all layout components", async () => {
  const indexJs = await readFile(
    new URL("../src/components/layout/index.js", import.meta.url),
    "utf8",
  );

  assert.match(indexJs, /export\s+\{\s*AppShell\s*\}\s+from\s+["']\.\/AppShell\.jsx["']/);
  assert.match(indexJs, /export\s+\{\s*Sidebar\s*\}\s+from\s+["']\.\/Sidebar\.jsx["']/);
  assert.match(indexJs, /export\s+\{\s*Topbar\s*\}\s+from\s+["']\.\/Topbar\.jsx["']/);
  assert.match(indexJs, /export\s+\{\s*MobileNavigation\s*\}\s+from\s+["']\.\/MobileNavigation\.jsx["']/);
  assert.match(indexJs, /export\s+\{\s*DemoRibbon\s*\}\s+from\s+["']\.\/DemoRibbon\.jsx["']/);
  assert.match(indexJs, /export\s+\{\s*Logo\s*\}\s+from\s+["']\.\/Logo\.jsx["']/);
});

test("Sidebar.jsx implements role-based navigation, scrim, drawer close, and keyboard accessibility", async () => {
  const code = await readFile(
    new URL("../src/components/layout/Sidebar.jsx", import.meta.url),
    "utf8",
  );

  // Semantics & selectors required by existing tests
  assert.match(code, /id="harbor-navigation"/);
  assert.match(code, /className=\{`sidebar /);
  assert.match(code, /sidebar-scrim/);
  assert.match(code, /sidebar-close-btn/);
  assert.match(code, /sidebar-user/);
  assert.match(code, /harbor-help/);
  assert.match(code, /ROLE_NAV_ITEMS/);

  // Live count badge and dot indicator
  assert.match(code, /liveCount/);
  assert.match(code, /hasUnverifiedBuyers/);
  assert.match(code, /nav-dot/);

  // Keyboard accessibility: Escape key to close drawer
  assert.match(code, /event\.key === "Escape"/);
});

test("Topbar.jsx implements breadcrumbs, mobile trigger, online state, notifications, and user summary", async () => {
  const code = await readFile(
    new URL("../src/components/layout/Topbar.jsx", import.meta.url),
    "utf8",
  );

  // Header and breadcrumbs
  assert.match(code, /role="banner"/);
  assert.match(code, /className=\{`topbar /);
  assert.match(code, /className="breadcrumbs"/);
  assert.match(code, /className="mobile-menu"/);
  assert.match(code, /aria-label="Open menu"/);
  assert.match(code, /aria-controls="harbor-navigation"/);

  // Actions
  assert.match(code, /className="topbar-actions"/);
  assert.match(code, /connection/);
  assert.match(code, /Connected/);
  assert.match(code, /Offline/);
  assert.match(code, /aria-label="View recent activity"/);
  assert.match(code, /aria-label="Sign out"/);
});

test("DemoRibbon.jsx distinguishes demo sessions and preserves role switching", async () => {
  const code = await readFile(
    new URL("../src/components/layout/DemoRibbon.jsx", import.meta.url),
    "utf8",
  );

  assert.match(code, /demo-ribbon/);
  assert.match(code, /Sample environment/);
  assert.match(code, /no real transactions/);
  assert.match(code, /Switch role/);
  assert.match(code, /onSwitchRole/);
});

test("MobileNavigation.jsx provides persistent bottom tabs with safe area offset", async () => {
  const code = await readFile(
    new URL("../src/components/layout/MobileNavigation.jsx", import.meta.url),
    "utf8",
  );

  assert.match(code, /mobile-bottom-nav/);
  assert.match(code, /mobile-tab/);
  assert.match(code, /MOBILE_NAV_ITEMS/);
  assert.match(code, /More/);
  assert.match(code, /aria-label="More navigation options"/);
});

test("AppShell.jsx composes Sidebar, Topbar, DemoRibbon, main content, and PwaStatus", async () => {
  const code = await readFile(
    new URL("../src/components/layout/AppShell.jsx", import.meta.url),
    "utf8",
  );

  assert.match(code, /<Sidebar/);
  assert.match(code, /<Topbar/);
  assert.match(code, /<DemoRibbon/);
  assert.match(code, /<main id="main-content">/);
  assert.match(code, /<MobileNavigation/);
  assert.match(code, /PwaStatus/);
});

test("App.jsx and main.jsx integrate AppShell and PwaStatus without duplication", async () => {
  const appJsx = await readFile(
    new URL("../src/App.jsx", import.meta.url),
    "utf8",
  );
  const mainJsx = await readFile(
    new URL("../src/main.jsx", import.meta.url),
    "utf8",
  );

  // App.jsx uses AppShell
  assert.match(appJsx, /import\s+\{\s*AppShell\s*\}\s+from\s+["']\.\/components\/layout\/index\.js["']/);
  assert.match(appJsx, /<AppShell/);

  // main.jsx renders clean <App /> without duplicate PwaStatus
  assert.doesNotMatch(mainJsx, /<PwaStatus\s*\/>/);
  assert.match(mainJsx, /<App\s*\/>/);
});

test("styles.css implements responsive rules for 320px, 360px, 480px, and 760px", async () => {
  const css = await readFile(
    new URL("../src/styles.css", import.meta.url),
    "utf8",
  );

  // AppShell & Sidebar classes
  assert.match(css, /\.app-shell/);
  assert.match(css, /\.sidebar/);
  assert.match(css, /\.sidebar-header/);
  assert.match(css, /\.sidebar-close-btn/);
  assert.match(css, /\.sidebar-collapsed/);
  assert.match(css, /\.sidebar-collapse-toggle/);

  // Topbar & DemoRibbon classes
  assert.match(css, /\.topbar/);
  assert.match(css, /\.breadcrumbs/);
  assert.match(css, /\.breadcrumb-current/);
  assert.match(css, /\.demo-ribbon/);
  assert.match(css, /\.demo-badge/);
  assert.match(css, /\.demo-switch-btn/);

  // Mobile Bottom Navigation classes
  assert.match(css, /\.mobile-bottom-nav/);
  assert.match(css, /\.mobile-tab/);

  // Responsive media queries
  assert.match(css, /@media\s*\(max-width:\s*760px\)/);
  assert.match(css, /@media\s*\(max-width:\s*480px\)/);
  assert.match(css, /@media\s*\(max-width:\s*360px\)/);

  // Content offset on mobile to prevent bottom nav overlap
  assert.match(css, /\.main-shell\s*\{[^}]*padding-bottom:\s*calc\(64px/);
});
