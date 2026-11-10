import React from "react";
import icon from "../../harborx-icon.svg";
import wordmark from "../../harborx-logo.svg";
import darkWordmark from "../../harborx-logo-dark-bg.svg";
import "./Logo.css";

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
      <img
        className="logo-symbol"
        src={icon}
        width="96"
        height="96"
        alt="HarborX"
      />
      {!collapsed && (
        <img
          className="logo-wordmark"
          src={light ? darkWordmark : wordmark}
          width="556"
          height="168"
          alt="HarborX"
        />
      )}
    </div>
  );
}
