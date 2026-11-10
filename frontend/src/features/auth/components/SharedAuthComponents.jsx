import React from "react";
import { Eye, EyeOff, Mail, LockKeyhole } from "lucide-react";
import { LanguageSwitcher, useLanguage } from "../../../i18n.jsx";
import { Logo } from "../../../components/layout/Logo.jsx";
import LoginSlideshow from "../../../LoginSlideshow.jsx";
import "../../../auth.css";

// Keep this layout mounted while switching forms so slideshow timing is continuous.
export function AuthLayout({ children }) {
  return (
    <main className="auth-page auth-split">
      <LoginSlideshow />
      <section className="auth-form-wrap" aria-labelledby="auth-heading">
        <div className="auth-content">
          <div className="auth-top">
            <LanguageSwitcher />
          </div>
          <div className="auth-brand">
            <Logo />
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}

export function AuthCredentials({
  register = false,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  showPassword,
  setShowPassword,
}) {
  const { t } = useLanguage();
  return (
    <>
      <label>
        {t("auth_email_label", "Email address")}
        <div className="input-icon">
          <Mail size={17} />
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder={t("auth_email_placeholder", "you@example.com")}
          />
        </div>
      </label>
      <div className="auth-password-field">
        <label htmlFor="auth-password">
          {t("auth_pass_label", "Password")}
        </label>
        <div className="input-icon auth-password">
          <LockKeyhole size={17} />
          <input
            id="auth-password"
            type={showPassword ? "text" : "password"}
            required
            minLength={register ? 12 : 1}
            maxLength={128}
            autoComplete={register ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder={
              register
                ? t("auth_pass_new_placeholder", "At least 12 characters")
                : t("auth_pass_cur_placeholder", "Enter your password")
            }
          />
          <button
            type="button"
            className="auth-password-toggle"
            aria-label={
              showPassword
                ? t("auth_hide_password", "Hide password")
                : t("auth_show_password", "Show password")
            }
            aria-controls="auth-password"
            aria-pressed={showPassword}
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? (
              <EyeOff size={19} aria-hidden="true" />
            ) : (
              <Eye size={19} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export function AuthSwitch({ register = false, busy, onSwitch }) {
  const { t } = useLanguage();
  return (
    <div className="auth-registration">
      <span>
        {register
          ? t("auth_already_prompt", "Already have an account?")
          : t("auth_new_prompt", "New to HarborX?")}
      </span>
      <button
        type="button"
        className="text-btn"
        onClick={onSwitch}
        disabled={busy}
      >
        {register
          ? t("action_sign_in", "Sign in")
          : t("action_create_account", "Create account")}
      </button>
    </div>
  );
}
