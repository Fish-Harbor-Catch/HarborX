import React, { useEffect } from "react";
import {
  LifeBuoy,
  ArrowUpRight,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Logo } from "./Logo.jsx";
import {
  NAV,
  ROLE_NAV_ITEMS,
  SECONDARY_NAV_ITEMS,
  ROLES_LABEL,
} from "./nav-config.js";
import { initials } from "../../api.js";
import { useLanguage } from "../../i18n.jsx";

/**
 * Sidebar Navigation Component
 *
 * Provides responsive, role-based primary navigation for HarborX workspaces.
 * Supports mobile drawer with backdrop scrim, collapsed desktop layout,
 * active indicator states, live badge counts, and unverified buyer alerts.
 */
export function Sidebar({
  user,
  role = "seller",
  page = "overview",
  onNavigate,
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  liveCount = 0,
  hasUnverifiedBuyers = false,
  onRulesClick,
  className = "",
  ...props
}) {
  const { lang, t } = useLanguage();
  const effectiveRole = role || user?.role || "seller";
  const primaryKeys = ROLE_NAV_ITEMS[effectiveRole] || ROLE_NAV_ITEMS.seller;
  const roleTitle = lang !== "en" ? t(`role_${effectiveRole}`, ROLES_LABEL[effectiveRole]) : (ROLES_LABEL[effectiveRole] || effectiveRole);
  const userInitials = user?.name ? initials(user.name) : "HX";

  // Close drawer on Escape key for keyboard accessibility
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleNavClick = (key) => {
    onNavigate?.(key);
    if (isOpen && onClose) {
      onClose();
    }
  };

  const handleRules = () => {
    if (onRulesClick) {
      onRulesClick();
    } else {
      handleNavClick("settings");
    }
    if (isOpen && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile drawer backdrop scrim */}
      <div
        className={`sidebar-scrim ${isOpen ? "show" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        id="harbor-navigation"
        className={`sidebar ${isOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""} ${className}`.trim()}
        aria-label={t("nav_harbor_nav", "Harbor navigation")}
        {...props}
      >
        <div className="sidebar-header">
          <Logo light collapsed={isCollapsed} />
          {isOpen && (
            <button
              type="button"
              className="sidebar-close-btn"
              onClick={onClose}
              aria-label={t("action_close", "Close navigation drawer")}
              title={t("action_close", "Close menu")}
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>

        {!isCollapsed && (
          <div className="workspace-label">
            {lang !== "en" ? t("nav_harbor_workspace", "HARBOR WORKSPACE") : "HARBOR WORKSPACE"}
          </div>
        )}

        <nav aria-label={t("nav_harbor_workspace", "Harbor operations")}>
          {primaryKeys.map((key) => {
            const item = NAV[key];
            if (!item) return null;
            const [baseLabel, Icon] = item;
            const label = lang !== "en" ? t(`nav_${key}`, baseLabel) : baseLabel;
            const isActive = page === key;

            return (
              <button
                key={key}
                type="button"
                className={isActive ? "active" : ""}
                onClick={() => handleNavClick(key)}
                aria-current={isActive ? "page" : undefined}
                title={isCollapsed ? label : undefined}
              >
                <Icon size={20} aria-hidden="true" />
                <span className="nav-label">{label}</span>
                {key === "auctions" && liveCount > 0 && (
                  <span className="nav-badge" aria-label={`${liveCount} live auctions`}>
                    {liveCount}
                  </span>
                )}
                {key === "users" && hasUnverifiedBuyers && (
                  <i
                    className="nav-dot"
                    role="status"
                    aria-label={t("helper_buyer_unverified", "Buyers awaiting verification")}
                    title={t("helper_buyer_unverified", "Buyers awaiting verification")}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {!isCollapsed && (
          <div className="workspace-label second">
            {lang !== "en" ? t("nav_general_workspace", "WORKSPACE") : "WORKSPACE"}
          </div>
        )}

        <nav aria-label={t("nav_general_workspace", "General workspace")}>
          {SECONDARY_NAV_ITEMS.map((key) => {
            const item = NAV[key];
            if (!item) return null;
            const [baseLabel, Icon] = item;
            const label = lang !== "en" ? t(`nav_${key}`, baseLabel) : baseLabel;
            const isActive = page === key;

            return (
              <button
                key={key}
                type="button"
                className={isActive ? "active" : ""}
                onClick={() => handleNavClick(key)}
                aria-current={isActive ? "page" : undefined}
                title={isCollapsed ? label : undefined}
              >
                <Icon size={20} aria-hidden="true" />
                <span className="nav-label">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          {!isCollapsed && (
            <div className="harbor-help">
              <LifeBuoy size={22} aria-hidden="true" />
              <strong>{t("sidebar_rules_title", "Auction rules")}</strong>
              <p>{t("sidebar_rules_desc", "Review codified bidding, inspection, and settlement rules.")}</p>
              <button type="button" onClick={handleRules}>
                {t("settings_rules_heading", "Auction rules")} <ArrowUpRight size={14} aria-hidden="true" />
              </button>
            </div>
          )}

          {user && (
            <button
              type="button"
              className="sidebar-user"
              onClick={() => handleNavClick("settings")}
              aria-label={`User profile for ${user.name}, open settings`}
              title={t("nav_settings", "Open account settings")}
            >
              <span className="avatar" aria-hidden="true">
                {userInitials}
              </span>
              {!isCollapsed && (
                <span>
                  <strong>{user.name}</strong>
                  <small>{roleTitle}</small>
                </span>
              )}
              {!isCollapsed && <Settings size={17} aria-hidden="true" />}
            </button>
          )}

          {onToggleCollapse && (
            <button
              type="button"
              className="sidebar-collapse-toggle"
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? "Expand sidebar navigation" : "Collapse sidebar navigation"}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight size={14} aria-hidden="true" />
              ) : (
                <ChevronLeft size={14} aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
