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

/**
 * Screen 6: Modernized User Management Screen (Admin).
 * Manages harbor accounts, verifies buyer bidding privileges,
 * and handles active/disabled account states.
 */
export function UsersScreen({ users = [], run, busy = false }) {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <PageHeader>
        <PageTitle
          eyebrow="HARBOR OPERATIONS"
          description="Manage access and verify your harbor community."
        >
          User management
        </PageTitle>
      </PageHeader>

      <Card>
        <CardHeader>
          <div>
            <h2>
              Your harbor community <span className="count">{users.length}</span>
            </h2>
            <p>Only verified Buyers can participate in bidding.</p>
          </div>
          <div className="search-box">
            <Search size={16} aria-hidden="true" />
            <input
              aria-label="Search users"
              placeholder="Find a user…"
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
                  <th scope="col">Name</th>
                  <th scope="col">Role</th>
                  <th scope="col">Phone</th>
                  <th scope="col">Verification</th>
                  <th scope="col">Account</th>
                  <th scope="col">Action</th>
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
                      {ROLES_LABEL[u.role] || u.role}
                    </td>
                    <td>{u.phone || "—"}</td>
                    <td>
                      <Badge status={u.verified ? "verified" : "pending"}>
                        {u.verified ? "Verified" : "Unverified"}
                      </Badge>
                    </td>
                    <td>
                      <Badge status={u.active ? "active" : "cancelled"}>
                        {u.active ? "Active" : "Disabled"}
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
                                "Buyer verified.",
                              )
                            }
                          >
                            Verify
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
                                `Account ${u.active ? "disabled" : "enabled"}.`,
                              )
                            }
                          >
                            {u.active ? "Disable" : "Enable"}
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
            title="No users found"
            text="Try another search term or check back later."
          />
        )}
      </Card>
    </>
  );
}
