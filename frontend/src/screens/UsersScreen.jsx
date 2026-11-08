import React, { useState } from "react";
import { Search, Users } from "lucide-react";
import {
  PageHeader,
  PageTitle,
  PageDescription,
} from "../components/ui/PageContainer.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { api, initials } from "../api.js";
import { ROLES_LABEL } from "../components/layout/nav-config.js";
import { useLanguage } from "../i18n.jsx";

/**
 * Screen 6: Modernized User Management Screen (Admin).
 * Manages harbor accounts, verifies buyer bidding privileges,
 * and handles active/disabled account states.
 */
export function UsersScreen({ users = [], run, busy = false }) {
  const { lang, t } = useLanguage();
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <PageHeader>
        <PageTitle
          eyebrow={t("users_eyebrow", "HARBOR OPERATIONS")}
          description={t("users_desc", "Manage access and verify your harbor community.")}
        >
          {t("users_title", "User management")}
        </PageTitle>
      </PageHeader>

      <Card>
        <CardHeader>
          <div>
            <h2>
              {t("users_heading", "Your harbor community")} <span className="count">{users.length}</span>
            </h2>
            <p>{t("users_heading_sub", "Only verified Buyers can participate in bidding.")}</p>
          </div>
          <div className="search-box">
            <Search size={16} aria-hidden="true" />
            <input
              aria-label={t("users_search_placeholder", "Search users")}
              placeholder={t("users_search_placeholder", "Find a user…")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        {filteredUsers.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">{t("users_th_name", "Name")}</th>
                  <th scope="col">{t("users_th_role", "Role")}</th>
                  <th scope="col">{t("users_th_phone", "Phone")}</th>
                  <th scope="col">{t("users_th_verification", "Verification")}</th>
                  <th scope="col">{t("users_th_account", "Account")}</th>
                  <th scope="col">{t("users_th_action", "Action")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <span className="avatar small" aria-hidden="true">
                          {initials(u.name)}
                        </span>
                        <div>
                          <strong>{u.name}</strong>
                          <small>{u.email}</small>
                        </div>
                      </div>
                    </td>
                    <td className="capitalize">
                      {lang !== "en" ? t(`role_${u.role}`, ROLES_LABEL[u.role] || u.role) : (ROLES_LABEL[u.role] || u.role)}
                    </td>
                    <td>{u.phone || "—"}</td>
                    <td>
                      <Badge status={u.verified ? "verified" : "pending"}>
                        {u.verified ? t("status_verified", "Verified") : t("status_unverified", "Unverified")}
                      </Badge>
                    </td>
                    <td>
                      <Badge status={u.active ? "active" : "cancelled"}>
                        {u.active ? t("status_active", "Active") : t("status_disabled", "Disabled")}
                      </Badge>
                    </td>
                    <td>
                      <div className="table-actions">
                        {u.role === "buyer" && !u.verified && (
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={busy}
                            onClick={() =>
                              run(
                                () =>
                                  api(`/users/${u.id}`, {
                                    method: "PATCH",
                                    body: { verified: true },
                                  }),
                                t("user_verified_toast", "Buyer verified."),
                              )
                            }
                          >
                            {t("action_verify", "Verify")}
                          </Button>
                        )}
                        {u.role !== "admin" && (
                          <Button
                            size="sm"
                            variant={u.active ? "secondary" : "primary"}
                            disabled={busy}
                            onClick={() =>
                              run(
                                () =>
                                  api(`/users/${u.id}`, {
                                    method: "PATCH",
                                    body: { active: !u.active },
                                  }),
                                t("user_account_status_toast", `Account ${u.active ? "disabled" : "enabled"}.`, { status: u.active ? "disabled" : "enabled" }),
                              )
                            }
                          >
                            {u.active ? t("action_disable", "Disable") : t("action_enable", "Enable")}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title={t("users_empty_title", "No users match your search")}
            text={t("users_empty_desc", "Try searching with a different name or email address.")}
          />
        )}
      </Card>
    </>
  );
}
