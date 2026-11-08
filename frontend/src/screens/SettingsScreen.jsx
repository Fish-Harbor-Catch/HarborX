import React from "react";
import { UserRound, ShieldCheck, Check } from "lucide-react";
import {
  PageHeader,
  PageTitle,
  PageDescription,
} from "../components/ui/PageContainer.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { api, initials } from "../api.js";
import { ROLES_LABEL } from "../components/layout/nav-config.js";

/**
 * Screen 9: Modernized Settings and Auction Rules Screen.
 * Account profile updating, verification badge, and codified harbor rules.
 */
export function SettingsScreen({ user, onUser, run, busy = false }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await run(async () => {
      const d = await api("/auth/profile", {
        method: "PATCH",
        body: {
          name: f.get("name"),
          phone: f.get("phone"),
          boat_name: f.get("boat_name") || "",
        },
      });
      onUser(d.user);
    }, "Your profile was updated.");
  };

  const roleLabel = ROLES_LABEL[user?.role] || user?.role;

  return (
    <>
      <PageHeader>
        <PageTitle
          eyebrow="ACCOUNT & GOVERNANCE"
          description="Your account and the rules that keep trading fair."
        >
          Settings
        </PageTitle>
      </PageHeader>

      <div className="settings-grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <CardHeader>
            <div>
              <h2>Account profile</h2>
              <p>Your details in the harbor community.</p>
            </div>
            <UserRound size={20} aria-hidden="true" />
          </CardHeader>

          <div className="profile-summary">
            <span className="avatar big" aria-hidden="true">
              {initials(user?.name)}
            </span>
            <div>
              <strong>{user?.name}</strong>
              <small>
                {roleLabel} ·{" "}
                {user?.verified ? "Verified" : "Awaiting verification"}
              </small>
            </div>
          </div>

          <label>
            Full name
            <input
              name="name"
              defaultValue={user?.name}
              required
              minLength={2}
            />
          </label>

          <label>
            Email address
            <input value={user?.email || ""} disabled />
            <small>Email changes require manager assistance.</small>
          </label>

          <label>
            Phone number
            <input
              name="phone"
              defaultValue={user?.phone || ""}
              type="tel"
              maxLength={30}
            />
          </label>

          {user?.role === "seller" && (
            <label>
              Boat name
              <input
                name="boat_name"
                defaultValue={user?.boat_name || ""}
                maxLength={100}
              />
            </label>
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={busy}
            icon={<Check size={15} aria-hidden="true" />}
          >
            Save changes
          </Button>
        </form>

        <section className="panel rules-panel">
          <CardHeader>
            <div>
              <h2>Auction rules</h2>
              <p>A clear process. A fair outcome.</p>
            </div>
            <ShieldCheck size={20} aria-hidden="true" />
          </CardHeader>

          {[
            [
              "Prices are per kilogram",
              "The first bid must meet the base price. Later bids must meet the highest bid plus the lot’s minimum increment.",
            ],
            [
              "Up to three rounds",
              "Verified Buyers may join any active round. Only the Auction Manager can start, end, or close auctions.",
            ],
            [
              "Server order decides equal bids",
              "The first valid bid committed by the server is accepted. Equal subsequent bids are rejected. Device clocks are not used.",
            ],
            [
              "Verify the catch before final sale",
              "The manager confirms arrival and inspected weight. A weight different from the advertised catch requires cancellation and relisting.",
            ],
            [
              "Offline drafts, online bidding",
              "Catch drafts can be saved on this device. Bids require a connection and server confirmation; they are never queued offline.",
            ],
            [
              "Payments and commission",
              "The manager records received payments and references. The configured harbor commission is deducted from seller proceeds. No online payment gateway is included.",
            ],
          ].map(([title, text], i) => (
            <div className="rule" key={title}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
