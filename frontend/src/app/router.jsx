import React, { lazy, Suspense } from "react";
import { Route, Routes, useLocation } from "react-router";
import Navigate from "./NavigationRedirect.jsx";
import { LoginRoute, RegisterRoute } from "../features/auth/AuthPages.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import NotFoundPage from "./NotFoundPage.jsx";
import {
  WORKSPACE_ROUTES,
  loginDestination,
  pagePath,
} from "./route-config.js";

const PublicHomePage = lazy(
  () => import("../features/public/PublicHomePage.jsx"),
);

function GuestRoute({ user, offline, children }) {
  const location = useLocation();
  if (!user && offline)
    return <Navigate reason="offline" to="/offline" replace />;
  return user ? (
    <Navigate
      reason="authenticated"
      to={loginDestination(user, location.state?.from)}
      replace
    />
  ) : (
    children
  );
}

export default function ApplicationRoutes({
  user,
  auth,
  workspace,
  offline,
  preferOffline = false,
}) {
  return (
    <Routes>
      <Route
        path="/"
        element={
          preferOffline ? (
            <Navigate reason="offline" to="/offline" replace />
          ) : (
            <Suspense
              fallback={
                <div className="loading" role="status">
                  Loading HarborX…
                </div>
              }
            >
              <PublicHomePage user={user} />
            </Suspense>
          )
        }
      />
      <Route
        element={
          <GuestRoute user={user} offline={preferOffline}>
            {auth}
          </GuestRoute>
        }
      >
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/register" element={<RegisterRoute />} />
      </Route>
      <Route
        path="/offline"
        element={
          offline || (
            <Navigate
              reason="offline"
              to={user ? pagePath(user.role) : "/login"}
              replace
            />
          )
        }
      />
      {WORKSPACE_ROUTES.map(({ path, role }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute user={user} role={role} offline={preferOffline}>
              {workspace}
            </ProtectedRoute>
          }
        />
      ))}
      <Route path="*" element={<NotFoundPage user={user} />} />
    </Routes>
  );
}
