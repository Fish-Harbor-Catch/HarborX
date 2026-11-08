import React from "react";
import { Menu } from "lucide-react";
import { NAV, MOBILE_NAV_ITEMS } from "./nav-config.js";

/**
 * Mobile Bottom Navigation Component
 *
 * Provides persistent, one-tap mobile access to high-frequency views
 * on viewports <= 760px. Respects device safe-area insets and avoids
 * content occlusion through coordinated shell spacing.
 */
export function MobileNavigation({
  role = "seller",
  page = "overview",
  onNavigate,
  onOpenMore,
  liveCount = 0,
  hasUnverifiedBuyers = false,
  className = "",
  ...props
}) {
  const keys = MOBILE_NAV_ITEMS[role] || MOBILE_NAV_ITEMS.seller;

  return (
    <nav
      className={`mobile-bottom-nav ${className}`.trim()}
      aria-label="Mobile navigation bar"
      {...props}
    >
      {keys.map((key) => {
        const item = NAV[key];
        if (!item) return null;
        const [label, Icon] = item;
        const isActive = page === key;

        return (
          <button
            key={key}
            type="button"
            className={`mobile-tab ${isActive ? "active" : ""}`}
            onClick={() => onNavigate?.(key)}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="mobile-tab-icon-wrap">
              <Icon size={18} aria-hidden="true" />
              {key === "auctions" && liveCount > 0 && (
                <span className="mobile-tab-badge" aria-label={`${liveCount} live`}>
                  {liveCount}
                </span>
              )}
              {key === "users" && hasUnverifiedBuyers && (
                <i className="mobile-tab-dot" aria-hidden="true" />
              )}
            </span>
            <span className="mobile-tab-label">{label}</span>
          </button>
        );
      })}

      <button
        type="button"
        className="mobile-tab mobile-tab-more"
        onClick={onOpenMore}
        aria-label="More navigation options"
        title="Open full navigation"
      >
        <span className="mobile-tab-icon-wrap">
          <Menu size={18} aria-hidden="true" />
        </span>
        <span className="mobile-tab-label">More</span>
      </button>
    </nav>
  );
}
