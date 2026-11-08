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

/**
 * Topbar Layout Component
 *
 * Provides workspace breadcrumb context, live connectivity status,
 * activity notifications, user profile summary, and sign-out controls.
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
  const currentTitle = pageTitle || NAV[page]?.[0] || page;
  const userInitials = user?.name ? initials(user.name) : "HX";

  return (
    <header
      className={`topbar ${className}`.trim()}
      role="banner"
      {...props}
    >
      <div className="breadcrumbs" aria-label="Breadcrumb navigation">
        <button
          type="button"
          className="mobile-menu"
          onClick={onOpenMenu}
          aria-label="Open menu"
          aria-expanded={isSidebarOpen}
          aria-controls="harbor-navigation"
        >
          <Menu size={20} aria-hidden="true" />
        </button>
        <span className="breadcrumb-root">Workspace</span>
        <ChevronRight size={14} className="breadcrumb-separator" aria-hidden="true" />
        <strong className="breadcrumb-current">{currentTitle}</strong>
      </div>

      <div className="topbar-actions">
        <span
          className={`connection ${online ? "" : "offline"}`}
          role="status"
          aria-label={online ? "Connected online" : "Working offline"}
          title={online ? "Connected to HarborX live servers" : "Offline mode active"}
        >
          {online ? <Wifi size={13} aria-hidden="true" /> : <WifiOff size={13} aria-hidden="true" />}
          <span>{online ? "Connected" : "Offline"}</span>
        </span>

        <span className="top-divider" aria-hidden="true" />

        <button
          type="button"
          className="icon-btn"
          onClick={() => onNavigate?.("activity")}
          aria-label="View recent activity"
          title="Recent activity"
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
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </header>
  );
}
