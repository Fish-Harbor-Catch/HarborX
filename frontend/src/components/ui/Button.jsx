import React, { forwardRef } from "react";

/**
 * Reusable Button component aligned with HarborX visual identity.
 *
 * Supports variants matching existing CSS:
 * - primary: Coastal Teal action button
 * - secondary: Slate/White bordered button
 * - white: High-contrast white button (for dark headers)
 * - danger: Crimson solid button for destructive actions
 * - danger-outline: Crimson outline button
 * - text: Borderless text action button
 * - icon: Compact 34x34px square icon button
 */
export const Button = forwardRef(function Button(
  {
    children,
    type = "button",
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    disabled = false,
    icon: Icon = null,
    className = "",
    ...props
  },
  ref,
) {
  const isIconButton = variant === "icon";
  const isTextButton = variant === "text";

  const baseClass = isIconButton
    ? "icon-btn"
    : isTextButton
      ? "text-btn"
      : "btn";

  const variantClass = (() => {
    switch (variant) {
      case "primary":
        return "primary";
      case "secondary":
        return "secondary";
      case "white":
        return "white";
      case "danger":
        return "danger-solid";
      case "danger-outline":
        return "danger-outline";
      case "icon":
      case "text":
        return "";
      default:
        return "primary";
    }
  })();

  const sizeClass = size === "sm" || size === "tiny" ? "tiny" : "";
  const fullWidthClass = fullWidth ? "full" : "";

  const combinedClassName = [
    baseClass,
    variantClass,
    sizeClass,
    fullWidthClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      ref={ref}
      type={type}
      className={combinedClassName}
      disabled={disabled || loading}
      aria-busy={loading ? "true" : undefined}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="spinner"
            style={{ width: 14, height: 14, borderWidth: 2 }}
            aria-hidden="true"
          />
          {!isIconButton && <span>Loading…</span>}
        </>
      ) : (
        <>
          {Icon &&
            (React.isValidElement(Icon) ? (
              Icon
            ) : (
              <Icon size={size === "sm" ? 14 : 16} aria-hidden="true" />
            ))}
          {children}
        </>
      )}
    </button>
  );
});

Button.displayName = "Button";
