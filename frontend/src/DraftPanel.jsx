import React, { useState } from "react";
import { useDraftVault } from "./useDraftVault.js";

export function DraftPanel({
  store,
  online = false,
  allowSetup = false,
  onSync,
  onEdit,
  authorize,
}) {
  const [passphrase, setPassphrase] = useState("");
  const [message, setMessage] = useState("");
  return (
    <section className="panel local-drafts" aria-label="Local catch drafts">
      <div className="section-heading">
        <div>
          <h2>Local catch drafts</h2>
          <p>Encrypted on this device. Upload only when you choose Sync.</p>
        </div>
        {store.unlocked && (
          <button
            className="btn secondary"
            disabled={store.busy}
            onClick={store.lock}
          >
            Lock drafts
          </button>
        )}
      </div>
      <p>
        Use a separate local passphrase, not your account password. It cannot be
        recovered. Offline access must be renewed online every 12 hours. Shared
        devices should use separate browser profiles.
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
                ? "Local draft passphrase"
                : "Create local draft passphrase"}
              <input
                aria-label="Local draft passphrase"
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
                ? "Opening…"
                : store.exists
                  ? "Unlock drafts"
                  : "Enable offline drafts"}
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
              Sync pending drafts
            </button>
          )}
          {store.drafts.length === 0 && <p>No drafts saved for this seller.</p>}
          {store.drafts.map((draft) => (
            <article className="draft-row" key={draft.client_id}>
              <div>
                <strong>
                  {draft.species} · {draft.weight} kg
                </strong>
                <small>
                  {draft.boat_name} ·{" "}
                  <span className={`draft-state ${draft.state}`}>
                    {draft.state}
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
                  Edit
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
                Remove
              </button>
            </article>
          ))}
        </>
      )}
    </section>
  );
}

export function OfflineWorkspace({ owner, renderForm, onReturn }) {
  const store = useDraftVault(owner);
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState("");
  return (
    <main className="offline-workspace">
      <header>
        <h1>HarborX · local seller drafts</h1>
        <button className="btn secondary" onClick={onReturn}>
          Return to sign in
        </button>
      </header>
      <div className="alert warning">
        Local access only. Auctions, bids, payments and uploads require an
        authenticated server connection.
      </div>
      {owner.expired ? (
        <p role="alert">
          Local access expired. Reconnect and sign in as this seller to renew
          it. Saved drafts are retained.
        </p>
      ) : (
        <>
          <DraftPanel store={store} onEdit={setForm} />
          <button
            className="btn primary"
            disabled={!store.unlocked || store.busy}
            onClick={() => setForm({})}
          >
            Record offline catch
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
