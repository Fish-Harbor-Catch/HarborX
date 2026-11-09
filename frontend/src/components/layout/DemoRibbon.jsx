import React from "react";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "../../i18n.jsx";

/**
 * Demo Mode Ribbon
 *
 * Discreetly identifies simulation / local demo workspaces and allows
 * instant switching between Seller, Buyer, and Auction Manager views.
 */
export function DemoRibbon({
  role = "seller",
  roleLabel,
  onSwitchRole,
  className = "",
  ...props
}) {
  const { t } = useLanguage();

  return (
    <aside
      className={`demo-ribbon ${className}`.trim()}
      role="region"
      aria-label={t("demo_ribbon_workspace", "Demo environment notice")}
      {...props}
    >
      <span className="demo-badge">{t("sample_environment", "Sample environment · no real transactions")}</span>
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
