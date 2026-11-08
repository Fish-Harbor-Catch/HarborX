import React from "react";
import {
  Menu,
  ChevronRight,
  Wifi,
  WifiOff,
  Bell,
  LogOut,
} from "lucide-react";
import { NAV } from "./nav-config.js";
import { initials } from "../../api.js";
import { LanguageSwitcher, useLanguage } from "../../i18n.jsx";

/**
 * Topbar Layout Component
 *
 * Provides workspace breadcrumb context, live connectivity status,
 * activity notifications, user profile summary, language toggle, and sign-out controls.
 */
export function Topbar({
  page = "overview",
  pageTitle,
  user,
  online = true,
  hasUnreadEvents = false,
  onOpenMenu,
  onNavigate,
  onLogout,
  isSidebarOpen = false,
  className = "",
  ...props
}) {
  const { lang, t } = useLanguage();
  const currentTitle = pageTitle || (lang !== "en" ? t(`nav_${page}`, NAV[page]?.[0]) : NAV[page]?.[0]) || page;
  const userInitials = user?.name ? initials(user.name) : "HX";

  return (
    <header
      className={`topbar ${className}`.trim()}
      role="banner"
      {...props}
    >
      <div className="breadcrumbs" aria-label={t("nav_workspace", "Breadcrumb navigation")}>
        <button
          type="button"
          className="mobile-menu"
          onClick={onOpenMenu}
          aria-label="Open menu"
          {...(lang !== "en" ? { "aria-label": t("topbar_open_menu", "Open menu") } : {})}
          aria-expanded={isSidebarOpen}
          aria-controls="harbor-navigation"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <span className="breadcrumb-root">
          {lang !== "en" ? t("nav_workspace", "Workspace") : "Workspace"}
        </span>
        <ChevronRight size={14} className="breadcrumb-separator" aria-hidden="true" />
        <strong className="breadcrumb-current">{currentTitle}</strong>
      </div>

      <div className="topbar-actions">
        <LanguageSwitcher />

        <span
          className={`connection ${online ? "" : "offline"}`}
          role="status"
          aria-label={online ? t("topbar_connected", "Connected online") : t("topbar_offline", "Working offline")}
          title={online ? t("helper_online", "Connected to HarborX live servers") : t("helper_offline", "Offline mode active")}
        >
          {online ? <Wifi size={13} aria-hidden="true" /> : <WifiOff size={13} aria-hidden="true" />}
          <span>{online ? t("topbar_connected", "Connected") : t("topbar_offline", "Offline")}</span>
        </span>

        <span className="top-divider" aria-hidden="true" />

        <button
          type="button"
          className="icon-btn"
          onClick={() => onNavigate?.("activity")}
          aria-label="View recent activity"
          {...(lang !== "en" ? { "aria-label": t("topbar_recent_activity", "View recent activity") } : {})}
          title={t("topbar_recent_activity", "Recent activity")}
        >
          <Bell size={19} aria-hidden="true" />
          {hasUnreadEvents && <i aria-hidden="true" />}
        </button>

        {user?.name && (
          <span
            className="avatar small"
            title={`Signed in as ${user.name}`}
            aria-label={`User avatar for ${user.name}`}
          >
            {userInitials}
          </span>
        )}

        {onLogout && (
          <button
            type="button"
            className="icon-btn"
            onClick={onLogout}
            title={t("topbar_sign_out", "Sign out")}
            aria-label="Sign out"
            {...(lang !== "en" ? { "aria-label": t("topbar_sign_out", "Sign out") } : {})}
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </header>
  );
}
