import { test } from "node:test";
import assert from "node:assert/strict";
import {
  safePath,
  safeDetails,
  installNavigationDebug,
} from "../src/app/debug/navigation-debug.js";

test("navigation trace excludes arbitrary history, account data and URL parameters", () => {
  assert.equal(
    safePath("/seller/catches?token=secret#personal"),
    "/seller/catches",
  );
  assert.equal(safePath("/customer/private-name"), "[unknown]");
  assert.equal(safePath("https://private.example/login"), "[unknown]");
  assert.deepEqual(
    safeDetails({
      role: "seller",
      ready: false,
      destination: "/login?password=secret",
      reason: "guest",
      password: "secret",
      token: "secret",
      user: { email: "personal" },
      state: { usr: { private: "secret" } },
      phase: "secret",
    }),
    { destination: "/login", reason: "guest", role: "seller", ready: false },
  );
});

test("navigation diagnostics do nothing unless explicitly enabled in this tab", () => {
  installNavigationDebug({ sessionStorage: { getItem: () => null } });
  installNavigationDebug({
    sessionStorage: {
      getItem: () => {
        throw Error("blocked");
      },
    },
  });
});
