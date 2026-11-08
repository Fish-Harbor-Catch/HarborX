import React from "react";
import { UserRound, ShieldCheck, Check } from "lucide-react";
import {
  PageHeader,
  PageTitle,
  PageDescription,
} from "../components/ui/PageContainer.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { api, initials } from "../api.js";
import { ROLES_LABEL } from "../components/layout/nav-config.js";
import { LanguageSwitcher, useLanguage } from "../i18n.jsx";

/**
 * Screen 9: Modernized Settings and Auction Rules Screen.
 * Account profile updating, verification badge, language selection, and codified harbor rules.
 */
export function SettingsScreen({ user, onUser, run, busy = false }) {
  const { lang, t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await run(async () => {
      const d = await api("/auth/profile", {
        method: "PATCH",
        body: {
          name: f.get("name"),
          phone: f.get("phone"),
          boat_name: f.get("boat_name") || "",
        },
      });
      onUser(d.user);
    }, t("settings_updated_toast", "Your profile was updated."));
  };

  const effectiveRole = user?.role || "seller";
  const roleLabel = lang !== "en" ? t(`role_${effectiveRole}`, ROLES_LABEL[effectiveRole]) : (ROLES_LABEL[effectiveRole] || effectiveRole);

  const rulesData = [
    [
      "Prices are per kilogram",
      "The first bid must meet the base price. Later bids must meet the highest bid plus the lot’s minimum increment.",
    ],
    [
      "Up to three rounds",
      "Verified Buyers may join any active round. Only the Auction Manager can start, end, or close auctions.",
    ],
    [
      "Server order decides equal bids",
      "The first valid bid committed by the server is accepted. Equal subsequent bids are rejected. Device clocks are not used.",
    ],
    [
      "Verify the catch before final sale",
      "The manager confirms arrival and inspected weight. A weight different from the advertised catch requires cancellation and relisting.",
    ],
    [
      "Offline drafts, online bidding",
      "Catch drafts can be saved on this device. Bids require a connection and server confirmation; they are never queued offline.",
    ],
    [
      "Payments and commission",
      "The manager records received payments and references. The configured harbor commission is deducted from seller proceeds. No online payment gateway is included.",
    ],
  ];

  return (
    <>
      <PageHeader>
        <PageTitle
          eyebrow={t("settings_eyebrow", "ACCOUNT & GOVERNANCE")}
          description={t("settings_desc", "Your account and the rules that keep trading fair.")}
        >
          {t("settings_title", "Settings")}
        </PageTitle>
      </PageHeader>

      <div className="settings-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <CardHeader>
            <div>
              <h2>{t("settings_profile_heading", "Account profile")}</h2>
              <p>{t("settings_profile_sub", "Your details in the harbor community.")}</p>
            </div>
            <UserRound size={20} aria-hidden="true" />
          </CardHeader>

          <div className="profile-summary">
            <span className="avatar big" aria-hidden="true">
              {initials(user?.name)}
            </span>
            <div>
              <strong>{user?.name}</strong>
              <small>
                {roleLabel} ·{" "}
                {user?.verified
                  ? t("settings_verified", "Verified")
                  : t("settings_unverified", "Awaiting verification")}
              </small>
            </div>
          </div>

          <div className="language-pref-box">
            <div className="lang-pref-info">
              <strong>{t("settings_lang_title", "Display Language / இடைமுக மொழி / භාෂාව")}</strong>
              <small>{t("settings_lang_desc", "Choose English, தமிழ், or සිංහල for the harbor interface")}</small>
            </div>
            <LanguageSwitcher />
          </div>

          <label>
            {t("settings_name_label", "Full name")}
            <input
              name="name"
              defaultValue={user?.name}
              required
              minLength={2}
            />
          </label>

          <label>
            {t("settings_email_label", "Email address")}
            <input value={user?.email || ""} disabled />
            <small>{t("settings_email_help", "Email changes require manager assistance.")}</small>
          </label>

          <label>
            {t("settings_phone_label", "Phone number")}
            <input
              name="phone"
              defaultValue={user?.phone || ""}
              type="tel"
              maxLength={30}
            />
          </label>

          {user?.role === "seller" && (
            <label>
              {t("settings_boat_label", "Boat name")}
              <input
                name="boat_name"
                defaultValue={user?.boat_name || ""}
                maxLength={100}
              />
            </label>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={busy}
            icon={<Check size={15} aria-hidden="true" />}
          >
            {t("action_save_changes", "Save changes")}
          </Button>
        </form>

        <section className="panel rules-panel">
          <CardHeader>
            <div>
              <h2>{t("settings_rules_heading", "Auction rules")}</h2>
              <p>{t("settings_rules_sub", "A clear process. A fair outcome.")}</p>
            </div>
            <ShieldCheck size={20} aria-hidden="true" />
          </CardHeader>

          {rulesData.map(([title, text], i) => (
            <div className="rule" key={title}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <strong>{t(`settings_rule${i + 1}_title`, title)}</strong>
                <p>{t(`settings_rule${i + 1}_text`, text)}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
