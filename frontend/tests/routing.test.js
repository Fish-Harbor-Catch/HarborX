import { test } from "node:test";
import assert from "node:assert/strict";
import {
  WORKSPACE_ROUTES,
  workspaceRoute,
  pagePath,
  loginDestination,
} from "../src/app/route-config.js";
import {
  ROLE_NAV_ITEMS,
  SECONDARY_NAV_ITEMS,
} from "../src/components/layout/nav-config.js";

test("every existing role destination has one unique URL with matching permissions", () => {
  assert.equal(
    new Set(WORKSPACE_ROUTES.map(({ path }) => path)).size,
    WORKSPACE_ROUTES.length,
  );
  for (const [role, pages] of Object.entries(ROLE_NAV_ITEMS)) {
    for (const page of [...pages, ...SECONDARY_NAV_ITEMS]) {
      const path = pagePath(role, page);
      assert.ok(path, `${role}: ${page}`);
      assert.deepEqual(workspaceRoute(path), { path, role, page });
    }
    assert.equal(pagePath(role), `/${role}/dashboard`);
  }
  assert.equal(pagePath("seller", "users"), undefined);
  assert.equal(pagePath("buyer", "catches"), undefined);
  assert.equal(workspaceRoute("/seller/missing"), undefined);
});

test("post-login destinations preserve valid deep links but reject foreign roles and external URLs", () => {
  const user = { role: "buyer" };
  assert.equal(
    loginDestination(user, "/buyer/auctions?status=live#lots"),
    "/buyer/auctions?status=live#lots",
  );
  for (const from of [
    undefined,
    "/seller/catches",
    "/admin/users",
    "/buyer/unknown",
    "/login",
    "/register",
    "https://example.com",
    "//example.com",
    "/\\[",
    "/\\example.com/buyer/auctions",
    { pathname: "/buyer/auctions" },
  ]) {
    assert.equal(loginDestination(user, from), "/buyer/dashboard");
  }
});
