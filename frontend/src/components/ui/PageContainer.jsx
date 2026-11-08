import React, { forwardRef } from "react";

/**
 * Reusable Page Container and Page Header layout components.
 *
 * Provides responsive bounding box, maximum width constraints,
 * and page-level heading typography hierarchy.
 */
export const PageContainer = forwardRef(function PageContainer(
  { children, as: Component = "main", className = "", style = {}, ...props },
  ref,
) {
  return (
    <Component
      ref={ref}
      className={className}
      style={{
        padding: "23px 35px 0",
        maxWidth: 1660,
        margin: "auto",
        minWidth: 0,
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
});

PageContainer.displayName = "PageContainer";

export const PageHeader = forwardRef(function PageHeader(
  { children, className = "", ...props },
  ref,
) {
  return (
    <header
      ref={ref}
      className={["page-heading", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </header>
  );
});

PageHeader.displayName = "PageHeader";

export const PageTitle = forwardRef(function PageTitle(
  {
    children,
    as: Component = "h1",
    eyebrow,
    description,
    className = "",
    ...props
  },
  ref,
) {
  return (
    <div className={className}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <Component ref={ref} {...props}>
        {children}
      </Component>
      {description && <p>{description}</p>}
    </div>
  );
});

PageTitle.displayName = "PageTitle";

export const PageDescription = forwardRef(function PageDescription(
  { children, className = "", ...props },
  ref,
) {
  return (
    <p
      ref={ref}
      className={["muted", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </p>
  );
});

PageDescription.displayName = "PageDescription";

export const PageActions = forwardRef(function PageActions(
  { children, className = "", ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={["heading-actions", className].filter(Boolean).join(" ")}
      style={{ display: "flex", alignItems: "center", gap: 12 }}
      {...props}
    >
      {children}
    </div>
  );
});

PageActions.displayName = "PageActions";
