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
  responsiveCompact = false,
  className = "",
  ...props
}) {
  return (
    <div
      className={`logo ${light ? "light" : ""} ${collapsed ? "collapsed" : ""} ${className}`.trim()}
      {...props}
    >
      <picture>
        {responsiveCompact && !collapsed && (
          <source
            media="(min-width: 761px) and (max-width: 1050px)"
            srcSet={icon}
          />
        )}
        <img
          className={collapsed ? "logo-symbol" : "logo-wordmark"}
          src={collapsed ? icon : light ? darkWordmark : wordmark}
          width={collapsed ? 96 : 556}
          height={collapsed ? 96 : 168}
          alt="HarborX"
        />
      </picture>
    </div>
  );
}
