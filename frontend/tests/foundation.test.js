import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Import design tokens
import {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  breakpoints,
  zIndex,
} from "../src/tokens/index.js";

test("design tokens export expected color scales and semantic definitions", () => {
  // Brand maritime colors
  assert.equal(colors.navy[700], "#0d3558");
  assert.equal(colors.navy[800], "#0a2c4b");
  assert.equal(colors.navy[500], "#20384c");
  assert.equal(colors.teal[600], "#10858c");
  assert.equal(colors.teal[700], "#08727a");
  assert.equal(colors.teal[50], "#e7f5f3");

  // Semantic surfaces
  assert.equal(colors.canvas, "#f5f7f9");
  assert.equal(colors.surface, "#ffffff");

  // Status feedback
  assert.equal(colors.status.success.text, "#21976a");
  assert.equal(colors.status.warning.text, "#b48731");
  assert.equal(colors.status.danger.text, "#c25f59");
  assert.equal(colors.status.info.text, "#427ca9");
});

test("design tokens define typography, spacing, radii, breakpoints, and shadows", () => {
  assert.ok(typography.fontFamily.sans.includes("Inter"));
  assert.equal(typography.fontSize.xs, "10px");
  assert.equal(typography.fontSize["4xl"], "27px");

  assert.equal(spacing[1], "4px");
  assert.equal(spacing[6], "24px");

  assert.equal(radii.sm, "7px");
  assert.equal(radii.md, "9px");
  assert.equal(radii.xl, "13px");

  assert.equal(breakpoints.sm, "480px");
  assert.equal(breakpoints.md, "760px");
  assert.equal(breakpoints.lg, "1050px");
  assert.equal(breakpoints.xl, "1200px");
  assert.equal(breakpoints["2xl"], "1500px");

  assert.ok(shadows.toast.includes("rgba(13, 53, 88"));
  assert.ok(shadows.modal.includes("rgba(0, 21, 43"));
  assert.equal(zIndex.modal, 50);
});

test("tokens.css declares custom properties and maintains legacy alias compatibility", async () => {
  const css = await readFile(
    new URL("../src/tokens/tokens.css", import.meta.url),
    "utf8",
  );

  // HarborX tokens
  assert.match(css, /--hx-color-navy-700:\s*#0d3558/);
  assert.match(css, /--hx-color-teal-600:\s*#10858c/);
  assert.match(css, /--hx-color-canvas:\s*var\(--hx-color-navy-50\)/);
  assert.match(css, /--hx-font-size-base:\s*13px/);
  assert.match(css, /--hx-radius-sm:\s*7px/);

  // Backward-compatibility legacy aliases
  assert.match(css, /--navy:\s*var\(--hx-color-navy-700\)/);
  assert.match(css, /--teal:\s*var\(--hx-color-teal-600\)/);
  assert.match(css, /--border:\s*var\(--hx-color-border-default\)/);
  assert.match(css, /--muted:\s*var\(--hx-color-text-muted\)/);
  assert.match(css, /--bg:\s*var\(--hx-color-canvas\)/);
  assert.match(css, /--ink:\s*var\(--hx-color-text-primary\)/);
});

test("styles.css imports tokens.css and establishes cascade fallback variables", async () => {
  const stylesCss = await readFile(
    new URL("../src/styles.css", import.meta.url),
    "utf8",
  );
  assert.match(stylesCss, /@import "\.\/tokens\/tokens\.css";/);
  assert.match(stylesCss, /--navy:\s*var\(--hx-color-navy-700,\s*#0d3558\);/);
  assert.match(stylesCss, /--teal:\s*var\(--hx-color-teal-600,\s*#10858c\);/);
});

test("reusable UI component files exist and export expected component interfaces", async () => {
  const expectedFiles = [
    "Button.jsx",
    "Input.jsx",
    "Card.jsx",
    "Badge.jsx",
    "Modal.jsx",
    "LoadingIndicator.jsx",
    "EmptyState.jsx",
    "PageContainer.jsx",
    "index.js",
  ];

  for (const file of expectedFiles) {
    const content = await readFile(
      new URL(`../src/components/ui/${file}`, import.meta.url),
      "utf8",
    );
    assert.ok(content.length > 0, `Expected ${file} to have content`);
  }

  // Check barrel index.js exports
  const indexJs = await readFile(
    new URL("../src/components/ui/index.js", import.meta.url),
    "utf8",
  );
  assert.match(
    indexJs,
    /export\s+\{\s*Button\s*\}\s+from\s+["']\.\/Button\.jsx["'];/,
  );
  assert.match(
    indexJs,
    /export\s+\{\s*Input\s*\}\s+from\s+["']\.\/Input\.jsx["'];/,
  );
  assert.match(indexJs, /export\s*\{\s*Card,/);
  assert.match(
    indexJs,
    /export\s+\{\s*Badge\s*\}\s+from\s+["']\.\/Badge\.jsx["'];/,
  );
  assert.match(
    indexJs,
    /export\s+\{\s*Modal\s*\}\s+from\s+["']\.\/Modal\.jsx["'];/,
  );
  assert.match(
    indexJs,
    /export\s+\{\s*LoadingIndicator\s*\}\s+from\s+["']\.\/LoadingIndicator\.jsx["'];/,
  );
  assert.match(
    indexJs,
    /export\s+\{\s*EmptyState\s*\}\s+from\s+["']\.\/EmptyState\.jsx["'];/,
  );
  assert.match(indexJs, /export\s*\{\s*PageContainer,/);
});
