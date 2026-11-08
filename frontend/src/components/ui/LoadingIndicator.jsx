import React, { forwardRef } from "react";

/**
 * Reusable Loading Indicator and Spinner component.
 *
 * Supports inline spinners, card/container loaders, and fullscreen loading views.
 * Incorporates accessible ARIA live attributes.
 */
export const LoadingIndicator = forwardRef(function LoadingIndicator(
  {
    fullscreen = false,
    size = "md",
    text,
    label = "Loading",
    className = "",
    style = {},
    ...props
  },
  ref,
) {
  const spinnerDimensions = (() => {
    switch (size) {
      case "sm":
        return { width: 16, height: 16, borderWidth: 2 };
      case "lg":
        return { width: 40, height: 40, borderWidth: 3 };
      case "md":
      default:
        return { width: 25, height: 25, borderWidth: 2 };
    }
  })();

  const spinner = (
    <span
      className="spinner"
      style={{
        width: spinnerDimensions.width,
        height: spinnerDimensions.height,
        borderWidth: spinnerDimensions.borderWidth,
      }}
      aria-hidden="true"
    />
  );

  if (fullscreen) {
    return (
      <div
        ref={ref}
        className={["loading", className].filter(Boolean).join(" ")}
        role="status"
        aria-live="polite"
        aria-label={label}
        style={style}
        {...props}
      >
        {spinner}
        {text && <p>{text}</p>}
      </div>
    );
  }

  if (text) {
    return (
      <div
        ref={ref}
        className={className}
        role="status"
        aria-live="polite"
        aria-label={label}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          color: "var(--muted)",
          fontSize: "var(--hx-font-size-base, 13px)",
          ...style,
        }}
        {...props}
      >
        {spinner}
        <span>{text}</span>
      </div>
    );
  }

  return (
    <span
      ref={ref}
      className={className}
      role="status"
      aria-label={label}
      style={{ display: "inline-block", lineHeight: 0, ...style }}
      {...props}
    >
      {spinner}
    </span>
  );
});

LoadingIndicator.displayName = "LoadingIndicator";
