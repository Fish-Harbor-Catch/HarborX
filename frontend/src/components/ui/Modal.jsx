import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Reusable accessible Modal dialog foundation.
 *
 * Implements:
 * - WAI-ARIA Dialog (Modal) design pattern
 * - Trapped focus cycle (Tab / Shift+Tab)
 * - Escape key dismiss handler
 * - Body scroll locking and restoration
 * - Active element focus restore on unmount
 * - Outside click dismiss via backdrop
 */
export function Modal({
  isOpen = true,
  onClose,
  close, // Backward compatibility alias
  title,
  subtitle,
  wide = false,
  children,
  footer,
  ariaLabel,
}) {
  const handleClose = onClose || close || (() => {});
  const closeRef = useRef(handleClose);
  closeRef.current = handleClose;
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";

    // Focus first actionable control or close button
    const timer = setTimeout(() => {
      const focusTarget = dialogRef.current?.querySelector(
        "button, input, select, textarea",
      );
      focusTarget?.focus();
    }, 10);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        const controls = [
          ...dialogRef.current.querySelectorAll(
            'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
          ),
        ].filter((el) => el.getClientRects().length > 0);

        if (controls.length === 0) return;

        // WebKit may skip buttons during native Tab navigation depending on
        // system keyboard preferences. Move focus explicitly on every Tab so
        // the dialog remains contained on those systems as well.
        const current = controls.indexOf(document.activeElement);
        const next = e.shiftKey
          ? (current <= 0 ? controls.length - 1 : current - 1)
          : (current + 1) % controls.length;
        e.preventDefault();
        controls[next].focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        className={`modal ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || (typeof title === "string" ? title : "Dialog")}
      >
        <header className="modal-header">
          <div>
            {typeof title === "string" ? <h2>{title}</h2> : title}
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={handleClose}
            aria-label="Close dialog"
          >
            <X size={21} aria-hidden="true" />
          </button>
        </header>

        {React.isValidElement(children) &&
        children.props.className?.includes("modal-body") ? (
          children
        ) : (
          <div className="modal-body">{children}</div>
        )}

        {footer && (
          <footer className="modal-footer" style={{ padding: "0 27px 25px" }}>
            {footer}
          </footer>
        )}
      </section>
    </div>
  );
}
