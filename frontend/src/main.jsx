import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";
import "./workspace.css";

if (import.meta.env.DEV) {
  try {
    if (sessionStorage.getItem("harborx.navigationDebug") === "1") {
      const { installNavigationDebug } = await import(
        "./app/debug/navigation-debug.js"
      );
      installNavigationDebug();
    }
  } catch {
    // Optional diagnostics must never prevent the application from rendering.
  }
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
