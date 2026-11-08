import React, { forwardRef } from "react";
import { useLanguage } from "../../i18n.jsx";

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
  const { t } = useLanguage();
  const effectiveStatus = variant || status || "";
  const rawKey = String(effectiveStatus).toLowerCase().replaceAll(" ", "_").replaceAll("-", "_");
  const statusClass = effectiveStatus
    ? String(effectiveStatus)
        .toLowerCase()
        .replaceAll(" ", "-")
        .replaceAll("_", "-")
    : "";

  const combinedClassName = ["badge", statusClass, className]
    .filter(Boolean)
    .join(" ");

  const rawText = children !== undefined ? children : (status || variant);
  let displayText = rawText;
  if (typeof rawText === "string") {
    const textKey = rawText.toLowerCase().replaceAll(" ", "_").replaceAll("-", "_");
    const trans = t(`status_${textKey}`, null) || t(`status_${rawKey}`, null);
    if (trans) {
      displayText = trans;
    }
  }

  return (
    <span ref={ref} className={combinedClassName} {...props}>
      {showDot && <i aria-hidden="true" />}
      {displayText}
    </span>
  );
});

Badge.displayName = "Badge";
