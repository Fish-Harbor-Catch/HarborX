import React, { useState } from "react";
import { api } from "../../api.js";
import { useLanguage } from "../../i18n.jsx";
import {
  AuthCredentials,
  AuthSwitch,
} from "./components/SharedAuthComponents.jsx";

// Local-only credentials mirror backend/src/seed.js. Vite removes this object
// from production bundles; the API health flag must also enable the panel.
const LOCAL_DEMO = import.meta.env.DEV
  ? {
      password: "HarborXDemo2026!",
      accounts: [
        { role: "seller", label: "Seller", email: "seller@harborx.demo" },
        { role: "buyer", label: "Buyer", email: "buyer@harborx.demo" },
        { role: "admin", label: "Manager", email: "admin@harborx.demo" },
      ],
    }
  : null;

export default function LoginPage({
  onLogin,
  toast,
  demo,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onRegister,
}) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      await onLogin(data.user);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }
  function fillDemo(account) {
    onEmailChange(account.email);
    onPasswordChange(LOCAL_DEMO.password);
    setShowPassword(false);
  }
  return (
    <>
      <form className="auth-form" onSubmit={submit}>
        <h1 id="auth-heading">
          {t("auth_signin_heading", "Sign in to HarborX")}
        </h1>
        <p>
          {t("auth_signin_intro", "Sri Lanka's Digital Fish Auction Platform.")}
        </p>
        <AuthCredentials
          email={email}
          password={password}
          onEmailChange={onEmailChange}
          onPasswordChange={onPasswordChange}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />
        <button className="btn primary full" disabled={busy}>
          {busy
            ? t("action_please_wait", "Please wait…")
            : t("action_sign_in", "Sign in")}
        </button>
      </form>
      <AuthSwitch busy={busy} onSwitch={onRegister} />
      {import.meta.env.DEV && demo && (
        <section
          className="auth-local-demo"
          aria-labelledby="local-demo-heading"
        >
          <span id="local-demo-heading" className="auth-local-demo-badge">
            DEMO
          </span>
          <p>Choose a role to fill the sign-in details</p>
          <div
            className="auth-local-demo-roles"
            role="group"
            aria-label="Demo sign-in role"
          >
            {LOCAL_DEMO.accounts.map((account) => (
              <button
                key={account.role}
                type="button"
                aria-pressed={
                  email === account.email && password === LOCAL_DEMO.password
                }
                disabled={busy}
                onClick={() => fillDemo(account)}
              >
                {account.label}
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
