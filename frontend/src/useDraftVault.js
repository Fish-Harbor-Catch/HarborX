import { useEffect, useMemo, useState } from "react";
import { DraftVault } from "./draft-store.js";

export function useDraftVault(owner) {
  const vault = useMemo(
    () => (owner?.role === "seller" ? new DraftVault(owner) : null),
    [owner?.id, owner?.role],
  );
  const [drafts, setDrafts] = useState([]);
  const [exists, setExists] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let current = true;
    setDrafts([]);
    setUnlocked(false);
    setExists(null);
    setError("");
    vault
      ?.exists()
      .then((value) => {
        if (current) setExists(value);
      })
      .catch(() => {
        if (current)
          setError(
            "Local storage is unavailable. Existing drafts have not been deleted.",
          );
      });
    return () => {
      current = false;
      vault?.lock();
    };
  }, [vault]);
  useEffect(() => {
    if (!unlocked || !vault) return;
    const lock = () => {
      if (Date.now() >= vault.grantUntil) {
        vault.lock();
        setDrafts([]);
        setUnlocked(false);
        setError(
          "Local access expired. Reconnect and sign in again. Drafts are retained.",
        );
      }
    };
    const timer = setInterval(lock, 15000);
    document.addEventListener("visibilitychange", lock);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", lock);
    };
  }, [unlocked, vault]);
  const reload = async () => {
    if (vault?.key) setDrafts(await vault.list());
  };
  return {
    drafts,
    exists,
    unlocked,
    error,
    busy,
    async unlock(passphrase) {
      setBusy(true);
      setError("");
      try {
        if (exists) await vault.unlock(passphrase);
        else await vault.create(passphrase);
        setExists(true);
        setUnlocked(true);
        await reload();
        // Best effort only: browsers may still evict data or users may clear it.
        navigator.storage?.persist?.().catch(() => {});
      } catch (error) {
        setError(error.message);
        setExists(await vault.exists().catch(() => null));
        if (vault.key) {
          setUnlocked(true);
          await reload().catch(() => {});
        }
      } finally {
        setBusy(false);
      }
    },
    lock() {
      vault?.lock();
      setDrafts([]);
      setUnlocked(false);
    },
    async save(draft) {
      if (!vault || !unlocked)
        throw new Error(
          "Enable and unlock local drafts in My catches before saving on this device.",
        );
      if (vault.syncing)
        throw new Error(
          "Wait for synchronization to finish before changing drafts.",
        );
      await vault.save({ ...draft, state: "pending", failure: "" });
      await reload();
    },
    async remove(id) {
      await vault.remove(id);
      await reload();
    },
    async sync(upload, verify) {
      setBusy(true);
      try {
        return await vault.sync(upload, verify, reload);
      } finally {
        setBusy(false);
        await reload();
      }
    },
  };
}
