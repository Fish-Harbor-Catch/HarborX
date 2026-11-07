// Only encrypted seller drafts and a local access lease live in IndexedDB.
// The vault key stays in memory. It is unrelated to the server session cookie.
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const LEASE_MS = 12 * 60 * 60 * 1000;
const DATABASE = "harborx-offline-v1";
let connection;
const source = Math.random().toString(36);
export function announceAccountChange() {
  if (typeof BroadcastChannel === "undefined") return;
  const channel = new BroadcastChannel("harborx-account");
  channel.postMessage(source);
  channel.close();
}
export function listenAccountChanges(callback) {
  if (typeof BroadcastChannel === "undefined") return () => {};
  const channel = new BroadcastChannel("harborx-account");
  channel.onmessage = (event) => {
    if (event.data !== source) callback();
  };
  return () => channel.close();
}

function openDatabase() {
  if (!connection)
    connection = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore("vaults", { keyPath: "ownerId" });
        request.result.createObjectStore("drafts", { keyPath: "key" });
        request.result.createObjectStore("settings");
      };
      request.onsuccess = () => {
        request.result.onversionchange = () => {
          request.result.close();
          connection = null;
        };
        resolve(request.result);
      };
      request.onerror = () => {
        connection = null;
        reject(request.error);
      };
      request.onblocked = () => {
        connection = null;
        reject(new Error("Close other HarborX windows to open local storage."));
      };
    });
  return connection;
}

async function transaction(stores, mode, operation) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(stores, mode);
    const result = operation(tx);
    tx.oncomplete = () => resolve(result?.result);
    tx.onerror = tx.onabort = () =>
      reject(tx.error || new Error("Local storage could not be saved."));
  });
}
const get = (store, key) =>
  transaction([store], "readonly", (tx) => tx.objectStore(store).get(key));
const put = (store, value, key) =>
  transaction([store], "readwrite", (tx) =>
    tx.objectStore(store).put(value, key),
  );
const all = (store) =>
  transaction([store], "readonly", (tx) => tx.objectStore(store).getAll());

async function derive(passphrase, salt) {
  const material = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 310000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}
async function encrypt(key, value, context) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: encoder.encode(context) },
    key,
    encoder.encode(JSON.stringify(value)),
  );
  return { iv, ciphertext };
}
async function decrypt(key, value, context) {
  return JSON.parse(
    decoder.decode(
      await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: value.iv,
          additionalData: encoder.encode(context),
        },
        key,
        value.ciphertext,
      ),
    ),
  );
}
function seller(owner) {
  if (!owner?.id || owner.role !== "seller")
    throw new Error("Seller access is required for local drafts.");
}

export async function activeOfflineOwner() {
  const id = await get("settings", "active");
  const vault = id && (await get("vaults", id));
  return vault
    ? {
        id,
        role: "seller",
        name: "Local seller",
        expired: vault.grantUntil < Date.now(),
      }
    : null;
}

// Call only after a successful server login or /auth/me response.
export async function verifyDraftOwner(owner) {
  const previous = await get("settings", "active");
  if (previous && previous !== owner.id) await revokeOfflineAccess();
  if (owner.role !== "seller") return;
  const vault = await get("vaults", owner.id);
  if (vault) {
    await put("vaults", { ...vault, grantUntil: Date.now() + LEASE_MS });
    await put("settings", owner.id, "active");
  }
}

export async function revokeOfflineAccess() {
  const id = await get("settings", "active");
  if (id) {
    const vault = await get("vaults", id);
    if (vault) await put("vaults", { ...vault, grantUntil: 0 });
  }
  await put("settings", null, "active");
}

export class DraftVault {
  constructor(owner) {
    seller(owner);
    this.owner = owner;
    this.key = null;
    this.syncing = false;
  }
  async exists() {
    return Boolean(await get("vaults", this.owner.id));
  }
  lock() {
    this.key = null;
  }
  async create(passphrase) {
    if (!crypto.subtle)
      throw new Error("Offline drafts require HTTPS or localhost.");
    if (passphrase.length < 12)
      throw new Error(
        "Use a separate local passphrase of at least 12 characters.",
      );
    if (await this.exists())
      throw new Error(
        "This seller already has a vault. Unlock it with its local passphrase.",
      );
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await derive(passphrase, salt);
    const check = await encrypt(key, "HarborX local drafts", this.owner.id);
    // add prevents another tab from accidentally replacing an existing vault.
    await transaction(["vaults", "settings"], "readwrite", (tx) => {
      tx.objectStore("vaults").add({
        ownerId: this.owner.id,
        salt,
        check,
        grantUntil: Date.now() + LEASE_MS,
      });
      tx.objectStore("settings").put(this.owner.id, "active");
    });
    this.key = key;
    this.grantUntil = Date.now() + LEASE_MS;
    await this.migrate();
  }
  async unlock(passphrase) {
    const vault = await get("vaults", this.owner.id);
    if (!vault || vault.grantUntil < Date.now())
      throw new Error(
        "Reconnect and sign in to renew local draft access. Your drafts are retained.",
      );
    const key = await derive(passphrase, vault.salt);
    try {
      if (
        (await decrypt(key, vault.check, this.owner.id)) !==
        "HarborX local drafts"
      )
        throw new Error();
    } catch {
      throw new Error(
        "The local passphrase is incorrect or local storage is damaged.",
      );
    }
    this.key = key;
    this.grantUntil = vault.grantUntil;
    await this.migrate();
    // A terminated app may have left an upload in progress. Require a manual retry.
    for (const draft of await this.list()) {
      if (draft.state === "syncing")
        await this.save({
          ...draft,
          state: "failed",
          failure:
            "Previous upload was interrupted. Retry manually; the catch ID is unchanged.",
        });
    }
  }
  requireKey() {
    if (!this.key)
      throw new Error("Unlock your local drafts before saving on this device.");
    if (this.grantUntil < Date.now()) {
      this.lock();
      throw new Error(
        "Local draft access expired. Reconnect, sign in, and unlock again. Drafts are retained.",
      );
    }
    return this.key;
  }
  async list() {
    const key = this.requireKey();
    const records = (await all("drafts")).filter(
      (record) => record.ownerId === this.owner.id,
    );
    return Promise.all(
      records.map((record) => decrypt(key, record, record.key)),
    );
  }
  async save(draft) {
    const key = this.requireKey();
    if (!draft.client_id)
      throw new Error("A draft must retain its client-generated catch ID.");
    const id = `${this.owner.id}:${draft.client_id}`;
    const data = {
      ...draft,
      state: draft.state || "pending",
      updatedAt: new Date().toISOString(),
    };
    const sealed = await encrypt(key, data, id);
    await put("drafts", { key: id, ownerId: this.owner.id, ...sealed });
    return data;
  }
  async remove(id) {
    this.requireKey();
    if (this.syncing)
      throw new Error(
        "Wait until synchronization finishes before removing drafts.",
      );
    await transaction(["drafts"], "readwrite", (tx) =>
      tx.objectStore("drafts").delete(`${this.owner.id}:${id}`),
    );
  }
  async migrate(storage = globalThis.localStorage) {
    const name = `harborx-drafts-${this.owner.id}`;
    const raw = storage?.getItem(name);
    if (!raw) return;
    const legacy = JSON.parse(raw);
    if (!Array.isArray(legacy))
      throw new Error(
        "Legacy drafts could not be read. The original copy is retained.",
      );
    const existing = new Set((await all("drafts")).map((record) => record.key));
    const records = [];
    for (const draft of legacy) {
      if (!draft.client_id)
        throw new Error(
          "A legacy draft has no catch ID. The original copy is retained for recovery.",
        );
      const id = `${this.owner.id}:${draft.client_id}`;
      if (existing.has(id)) continue;
      existing.add(id);
      records.push({
        key: id,
        ownerId: this.owner.id,
        ...(await encrypt(
          this.requireKey(),
          { ...draft, state: "pending" },
          id,
        )),
      });
    }
    await transaction(["drafts"], "readwrite", (tx) => {
      for (const record of records) tx.objectStore("drafts").add(record);
    });
    // Remove the plaintext copy only AFTER the encrypted transaction commits.
    storage.removeItem(name);
  }
  async sync(upload, verify, changed = () => {}) {
    if (this.syncing)
      throw new Error("Draft synchronization is already running.");
    this.requireKey();
    this.syncing = true;
    let count = 0;
    try {
      const owner = await verify();
      if (owner.id !== this.owner.id || owner.role !== "seller")
        throw new Error(
          "Sign in as the seller who owns these drafts before syncing.",
        );
      for (const draft of await this.list()) {
        if (draft.state === "synced") continue;
        const active = await this.save({
          ...draft,
          state: "syncing",
          failure: "",
        });
        await changed();
        try {
          const { state, failure, updatedAt, syncedAt, ...body } = active;
          const result = await upload(body);
          if (result?.lot?.id !== draft.client_id)
            throw new Error(
              "The server did not confirm this catch ID. Retry manually.",
            );
          await this.save({
            ...active,
            state: "synced",
            syncedAt: new Date().toISOString(),
            failure: "",
          });
          count++;
        } catch (error) {
          // Keep the draft and its ID even when the response was lost after commit.
          await this.save({
            ...active,
            state: "failed",
            failure: error.message,
          });
          throw error;
        } finally {
          await changed();
        }
      }
      return count;
    } finally {
      this.syncing = false;
    }
  }
}
