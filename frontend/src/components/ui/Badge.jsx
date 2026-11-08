import React, { forwardRef } from "react";

/**
 * Reusable Badge component for HarborX entity statuses and category tags.
 *
 * Status styling automatically maps to existing status classes:
 * - live, active, verified, paid, won, leading (Success - emerald/mint)
 * - scheduled, closed (Info - maritime blue)
 * - pending, partially-paid (Warning - golden amber)
 * - overdue, cancelled, outbid (Danger - crimson)
 */
export const Badge = forwardRef(function Badge(
  { status = "", variant, showDot = true, children, className = "", ...props },
  ref,
) {
  const effectiveStatus = variant || status || "";
  const statusClass = effectiveStatus
    ? String(effectiveStatus)
        .toLowerCase()
        .replaceAll(" ", "-")
        .replaceAll("_", "-")
    : "";

  const combinedClassName = ["badge", statusClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span ref={ref} className={combinedClassName} {...props}>
      {showDot && <i aria-hidden="true" />}
      {children || status || variant}
    </span>
  );
});

Badge.displayName = "Badge";
