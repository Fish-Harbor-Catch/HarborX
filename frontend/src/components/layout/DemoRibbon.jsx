import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { ROLES_LABEL } from "./nav-config.js";

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
  const effectiveRoleLabel =
    roleLabel ||
    ROLES_LABEL[role] ||
    (role ? role.charAt(0).toUpperCase() + role.slice(1) : "Demo");

  return (
    <aside
      className={`demo-ribbon ${className}`.trim()}
      role="region"
      aria-label="Demo environment notice"
      {...props}
    >
      <span className="demo-badge">
        <Sparkles size={11} className="demo-badge-icon" aria-hidden="true" />
        DEMO WORKSPACE
      </span>
      <span>Sample records · {effectiveRoleLabel} view</span>{" "}
      {onSwitchRole && (
        <button
          type="button"
          onClick={onSwitchRole}
          className="demo-switch-btn"
          aria-label="Switch demo role"
        >
          Switch role <ArrowRight size={13} aria-hidden="true" />
        </button>
      )}
    </aside>
  );
}
