import { test } from "node:test";
import assert from "node:assert/strict";
import { stat, readFile } from "node:fs/promises";

test("screen component files exist in frontend/src/screens", async () => {
  const files = [
    "OverviewScreen.jsx",
    "AuctionsScreen.jsx",
    "CatchesScreen.jsx",
    "BidsScreen.jsx",
    "WonLotsScreen.jsx",
    "PaymentsScreen.jsx",
    "UsersScreen.jsx",
    "ReportsScreen.jsx",
    "ActivityScreen.jsx",
    "SettingsScreen.jsx",
    "index.js",
  ];

  for (const file of files) {
    const fileStat = await stat(
      new URL(`../src/screens/${file}`, import.meta.url),
    );
    assert.ok(fileStat.isFile(), `${file} should exist as a regular file`);
  }
});

test("screens index.js barrel exports all 9 screen components", async () => {
  const indexCode = await readFile(
    new URL("../src/screens/index.js", import.meta.url),
    "utf8",
  );

  assert.match(indexCode, /export\s+\{\s*OverviewScreen\s*\}\s+from\s+["']\.\/OverviewScreen\.jsx["']/);
  assert.match(indexCode, /export\s+\{\s*AuctionsScreen\s*\}\s+from\s+["']\.\/AuctionsScreen\.jsx["']/);
  assert.match(indexCode, /export\s+\{\s*CatchesScreen\s*\}\s+from\s+["']\.\/CatchesScreen\.jsx["']/);
  assert.match(indexCode, /export\s+\{\s*BidsScreen\s*\}\s+from\s+["']\.\/BidsScreen\.jsx["']/);
  assert.match(indexCode, /export\s+\{\s*WonLotsScreen\s*\}\s+from\s+["']\.\/WonLotsScreen\.jsx["']/);
  assert.match(indexCode, /export\s+\{\s*PaymentsScreen\s*\}\s+from\s+["']\.\/PaymentsScreen\.jsx["']/);
  assert.match(indexCode, /export\s+\{\s*UsersScreen\s*\}\s+from\s+["']\.\/UsersScreen\.jsx["']/);
  assert.match(indexCode, /export\s+\{\s*ReportsScreen\s*\}\s+from\s+["']\.\/ReportsScreen\.jsx["']/);
  assert.match(indexCode, /export\s+\{\s*ActivityScreen\s*\}\s+from\s+["']\.\/ActivityScreen\.jsx["']/);
  assert.match(indexCode, /export\s+\{\s*SettingsScreen\s*\}\s+from\s+["']\.\/SettingsScreen\.jsx["']/);
});

test("domain component files exist and export expected components", async () => {
  const domainIndex = await readFile(
    new URL("../src/components/domain/index.js", import.meta.url),
    "utf8",
  );

  assert.match(domainIndex, /export\s+\{\s*LotCard\s*\}\s+from\s+["']\.\/LotCard\.jsx["']/);
  assert.match(domainIndex, /export\s+\{\s*AuctionList\s*\}\s+from\s+["']\.\/AuctionList\.jsx["']/);
  assert.match(domainIndex, /export\s+\{\s*ActivityList\s*\}\s+from\s+["']\.\/ActivityList\.jsx["']/);
  assert.match(domainIndex, /export\s+\{\s*FishArt\s*\}\s+from\s+["']\.\/FishArt\.jsx["']/);
  assert.match(domainIndex, /export\s+\{\s*HarborArt\s*\}\s+from\s+["']\.\/HarborArt\.jsx["']/);
  assert.match(domainIndex, /export\s+\{\s*Timer\s*\}\s+from\s+["']\.\/Timer\.jsx["']/);
});

test("OverviewScreen.jsx includes PageHeader, hero banner, stats grid, and pipeline", async () => {
  const code = await readFile(
    new URL("../src/screens/OverviewScreen.jsx", import.meta.url),
    "utf8",
  );

  assert.match(code, /PageHeader/);
  assert.match(code, /PageTitle/);
  assert.match(code, /Welcome back/);
  assert.match(code, /hero-banner/);
  assert.match(code, /stats-grid/);
  assert.match(code, /overview-grid/);
  assert.match(code, /pipeline/);
  assert.match(code, /HarborArt/);
  assert.match(code, /LotCard/);
  assert.match(code, /ActivityList/);
});

test("AuctionsScreen.jsx and CatchesScreen.jsx integrate AuctionList and DraftPanel", async () => {
  const auctionsCode = await readFile(
    new URL("../src/screens/AuctionsScreen.jsx", import.meta.url),
    "utf8",
  );
  assert.match(auctionsCode, /AuctionList/);
  assert.match(auctionsCode, /PageHeader/);
  assert.match(auctionsCode, /Auctions/);

  const catchesCode = await readFile(
    new URL("../src/screens/CatchesScreen.jsx", import.meta.url),
    "utf8",
  );
  assert.match(catchesCode, /AuctionList/);
  assert.match(catchesCode, /DraftPanel/);
  assert.match(catchesCode, /Register catch/);
  assert.match(catchesCode, /FROM YOUR BOAT TO THE MARKET/);
});

test("BidsScreen.jsx and WonLotsScreen.jsx support bid history and won lots", async () => {
  const bidsCode = await readFile(
    new URL("../src/screens/BidsScreen.jsx", import.meta.url),
    "utf8",
  );
  assert.match(bidsCode, /table-wrap/);
  assert.match(bidsCode, /Your bid history/);
  assert.match(bidsCode, /Badge/);
  assert.match(bidsCode, /EmptyState/);

  const wonCode = await readFile(
    new URL("../src/screens/WonLotsScreen.jsx", import.meta.url),
    "utf8",
  );
  assert.match(wonCode, /Won lots/);
  assert.match(wonCode, /AuctionList/);
});

test("PaymentsScreen.jsx includes metric stat cards, invoice table, and status filters", async () => {
  const code = await readFile(
    new URL("../src/screens/PaymentsScreen.jsx", import.meta.url),
    "utf8",
  );

  assert.match(code, /Total invoice value/);
  assert.match(code, /Payments recorded/);
  assert.match(code, /Outstanding balance/);
  assert.match(code, /Auction invoices/);
  assert.match(code, /table-wrap/);
  assert.match(code, /Badge/);
});

test("UsersScreen.jsx includes search, role formatting, verification, and action buttons", async () => {
  const code = await readFile(
    new URL("../src/screens/UsersScreen.jsx", import.meta.url),
    "utf8",
  );

  assert.match(code, /User management/);
  assert.match(code, /search-box/);
  assert.match(code, /table-wrap/);
  assert.match(code, /Verify/);
  assert.match(code, /Disable/);
  assert.match(code, /ROLES_LABEL/);
});

test("ReportsScreen.jsx includes turnover metrics, species volume, and harbor summary", async () => {
  const code = await readFile(
    new URL("../src/screens/ReportsScreen.jsx", import.meta.url),
    "utf8",
  );

  assert.match(code, /Auction turnover/);
  assert.match(code, /Catch volume by species/);
  assert.match(code, /bar-chart/);
  assert.match(code, /Harbor summary/);
  assert.match(code, /Export CSV/);
});

test("ActivityScreen.jsx and SettingsScreen.jsx include timeline and codified harbor rules", async () => {
  const actCode = await readFile(
    new URL("../src/screens/ActivityScreen.jsx", import.meta.url),
    "utf8",
  );
  assert.match(actCode, /Workspace activity/);
  assert.match(actCode, /ActivityList/);
  assert.match(actCode, /Refresh/);

  const setCode = await readFile(
    new URL("../src/screens/SettingsScreen.jsx", import.meta.url),
    "utf8",
  );
  assert.match(setCode, /Account profile/);
  assert.match(setCode, /Save changes/);
  assert.match(setCode, /Auction rules/);
  assert.match(setCode, /Prices are per kilogram/);
  assert.match(setCode, /Offline drafts, online bidding/);
});

test("App.jsx imports and integrates modernized screen components", async () => {
  const appCode = await readFile(
    new URL("../src/App.jsx", import.meta.url),
    "utf8",
  );

  assert.match(appCode, /OverviewScreen/);
  assert.match(appCode, /AuctionsScreen/);
  assert.match(appCode, /CatchesScreen/);
  assert.match(appCode, /BidsScreen/);
  assert.match(appCode, /WonLotsScreen/);
  assert.match(appCode, /PaymentsScreen/);
  assert.match(appCode, /UsersScreen/);
  assert.match(appCode, /ReportsScreen/);
  assert.match(appCode, /ActivityScreen/);
  assert.match(appCode, /SettingsScreen/);
});
