import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { pwaOptions } from "../pwa.config.js";

test("manifest has stable identity, standalone scope and real correctly sized icons", async () => {
  const manifest = pwaOptions.manifest;
  assert.equal(manifest.id, "/");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.display, "standalone");
  assert.ok(manifest.name.includes("HarborX"));
  for (const icon of manifest.icons) {
    const filePath = fileURLToPath(new URL(`../public${icon.src}`, import.meta.url));
    const metadata = await sharp(filePath).metadata();
    assert.equal(`${metadata.width}x${metadata.height}`, icon.sizes);
    assert.equal(metadata.format, "png");
  }
  const applePath = fileURLToPath(new URL("../public/icons/apple-touch-icon.png", import.meta.url));
  const apple = await sharp(applePath).metadata();
  assert.equal(apple.width, 180);
});

test("shell caching excludes API navigation, runtime data and automatic update activation", async () => {
  assert.ok(pwaOptions.workbox.navigateFallbackDenylist.some(pattern => pattern.test("/api/auth/me")));
  assert.ok(pwaOptions.workbox.navigateFallbackDenylist.some(pattern => pattern.test("/api")));
  assert.equal(pwaOptions.workbox.navigateFallback, "index.html");
  assert.deepEqual(pwaOptions.workbox.runtimeCaching, []);
  assert.equal(pwaOptions.workbox.skipWaiting, false);
  assert.equal(pwaOptions.workbox.clientsClaim, false);
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /apple-touch-icon/);
  assert.match(html, /viewport-fit=cover/);
});
