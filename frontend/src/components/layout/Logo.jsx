import React from "react";
import { Anchor } from "lucide-react";

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
        <Anchor size={24} />
      </span>
      {!collapsed && (
        <span>
          Harbor<span className="logo-x">X</span>
          <small>CATCH. CONNECT. TRADE.</small>
        </span>
      )}
    </div>
  );
}
