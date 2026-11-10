import React, { useEffect } from "react";
import { Navigate } from "react-router";
import { recordNavigation } from "./navigation-diagnostics.js";

// Keep React Router's redirect semantics; diagnostics only observe decisions.
export default function NavigationRedirect({ reason, ...props }) {
  useEffect(() => {
    recordNavigation("redirect", { reason, destination: props.to });
  }, [reason, props.to]);
  return <Navigate {...props} />;
}
