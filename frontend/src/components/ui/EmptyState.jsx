import React, { forwardRef } from "react";
import { Fish } from "lucide-react";

/**
 * Reusable Empty State component.
 *
 * Displays a friendly empty placeholder when lists, search queries,
 * drafts, or auction tables have no records.
 */
export const EmptyState = forwardRef(function EmptyState(
  {
    icon: Icon = Fish,
    title = "Nothing here yet",
    text,
    description,
    action,
    className = "",
    ...props
  },
  ref,
) {
  const contentText = description || text || "New records will appear here.";

  return (
    <div
      ref={ref}
      className={["empty", className].filter(Boolean).join(" ")}
      {...props}
    >
      <span>
        {React.isValidElement(Icon) ? (
          Icon
        ) : (
          <Icon size={30} aria-hidden="true" />
        )}
      </span>
      <h3>{title}</h3>
      {contentText && <p>{contentText}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  );
});

EmptyState.displayName = "EmptyState";
