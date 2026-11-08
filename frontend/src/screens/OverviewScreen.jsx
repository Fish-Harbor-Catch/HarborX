import React from "react";
import {
  Plus,
  Clock,
  ArrowRight,
  Activity,
  ChevronRight,
} from "lucide-react";
import {
  PageHeader,
  PageTitle,
  PageDescription,
  PageActions,
} from "../components/ui/PageContainer.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { HarborArt, LotCard, ActivityList } from "../components/domain/index.js";

/**
 * Screen 1: Modernized Overview Dashboard.
 * Displays welcome greeting, hero banner, metrics statistics grid,
 * latest live/seller catches, recent workspace activity, and auction pipeline.
 */
export function OverviewScreen({
  user,
  role = "seller",
  stats = [],
  own = [],
  live = [],
  visible = [],
  events = [],
  onNavigate,
  onSelectLot,
  onRegisterCatch,
}) {
  const eyebrow =
    role === "admin"
      ? "HARBOR OPERATIONS"
      : role === "seller"
        ? "FROM YOUR BOAT TO THE MARKET"
        : "FRESH OPPORTUNITIES, FAIR PRICES";

  const firstName = user?.name ? user.name.split(" ")[0] : "Captain";
  const activeLots = role === "seller" ? own : live;

  return (
    <>
      <PageHeader>
        <PageTitle
          eyebrow={eyebrow}
          description="Here’s what’s happening at your harbor today."
        >
          Welcome back, {firstName}.
        </PageTitle>

        <PageActions>
          {role === "seller" ? (
            <Button
              variant="primary"
              onClick={onRegisterCatch}
              icon={<Plus size={17} aria-hidden="true" />}
            >
              Register catch
            </Button>
          ) : (
            <span className="date-pill">
              <Clock size={15} aria-hidden="true" />
              {new Date().toLocaleDateString("en-GB", {
                timeZone: "Asia/Colombo",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </PageActions>
      </PageHeader>

      <section className="hero-banner">
        <div>
          <div className="hero-kicker">
            <span aria-hidden="true" /> YOUR HARBOR. IN SYNC.
          </div>
          <h2>
            {role === "seller"
              ? "A good catch deserves a fair price."
              : role === "buyer"
                ? "Your next fresh catch starts here."
                : "A clearer view of every catch."}
          </h2>
          <p>
            {role === "admin"
              ? "Connect your fishing community with transparent, well-managed auctions."
              : "Discover the difference a connected harbor makes."}
          </p>
          <Button
            variant="white"
            onClick={() => onNavigate(role === "seller" ? "catches" : "auctions")}
          >
            {role === "seller" ? "View my catches" : "Explore auctions"}
            <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </div>
        <HarborArt />
      </section>

      <section className="stats-grid" aria-label="Key statistics">
        {stats.map(({ label, value, sub, icon: Icon, color }) => (
          <Card variant="stat" key={label}>
            <div className="stat-top">
              <span>{label}</span>
              <div className={`stat-icon ${color}`}>
                <Icon size={20} aria-hidden="true" />
              </div>
            </div>
            <strong>{value}</strong>
            <small>{sub}</small>
          </Card>
        ))}
      </section>

      <div className="overview-grid">
        <Card className="auctions-panel">
          <CardHeader>
            <div>
              <h2>
                {role === "seller" ? "Your latest catches" : "Live at the harbor"}
                <span className="count">{activeLots.length}</span>
              </h2>
              <p>
                {role === "seller"
                  ? "Follow your catch through every stage."
                  : "Fresh catches. Open bidding. Real opportunities."}
              </p>
            </div>
            <Button
              variant="text"
              onClick={() =>
                onNavigate(role === "seller" ? "catches" : "auctions")
              }
            >
              View all
              <ArrowRight size={15} aria-hidden="true" />
            </Button>
          </CardHeader>

          {activeLots.length > 0 ? (
            <div className="lot-grid compact">
              {activeLots.slice(0, 2).map((l) => (
                <LotCard key={l.id} lot={l} onOpen={() => onSelectLot(l.id)} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No active catches yet"
              text="Published catches will appear here."
            />
          )}
        </Card>

        <Card className="activity-panel">
          <CardHeader>
            <div>
              <h2>Recent activity</h2>
              <p>Your harbor, at a glance.</p>
            </div>
            <Activity size={18} aria-hidden="true" />
          </CardHeader>
          <ActivityList events={events.slice(0, 4)} />
          <Button
            variant="text"
            className="activity-link"
            onClick={() => onNavigate("activity")}
          >
            View activity log
            <ArrowRight size={15} aria-hidden="true" />
          </Button>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <h2>
              {role === "admin" ? "Auction pipeline" : "Your trading summary"}
            </h2>
            <p>From registered catch to completed sale.</p>
          </div>
          <span className="muted small-text">LKR · Sri Lanka</span>
        </CardHeader>
        <div className="pipeline" aria-label="Auction pipeline stages">
          {[
            ["pending", "Awaiting review"],
            ["scheduled", "Scheduled"],
            ["live", "In auction"],
            ["closed", "Completed"],
          ].map(([s, label], i) => (
            <div key={s}>
              <span className={`pipeline-number p${i}`}>
                {visible.filter((l) => l.status === s).length}
              </span>
              <div>
                <strong>{label}</strong>
                <small>
                  {s === "closed" ? "Sales recorded" : "Auction lots"}
                </small>
              </div>
              {i < 3 && <ChevronRight size={20} aria-hidden="true" />}
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
