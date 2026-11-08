import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("demo role selection UI has correct structure, heading, and roles in App.jsx", async () => {
  const appJsx = await readFile(
    new URL("../src/App.jsx", import.meta.url),
    "utf8"
  );

  // Region and radiogroup attributes
  assert.match(appJsx, /className="demo-box"[^>]*role="region"/);
  assert.match(appJsx, /className="demo-roles"[^>]*role="radiogroup"/);

  // Heading and subtitle labels
  assert.match(appJsx, /t\("auth_demo_title",\s*"Explore demo"\)/);
  assert.match(appJsx, /t\("auth_demo_subtitle",\s*"Choose a role"\)/);

  // Roles and short descriptions
  assert.match(appJsx, /fallbackDesc:\s*"Sell your fish"/);
  assert.match(appJsx, /fallbackDesc:\s*"Buy fish at auction"/);
  assert.match(appJsx, /fallbackDesc:\s*"Manage fish auctions"/);

  // Accessible radio roles and aria-checked
  assert.match(appJsx, /role="radio"/);
  assert.match(appJsx, /aria-checked=\{isSelected\}/);

  // Consistent icon size (22)
  assert.match(appJsx, /<RoleIcon size=\{22\}/);

  // Check indicator with strokeWidth
  assert.match(appJsx, /<Check size=\{11\} strokeWidth=\{2\.5\}/);

  // No redundant footer box
  assert.doesNotMatch(appJsx, /className="demo-footer"/);
});

test("demo role translations exist with exact parity for EN, TA, and SI in i18n.jsx", async () => {
  const i18nJsx = await readFile(
    new URL("../src/i18n.jsx", import.meta.url),
    "utf8"
  );

  // English
  assert.match(i18nJsx, /auth_demo_title:\s*"Explore demo"/);
  assert.match(i18nJsx, /auth_demo_subtitle:\s*"Choose a role"/);
  assert.match(i18nJsx, /auth_demo_seller_desc:\s*"Sell your fish"/);
  assert.match(i18nJsx, /auth_demo_buyer_desc:\s*"Buy fish at auction"/);
  assert.match(i18nJsx, /auth_demo_admin_desc:\s*"Manage fish auctions"/);

  // Tamil
  assert.match(i18nJsx, /auth_demo_title:\s*"டெமோவை ஆராய்க"/);
  assert.match(i18nJsx, /auth_demo_subtitle:\s*"ஒரு பங்கைத் தேர்வுசெய்க"/);
  assert.match(i18nJsx, /auth_demo_seller:\s*"விற்பனையாளர்"/);
  assert.match(i18nJsx, /auth_demo_seller_desc:\s*"உங்கள் மீனை விற்க"/);
  assert.match(i18nJsx, /auth_demo_buyer:\s*"வாங்குபவர்"/);
  assert.match(i18nJsx, /auth_demo_buyer_desc:\s*"ஏலத்தில் மீன் வாங்க"/);
  assert.match(i18nJsx, /auth_demo_admin:\s*"ஏல மேலாளர்"/);
  assert.match(i18nJsx, /auth_demo_admin_desc:\s*"மீன் ஏலங்களை நிர்வகிக்க"/);

  // Sinhala
  assert.match(i18nJsx, /auth_demo_title:\s*"ආදර්ශය ගවේෂණය කරන්න"/);
  assert.match(i18nJsx, /auth_demo_subtitle:\s*"කාර්යභාරයක් තෝරන්න"/);
  assert.match(i18nJsx, /auth_demo_seller:\s*"විකුණුම්කරු"/);
  assert.match(i18nJsx, /auth_demo_seller_desc:\s*"ඔබේ මසුන් විකුණන්න"/);
  assert.match(i18nJsx, /auth_demo_buyer:\s*"මිලදී ගන්නා"/);
  assert.match(i18nJsx, /auth_demo_buyer_desc:\s*"වෙන්දේසියෙන් මසුන් ගන්න"/);
  assert.match(i18nJsx, /auth_demo_admin:\s*"වෙන්දේසි කළමනාකරු"/);
  assert.match(i18nJsx, /auth_demo_admin_desc:\s*"මසුන් වෙන්දේසි පාලනය"/);
});

test("styles.css implements cleaner non-nested layout, subtle selected state, and responsive mobile rows", async () => {
  const css = await readFile(
    new URL("../src/styles.css", import.meta.url),
    "utf8"
  );

  // .demo-box is non-nested (transparent background, subtle top divider, no shadow)
  assert.match(css, /\.demo-box\s*\{[^}]*background:\s*transparent/);
  assert.match(css, /\.demo-box\s*\{[^}]*border-top:\s*1px solid/);
  assert.match(css, /\.demo-box\s*\{[^}]*box-shadow:\s*none/);

  // .demo-header flex layout
  assert.match(css, /\.demo-header\s*\{[^}]*display:\s*flex/);
  assert.match(css, /\.demo-title/);
  assert.match(css, /\.demo-subtitle/);

  // Desktop 3-column grid
  assert.match(css, /\.demo-roles\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*1fr\)/);

  // Subtle professional selected state (light tint, thin teal border, no thick shadow)
  assert.match(css, /\.demo-role-card\.selected\s*\{[^}]*border-color:\s*var\(--teal/);
  assert.match(css, /\.demo-role-card\.selected\s*\{[^}]*box-shadow:\s*none/);

  // Focus visible state
  assert.match(css, /\.demo-role-card:focus-visible\s*\{[^}]*outline:\s*2px solid/);

  // Small checkmark indicator
  assert.match(css, /\.demo-role-check/);

  // Responsive mobile layout: 1 column full-width horizontal rows with touch target >= 44px
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?\.demo-roles\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?\.demo-role-card\s*\{[^}]*flex-direction:\s*row/);
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?\.demo-role-card\s*\{[^}]*min-height:\s*52px/);
  assert.match(css, /@media\s*\(max-width:\s*480px\)[\s\S]*?\.demo-role-check\s*\{[^}]*margin-left:\s*auto/);
});

test("demo role credential fill logic preserves accounts and credentials without auto-login", async () => {
  const appJsx = await readFile(
    new URL("../src/App.jsx", import.meta.url),
    "utf8"
  );

  // Verifies fill function uses the exact demo domain and password
  assert.match(appJsx, /setEmail\(`\$\{r\}@harborx\.demo`\)/);
  assert.match(appJsx, /setPassword\("HarborXDemo2026!"\)/);
  assert.match(appJsx, /setRegister\(false\)/);

  // Verifies clicking role cards calls fill without submit
  assert.match(appJsx, /onClick=\{\(\) => fill\(id\)\}/);
  assert.doesNotMatch(appJsx, /onClick=\{\(\) => \{\s*fill\(id\);\s*submit/);
});
