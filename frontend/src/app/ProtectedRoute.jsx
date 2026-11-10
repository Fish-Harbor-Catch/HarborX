import React from "react";
import { useLocation } from "react-router";
import Navigate from "./NavigationRedirect.jsx";
import { pagePath } from "./route-config.js";

// Session restoration finishes before these routes are mounted in App.
// Backend authorization continues to protect every API operation.
export default function ProtectedRoute({ user, role, offline, children }) {
  const location = useLocation();
  if (!user) {
    if (offline) return <Navigate reason="offline" to="/offline" replace />;
    return (
      <Navigate
        reason="guest"
        to="/login"
        replace
        state={{ from: location.pathname + location.search + location.hash }}
      />
    );
  }
  if (user.role !== role)
    return <Navigate reason="wrong-role" to={pagePath(user.role)} replace />;
  return children;
}
