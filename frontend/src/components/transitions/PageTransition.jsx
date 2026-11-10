import React, { useLayoutEffect, useRef, ViewTransition } from "react";
import { useLocation, useNavigationType } from "react-router";
import styles from "./PageTransition.module.css";

const publicPages = new Set(["/", "/login", "/register"]);

// Keep this boundary stable: keying it by URL would reset the shared auth layout.
export default function PageTransition({ enabled = true, children }) {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const previous = useRef(pathname);
  const animate =
    enabled &&
    previous.current !== pathname &&
    publicPages.has(previous.current) &&
    publicPages.has(pathname);

  useLayoutEffect(() => {
    const from = previous.current;
    previous.current = pathname;
    if (from === pathname || !enabled || !publicPages.has(pathname)) return;

    // A lazy homepage may commit after this effect. Focus once it is available,
    // without moving scroll position or disturbing focus on an initial load.
    const selector = pathname === "/" ? "#public-main h1" : "#auth-heading";
    let focused;
    let addedTabIndex = false;
    let animation;
    const fallback =
      publicPages.has(from) &&
      (navigationType === "POP" ||
        typeof document.startViewTransition !== "function");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const reduceMotion = () => {
      if (motion.matches) animation?.cancel();
    };
    if (fallback) motion.addEventListener("change", reduceMotion);
    const focusHeading = () => {
      const heading = document.querySelector(selector);
      if (!heading) return false;
      focused = heading;
      addedTabIndex = !heading.hasAttribute("tabindex");
      if (addedTabIndex) heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
      if (fallback && !motion.matches) {
        const page =
          pathname === "/"
            ? document.querySelector(".hx-public")
            : heading.closest(".auth-page");
        animation = page?.animate(
          [
            { opacity: 0, transform: "translateY(6px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            id: "hx-public-page-enter",
            duration: 400,
            easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          },
        );
      }
      return true;
    };
    const observer = new MutationObserver(() => {
      if (focusHeading()) observer.disconnect();
    });
    if (!focusHeading())
      observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      animation?.cancel();
      motion.removeEventListener("change", reduceMotion);
      if (addedTabIndex) focused?.removeAttribute("tabindex");
    };
  }, [pathname, enabled, navigationType]);

  return (
    <ViewTransition default="none" update={animate ? styles.page : "none"}>
      {children}
    </ViewTransition>
  );
}
