import React, { forwardRef } from "react";

/**
 * Reusable Card component for HarborX panels and cards.
 *
 * Variants:
 * - default (or panel): Standard HarborX panel container (.panel)
 * - stat: Metric and statistic card (.stat-card)
 */
export const Card = forwardRef(function Card(
  {
    children,
    variant = "default",
    className = "",
    as: Component = "div",
    ...props
  },
  ref,
) {
  const variantClass = variant === "stat" ? "stat-card" : "panel";
  const combinedClassName = [variantClass, className].filter(Boolean).join(" ");

  return (
    <Component ref={ref} className={combinedClassName} {...props}>
      {children}
    </Component>
  );
});

Card.displayName = "Card";

export const CardHeader = forwardRef(function CardHeader(
  { children, className = "", ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={["section-heading", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef(function CardTitle(
  { children, as: Component = "h2", className = "", ...props },
  ref,
) {
  return (
    <Component ref={ref} className={className} {...props}>
      {children}
    </Component>
  );
});

CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef(function CardDescription(
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

CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef(function CardContent(
  { children, className = "", ...props },
  ref,
) {
  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  );
});

CardContent.displayName = "CardContent";

export const CardFooter = forwardRef(function CardFooter(
  { children, className = "", ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={["form-footer", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = "CardFooter";
