import "fake-indexeddb/auto";
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { DraftVault, activeOfflineOwner, verifyDraftOwner, revokeOfflineAccess } from "../src/draft-store.js";

const values = new Map();
globalThis.localStorage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: key => values.delete(key),
};
const secret = "test-only-local-vault-passphrase";
const owner = () => ({ id: randomUUID(), role: "seller" });
const draft = () => ({ client_id: randomUUID(), species: "Yellowfin Tuna", weight: 42, boat_name: "Private test boat" });
async function fixture() {
  const seller = owner();
  const vault = new DraftVault(seller);
  await vault.create(secret);
  return { seller, vault };
}
async function rawDrafts() {
  const request = indexedDB.open("harborx-offline-v1", 1);
  const database = await new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const result = database.transaction("drafts").objectStore("drafts").getAll();
  return new Promise(resolve => { result.onsuccess = () => { database.close(); resolve(result.result); }; });
}

test("encrypted IndexedDB drafts survive a new vault instance and reject wrong passphrases", async () => {
  const { seller, vault } = await fixture();
  const data = draft();
  await vault.save(data);
  vault.lock();
  const reopened = new DraftVault(seller);
  await assert.rejects(reopened.unlock("wrong"), /incorrect/);
  await reopened.unlock(secret);
  assert.equal((await reopened.list())[0].client_id, data.client_id);
  const stored = (await rawDrafts()).find(record => record.ownerId === seller.id);
  assert.ok(stored.ciphertext instanceof ArrayBuffer);
  assert.ok(!JSON.stringify(stored).includes(data.boat_name));
});

test("legacy migration preserves IDs and removes plaintext only after a successful commit", async () => {
  const seller = owner();
  const data = draft();
  const name = `harborx-drafts-${seller.id}`;
  localStorage.setItem(name, JSON.stringify([data]));
  const vault = new DraftVault(seller);
  await vault.create(secret);
  assert.equal(localStorage.getItem(name), null);
  assert.equal((await vault.list())[0].client_id, data.client_id);
  // A repeated migration cannot overwrite an existing confirmed local record.
  await vault.save({ ...data, state: "synced" });
  localStorage.setItem(name, JSON.stringify([data]));
  await vault.migrate();
  assert.equal((await vault.list())[0].state, "synced");
});

test("invalid legacy data is retained for recovery", async () => {
  const { seller, vault } = await fixture();
  const name = `harborx-drafts-${seller.id}`;
  localStorage.setItem(name, "invalid-json");
  await assert.rejects(vault.migrate());
  assert.equal(localStorage.getItem(name), "invalid-json");
});

test("migration write failures retain the entire original localStorage copy", async () => {
  const { seller, vault } = await fixture();
  const name = `harborx-drafts-${seller.id}`;
  const original = JSON.stringify([draft(), draft()]);
  localStorage.setItem(name, original);
  const add = IDBObjectStore.prototype.add;
  IDBObjectStore.prototype.add = () => { throw new DOMException("Quota exceeded", "QuotaExceededError"); };
  try { await assert.rejects(vault.migrate(), /Quota exceeded/); }
  finally { IDBObjectStore.prototype.add = add; }
  assert.equal(localStorage.getItem(name), original);
  await vault.migrate();
  assert.equal((await vault.list()).length, 2);
});

test("an expired in-memory local lease locks access without deleting records", async () => {
  const { seller, vault } = await fixture();
  await vault.save(draft());
  vault.grantUntil = Date.now() - 1;
  await assert.rejects(vault.list(), /expired/);
  assert.equal(vault.key, null);
  await verifyDraftOwner(seller);
  await vault.unlock(secret);
  assert.equal((await vault.list()).length, 1);
});

test("manual synchronization retains failures and retries the same ID after a lost response", async () => {
  const { seller, vault } = await fixture();
  const data = draft();
  await vault.save(data);
  const serverRecords = new Set();
  let first = true;
  const upload = async body => {
    serverRecords.add(body.client_id);
    assert.equal(body.state, undefined);
    if (first) { first = false; throw new Error("Response lost after commit"); }
    return { lot: { id: body.client_id }, duplicate: true };
  };
  await assert.rejects(vault.sync(upload, async () => seller), /Response lost/);
  assert.equal((await vault.list())[0].state, "failed");
  assert.equal((await vault.list())[0].client_id, data.client_id);
  assert.equal(await vault.sync(upload, async () => seller), 1);
  assert.equal((await vault.list())[0].state, "synced");
  assert.equal(serverRecords.size, 1);
  assert.equal(await vault.sync(() => { throw new Error("Must not re-upload synced draft"); }, async () => seller), 0);
});

test("interrupted syncing recovers as failed and never discards the draft", async () => {
  const { seller, vault } = await fixture();
  await vault.save({ ...draft(), state: "syncing" });
  vault.lock();
  const reopened = new DraftVault(seller);
  await reopened.unlock(secret);
  assert.equal((await reopened.list())[0].state, "failed");
});

test("a storage write failure cannot remove an existing draft", async () => {
  const { vault } = await fixture();
  const data = draft();
  await vault.save(data);
  const put = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = () => { throw new DOMException("Quota exceeded", "QuotaExceededError"); };
  try { await assert.rejects(vault.save({ ...data, weight: 99 }), /Quota exceeded/); }
  finally { IDBObjectStore.prototype.put = put; }
  assert.equal((await vault.list())[0].weight, 42);
});

test("server session errors and account mismatches prevent uploads without losing drafts", async () => {
  const { vault } = await fixture();
  await vault.save(draft());
  let uploads = 0;
  const upload = async () => { uploads++; };
  await assert.rejects(vault.sync(upload, async () => { throw Object.assign(new Error("Expired session"), { status: 401 }); }), /Expired/);
  await assert.rejects(vault.sync(upload, async () => owner()), /owns these drafts/);
  assert.equal(uploads, 0);
  assert.equal((await vault.list())[0].state, "pending");
  assert.throws(() => new DraftVault({ id: randomUUID(), role: "buyer" }), /Seller/);
});

test("account changes and logout revoke offline unlock while retaining encrypted records", async () => {
  const { seller, vault } = await fixture();
  await vault.save(draft());
  await verifyDraftOwner({ id: randomUUID(), role: "buyer" });
  assert.equal(await activeOfflineOwner(), null);
  await assert.rejects(new DraftVault(seller).unlock(secret), /Reconnect/);
  await verifyDraftOwner(seller);
  const restored = new DraftVault(seller);
  await restored.unlock(secret);
  assert.equal((await restored.list()).length, 1);
  await revokeOfflineAccess();
  await assert.rejects(new DraftVault(seller).unlock(secret), /Reconnect/);
});

test("concurrent sync clicks are rejected and unknown server confirmations remain failed", async () => {
  const { seller, vault } = await fixture();
  await vault.save(draft());
  let finish;
  const first = vault.sync(() => new Promise(resolve => { finish = resolve; }), async () => seller);
  await assert.rejects(vault.sync(async () => {}, async () => seller), /already running/);
  while (!finish) await new Promise(resolve => setTimeout(resolve, 1));
  finish({ lot: { id: randomUUID() } });
  await assert.rejects(first, /did not confirm/);
  assert.equal((await vault.list())[0].state, "failed");
});
