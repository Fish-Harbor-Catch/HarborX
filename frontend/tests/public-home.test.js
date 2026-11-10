import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import postcss from "postcss";

test("public homepage CSS cannot select authentication or workspace elements", async () => {
  const source = await readFile(
    new URL("../src/features/public/public-home.css", import.meta.url),
    "utf8",
  );
  const sheet = postcss.parse(source);
  let rules = 0;
  sheet.walkRules((rule) => {
    if (rule.parent.type === "atrule" && rule.parent.name === "keyframes")
      return;
    for (const selector of rule.selectors) {
      assert.match(selector, /^\.hx-public(?:\s|$|:)/, selector);
      rules++;
    }
  });
  assert.ok(rules > 0);
  sheet.walkAtRules("keyframes", (rule) =>
    assert.match(rule.params, /^hx-public-/),
  );
});
