import React, { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

export default function PwaStatus() {
  const [install, setInstall] = useState(null);
  const [failure, setFailure] = useState(false);
  const {
    needRefresh: [update],
    offlineReady: [ready],
  } = useRegisterSW({
    onRegisterError() {
      setFailure(true);
    },
    onRegisteredSW(url, registration) {
      // Check when returning to the app. Never force a reload or skip waiting.
      window.addEventListener("online", () =>
        registration?.update().catch(() => {}),
      );
    },
  });
  useEffect(() => {
    const offer = (event) => {
      event.preventDefault();
      setInstall(event);
    };
    const installed = () => setInstall(null);
    window.addEventListener("beforeinstallprompt", offer);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", offer);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);
  return (
    <aside
      className="pwa-status"
      aria-label="HarborX installation"
      role="status"
    >
      <span>
        {update
          ? "Update ready. Save drafts, then close all HarborX windows and reopen to update."
          : failure
            ? "Offline setup unavailable. Connect securely and reopen to retry."
            : ready
              ? "App shell ready offline · seller drafts require local unlock."
              : "Install: browser menu → Install app, or on iPhone Share → Add to Home Screen."}
      </span>
      {install && (
        <button
          className="btn secondary"
          onClick={async () => {
            await install.prompt();
            setInstall(null);
          }}
        >
          Install HarborX
        </button>
      )}
    </aside>
  );
}
