import React from "react";
import { Link } from "react-router";
import { Logo } from "../components/layout/Logo.jsx";
import { useLanguage } from "../i18n.jsx";
import { pagePath } from "./route-config.js";

export default function NotFoundPage({ user }) {
  const { t } = useLanguage();
  return (
    <main className="offline-workspace">
      <Logo />
      <h1>{t("route_not_found_title", "Page not found")}</h1>
      <p>
        {t("route_not_found_description", "This HarborX page does not exist.")}
      </p>
      <Link className="btn primary" to={user ? pagePath(user.role) : "/login"}>
        {t("route_return_home", "Return to HarborX")}
      </Link>
    </main>
  );
}
