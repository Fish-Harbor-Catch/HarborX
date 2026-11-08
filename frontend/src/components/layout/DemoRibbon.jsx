import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { ROLES_LABEL } from "./nav-config.js";
import { useLanguage } from "../../i18n.jsx";

/**
 * Demo Mode Ribbon
 *
 * Prominently identifies simulation / local demo workspaces and allows
 * instant switching between Seller, Buyer, and Auction Manager views.
 */
export function DemoRibbon({
  role = "seller",
  roleLabel,
  onSwitchRole,
  className = "",
  ...props
}) {
  const { lang, t } = useLanguage();
  const effectiveRole = role || "seller";
  const roleTitle = lang !== "en" ? t(`role_${effectiveRole}`, ROLES_LABEL[effectiveRole]) : (roleLabel || ROLES_LABEL[effectiveRole] || effectiveRole);

  return (
    <aside
      className={`demo-ribbon ${className}`.trim()}
      role="region"
      aria-label={t("demo_ribbon_workspace", "Demo environment notice")}
      {...props}
    >
      <span className="demo-badge">
        <Sparkles size={11} className="demo-badge-icon" aria-hidden="true" />
        {lang !== "en" ? t("demo_ribbon_workspace", "DEMO WORKSPACE") : "DEMO WORKSPACE"}
      </span>
      <span>
        {t("demo_ribbon_records", `Sample records · ${roleTitle} view`, { role: roleTitle })}
      </span>{" "}
      {onSwitchRole && (
        <button
          type="button"
          onClick={onSwitchRole}
          className="demo-switch-btn"
          aria-label={t("demo_ribbon_switch", "Switch demo role")}
        >
          {t("demo_ribbon_switch", "Switch role")} <ArrowRight size={13} aria-hidden="true" />
        </button>
      )}
    </aside>
  );
}
