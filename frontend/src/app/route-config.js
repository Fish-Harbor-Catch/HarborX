import { matchRoutes } from "react-router";
import {
  ROLE_NAV_ITEMS,
  SECONDARY_NAV_ITEMS,
} from "../components/layout/nav-config.js";

// Reuse the existing role permissions; overview is the role's dashboard URL.
export const WORKSPACE_ROUTES = Object.entries(ROLE_NAV_ITEMS).flatMap(
  ([role, pages]) =>
    [...pages, ...SECONDARY_NAV_ITEMS].map((page) => ({
      path: `/${role}/${page === "overview" ? "dashboard" : page}`,
      role,
      page,
    })),
);

export function workspaceRoute(pathname) {
  return matchRoutes(WORKSPACE_ROUTES, pathname)?.at(-1).route;
}

export function pagePath(role, page = "overview") {
  return WORKSPACE_ROUTES.find(
    (route) => route.role === role && route.page === page,
  )?.path;
}

// Only return to a known route belonging to this account; never accept external URLs.
export function loginDestination(user, from) {
  if (
    typeof from === "string" &&
    from.startsWith("/") &&
    !from.startsWith("//")
  ) {
    try {
      const url = new URL(from, "http://harborx.local");
      if (
        url.origin === "http://harborx.local" &&
        workspaceRoute(url.pathname)?.role === user.role
      ) {
        return url.pathname + url.search + url.hash;
      }
    } catch {
      // Invalid return destinations use the account's dashboard.
    }
  }
  return pagePath(user.role);
}
