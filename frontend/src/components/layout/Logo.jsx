import React from "react";

/**
 * HarborX brand identity logo component.
 *
 * Supports light mode for dark surfaces (e.g. sidebar navigation)
 * and compact collapsed mode for icon-only display.
 */
export function Logo({
  light = false,
  collapsed = false,
  className = "",
  ...props
}) {
  return (
    <div
      className={`logo ${light ? "light" : ""} ${collapsed ? "collapsed" : ""} ${className}`.trim()}
      {...props}
    >
      <span className="logo-icon" aria-hidden="true">
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <path d="M10 7v26M30 7v26M10 19h20M7 27q6-7 13 0t13 0" />
        </svg>
      </span>
      {!collapsed && (
        <span>
          Harbor<span className="logo-x">X</span>
          <small>THE HARBOR. CONNECTED.</small>
        </span>
      )}
    </div>
  );
}
