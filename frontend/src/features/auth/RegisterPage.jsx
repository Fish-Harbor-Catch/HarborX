import React, { useState } from "react";
import { api } from "../../api.js";
import { useLanguage } from "../../i18n.jsx";
import {
  AuthCredentials,
  AuthSwitch,
} from "./components/SharedAuthComponents.jsx";
import { UserRound, Ship, Fish, Check, Phone } from "lucide-react";

export default function RegisterPage({
  onLogin,
  toast,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  role,
  onRoleChange,
  onSignIn,
}) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const f = new FormData(e.currentTarget);
      const data = await api("/auth/register", {
        method: "POST",
        body: {
          name: f.get("name"),
          email,
          password,
          role,
          phone: f.get("phone") || "",
          boat_name: f.get("boat_name") || "",
        },
      });
      await onLogin(data.user);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <form className="auth-form" onSubmit={submit}>
        <h1 id="auth-heading">
          {t("auth_create_heading", "Create your account")}
        </h1>
        <p>
          {t("auth_create_intro", "Choose your role and enter your details.")}
        </p>
        <label>
          {t("auth_name_label", "Full name")}
          <div className="input-icon">
            <UserRound size={17} />
            <input
              name="name"
              required
              minLength={2}
              placeholder={t("auth_name_placeholder", "Your full name")}
            />
          </div>
        </label>

        <div className="role-selector-field">
          <span className="field-label-text">
            {t("auth_role_prompt", "Choose your harbor role:")}
          </span>
          <input type="hidden" name="role" value={role} />
          <div
            className="role-cards"
            role="radiogroup"
            aria-label="Harbor role"
          >
            <button
              type="button"
              role="radio"
              aria-checked={role === "seller"}
              className={`role-card ${role === "seller" ? "selected" : ""}`}
              onClick={() => onRoleChange("seller")}
            >
              <div className="role-card-icon seller">
                <Ship size={24} aria-hidden="true" />
              </div>
              <div className="role-card-content">
                <strong>{t("auth_role_seller", "Seller / Fisherman")}</strong>
                <span>
                  {t(
                    "auth_role_seller_desc",
                    "I catch fish or sell my boat's harvest",
                  )}
                </span>
              </div>
              {role === "seller" && (
                <Check
                  size={18}
                  className="role-card-check"
                  aria-hidden="true"
                />
              )}
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={role === "buyer"}
              className={`role-card ${role === "buyer" ? "selected" : ""}`}
              onClick={() => onRoleChange("buyer")}
            >
              <div className="role-card-icon buyer">
                <Fish size={24} aria-hidden="true" />
              </div>
              <div className="role-card-content">
                <strong>{t("auth_role_buyer", "Buyer / Trader")}</strong>
                <span>
                  {t(
                    "auth_role_buyer_desc",
                    "I bid on catches and buy seafood",
                  )}
                </span>
              </div>
              {role === "buyer" && (
                <Check
                  size={18}
                  className="role-card-check"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>
        </div>

        {role === "seller" && (
          <label>
            {t("auth_boat_label", "Boat name / registration")}
            <div className="input-icon">
              <Ship size={17} />
              <input
                name="boat_name"
                placeholder={t(
                  "auth_boat_placeholder",
                  "e.g. Ocean Pearl LK-2048",
                )}
              />
            </div>
          </label>
        )}
        <label>
          {t("auth_phone_label", "Phone number")}
          <div className="input-icon">
            <Phone size={17} />
            <input
              name="phone"
              type="tel"
              placeholder={t("auth_phone_placeholder", "+94 77 123 4567")}
            />
          </div>
        </label>

        <AuthCredentials
          register
          email={email}
          password={password}
          onEmailChange={onEmailChange}
          onPasswordChange={onPasswordChange}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />
        <small className="muted">
          {t(
            "auth_buyer_verification_notice",
            "Buyers need manager verification before placing bids. Admin accounts are created separately.",
          )}
        </small>

        <button className="btn primary full" disabled={busy}>
          {busy
            ? t("action_please_wait", "Please wait…")
            : t("action_create_account", "Create account")}
        </button>
      </form>
      <AuthSwitch register busy={busy} onSwitch={onSignIn} />
    </>
  );
}
