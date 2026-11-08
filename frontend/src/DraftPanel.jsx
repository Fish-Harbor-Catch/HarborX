import React, { useState } from "react";
import { useDraftVault } from "./useDraftVault.js";
import { useLanguage } from "./i18n.jsx";

export function DraftPanel({
  store,
  online = false,
  allowSetup = false,
  onSync,
  onEdit,
  authorize,
}) {
  const { t } = useLanguage();
  const [passphrase, setPassphrase] = useState("");
  const [message, setMessage] = useState("");

  return (
    <section className="panel local-drafts" aria-label={t("draft_panel_title", "Local catch drafts")}>
      <div className="section-heading">
        <div>
          <h2>{t("draft_panel_title", "Local catch drafts")}</h2>
          <p>{t("draft_panel_desc", "Encrypted on this device. Upload only when you choose Sync.")}</p>
        </div>
        {store.unlocked && (
          <button
            className="btn secondary"
            disabled={store.busy}
            onClick={store.lock}
          >
            {t("action_lock_drafts", "Lock drafts")}
          </button>
        )}
      </div>
      <p>
        {t("draft_panel_notice", "Use a separate local passphrase, not your account password. It cannot be recovered. Offline access must be renewed online every 12 hours. Shared devices should use separate browser profiles.")}
      </p>
      {!store.unlocked &&
        store.exists !== null &&
        (store.exists || allowSetup) && (
          <form
            className="vault-form"
            onSubmit={async (event) => {
              event.preventDefault();
              const secret = passphrase;
              setPassphrase("");
              try {
                if (authorize && online) await authorize();
                await store.unlock(secret);
              } catch (error) {
                setMessage(error.message);
              }
            }}
          >
            <label>
              {store.exists
                ? t("draft_field_passphrase_cur", "Local draft passphrase")
                : t("draft_field_passphrase_new", "Create local draft passphrase")}
              <input
                aria-label={t("draft_field_passphrase_cur", "Local draft passphrase")}
                type="password"
                autoComplete={
                  store.exists ? "current-password" : "new-password"
                }
                minLength={store.exists ? 1 : 12}
                maxLength={256}
                required
                value={passphrase}
                onChange={(event) => setPassphrase(event.target.value)}
              />
            </label>
            <button className="btn primary" disabled={store.busy}>
              {store.busy
                ? t("action_opening", "Opening…")
                : store.exists
                  ? t("action_unlock_drafts", "Unlock drafts")
                  : t("action_enable_offline_drafts", "Enable offline drafts")}
            </button>
          </form>
        )}
      {(store.error || message) && (
        <p role="alert" className="alert error">
          {store.error || message}
        </p>
      )}
      {store.unlocked && (
        <>
          {onSync && (
            <button
              className="btn primary"
              disabled={
                !online ||
                store.busy ||
                !store.drafts.some((d) => d.state !== "synced")
              }
              onClick={onSync}
            >
              {t("action_sync_pending_drafts", "Sync pending drafts")}
            </button>
          )}
          {store.drafts.length === 0 && <p>{t("draft_empty", "No drafts saved for this seller.")}</p>}
          {store.drafts.map((draft) => (
            <article className="draft-row" key={draft.client_id}>
              <div>
                <strong>
                  {draft.species} · {draft.weight} kg
                </strong>
                <small>
                  {draft.boat_name} ·{" "}
                  <span className={`draft-state ${draft.state}`}>
                    {draft.state === "synced"
                      ? t("draft_state_synced", "Synced")
                      : draft.state === "pending"
                        ? t("draft_state_pending", "Pending upload")
                        : t("draft_state_failed", "Upload failed")}
                  </span>
                </small>
                {draft.failure && <small role="status">{draft.failure}</small>}
              </div>
              {onEdit && draft.state === "pending" && (
                <button
                  className="btn secondary"
                  disabled={store.busy}
                  onClick={() => onEdit(draft)}
                >
                  {t("action_edit_catch", "Edit")}
                </button>
              )}
              <button
                className="text-btn danger"
                disabled={store.busy}
                onClick={async () => {
                  if (
                    !window.confirm(
                      draft.state === "synced"
                        ? "Remove this synced local copy? The server catch is retained."
                        : "Permanently remove this local draft?",
                    )
                  )
                    return;
                  try {
                    await store.remove(draft.client_id);
                  } catch (error) {
                    setMessage(error.message);
                  }
                }}
              >
                {t("action_cancel", "Remove")}
              </button>
            </article>
          ))}
        </>
      )}
    </section>
  );
}

export function OfflineWorkspace({ owner, renderForm, onReturn }) {
  const { t } = useLanguage();
  const store = useDraftVault(owner);
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState("");
  return (
    <main className="offline-workspace">
      <header>
        <h1>HarborX · {t("draft_panel_title", "local seller drafts")}</h1>
        <button className="btn secondary" onClick={onReturn}>
          {t("action_sign_in", "Return to sign in")}
        </button>
      </header>
      <div className="alert warning">
        {t("offline_warning", "Local access only. Auctions, bids, payments and uploads require an authenticated server connection.")}
      </div>
      {owner.expired ? (
        <p role="alert">
          Local access expired. Reconnect and sign in as this seller to renew it. Saved drafts are retained.
        </p>
      ) : (
        <>
          <DraftPanel store={store} onEdit={setForm} />
          <button
            className="btn primary"
            disabled={!store.unlocked || store.busy}
            onClick={() => setForm({})}
          >
            {t("action_register_catch", "Record offline catch")}
          </button>
        </>
      )}
      {message && <p role="status">{message}</p>}
      {form &&
        renderForm({
          value: form,
          user: owner,
          online: false,
          busy: store.busy,
          onClose: () => setForm(null),
          run: async () => false,
          onDraft: async (draft) => {
            try {
              await store.save(draft);
              setForm(null);
              setMessage("Catch draft saved securely on this device.");
            } catch (error) {
              setMessage(`Draft not saved: ${error.message}`);
            }
          },
        })}
    </main>
  );
}
