import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

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

test("demo accounts remain available through the seed data", async () => {
  const seed = await readFile(
    new URL("../../backend/src/seed.js", import.meta.url),
    "utf8"
  );
  for (const role of ["seller", "buyer", "admin"]) {
    assert.ok(seed.includes(`${role}@harborx.demo`));
  }
  assert.match(seed, /HarborXDemo2026!/);
});
