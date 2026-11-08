import React, { forwardRef, useId } from "react";

/**
 * Reusable Form Input component aligned with HarborX visual identity.
 *
 * Supports integrated accessible labeling, helper text, validation error messaging,
 * start/end adornment icons, and full HTML input props.
 */
export const Input = forwardRef(function Input(
  {
    id: explicitId,
    label,
    helperText,
    error,
    startIcon: StartIcon = null,
    endIcon: EndIcon = null,
    fullWidth = true,
    className = "",
    containerClassName = "",
    disabled = false,
    required = false,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = explicitId || generatedId;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy =
    [errorId, helperId].filter(Boolean).join(" ") || undefined;

  const inputElement = (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        width: fullWidth ? "100%" : "auto",
      }}
    >
      {StartIcon && (
        <span
          style={{
            position: "absolute",
            left: 12,
            display: "flex",
            alignItems: "center",
            color: "var(--muted)",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          {React.isValidElement(StartIcon) ? (
            StartIcon
          ) : (
            <StartIcon size={16} />
          )}
        </span>
      )}
      <input
        ref={ref}
        id={inputId}
        disabled={disabled}
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        style={{
          paddingLeft: StartIcon ? 38 : undefined,
          paddingRight: EndIcon ? 38 : undefined,
          borderColor: error ? "var(--hx-color-danger, #c25f59)" : undefined,
        }}
        className={className}
        {...props}
      />
      {EndIcon && (
        <span
          style={{
            position: "absolute",
            right: 12,
            display: "flex",
            alignItems: "center",
            color: "var(--muted)",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          {React.isValidElement(EndIcon) ? EndIcon : <EndIcon size={16} />}
        </span>
      )}
    </div>
  );

  if (!label && !helperText && !error) {
    return inputElement;
  }

  return (
    <label htmlFor={inputId} className={containerClassName}>
      {label && (
        <span>
          {label}
          {required && (
            <span
              aria-hidden="true"
              style={{
                color: "var(--hx-color-danger, #c25f59)",
                marginLeft: 3,
              }}
            >
              *
            </span>
          )}
        </span>
      )}
      {helperText && !error && <small id={helperId}>{helperText}</small>}
      {inputElement}
      {error && (
        <small
          id={errorId}
          role="alert"
          style={{
            color: "var(--hx-color-danger, #c25f59)",
            fontWeight: 500,
            marginTop: 2,
          }}
        >
          {error}
        </small>
      )}
    </label>
  );
});

Input.displayName = "Input";
