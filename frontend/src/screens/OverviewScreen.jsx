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
import { useLanguage } from "../i18n.jsx";

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
  const { lang, t } = useLanguage();

  const eyebrow =
    role === "admin"
      ? t("overview_eyebrow_admin", "HARBOR OPERATIONS")
      : role === "seller"
        ? t("overview_eyebrow_seller", "SELLER PORTAL")
        : t("overview_eyebrow_buyer", "BUYER PORTAL");

  const firstName = user?.name ? user.name.split(" ")[0] : "Captain";
  const activeLots = role === "seller" ? own : live;

  return (
    <>
      <PageHeader>
        <PageTitle
          eyebrow={eyebrow}
          description={t("overview_description", "Harbor auction activity, catch status, and trading summary.")}
        >
          {t("overview_greeting", `Welcome back, ${firstName}.`, { name: firstName })}
        </PageTitle>

        <PageActions>
          {role === "seller" ? (
            <Button
              variant="primary"
              onClick={onRegisterCatch}
              icon={<Plus size={17} aria-hidden="true" />}
            >
              {t("action_register_catch", "Register catch")}
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
            <span aria-hidden="true" /> {t("overview_hero_kicker", "DAILY OVERVIEW")}
          </div>
          <h2>
            {role === "seller"
              ? t("overview_hero_seller", "Catches and auction sales")
              : role === "buyer"
                ? t("overview_hero_buyer", "Live auctions and bidding")
                : t("overview_hero_admin", "Harbor auctions and catch inspection")}
          </h2>
          <p>
            {role === "admin"
              ? t("overview_hero_desc_admin", "Supervise arrivals, inspect weights, manage bidding rounds, and record payments.")
              : t("overview_hero_desc_general", "Track dockside auction rounds, weight inspection, and payment settlement.")}
          </p>
          <Button
            variant="white"
            onClick={() => onNavigate(role === "seller" ? "catches" : "auctions")}
          >
            {role === "seller"
              ? t("action_view_my_catches", "View my catches")
              : t("action_explore_auctions", "View auctions")}
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
                {role === "seller"
                  ? t("overview_panel_seller_catches", "Your latest catches")
                  : t("overview_panel_live_harbor", "Live at the harbor")}
                <span className="count">{activeLots.length}</span>
              </h2>
              <p>
                {role === "seller"
                  ? t("overview_panel_seller_sub", "Recent catches submitted from your boat.")
                  : t("overview_panel_buyer_sub", "Active auctions open for bidding.")}
              </p>
            </div>
            <Button
              variant="text"
              onClick={() =>
                onNavigate(role === "seller" ? "catches" : "auctions")
              }
            >
              {t("action_view_all", "View all")}
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
              title={t("list_empty_title", "No active catches yet")}
              text={t("list_empty_desc", "Published catches will appear here.")}
            />
          )}
        </Card>

        <Card className="activity-panel">
          <CardHeader>
            <div>
              <h2>{t("overview_panel_recent_activity", "Recent activity")}</h2>
              <p>{t("overview_panel_recent_activity_sub", "Latest auction and payment events.")}</p>
            </div>
            <Activity size={18} aria-hidden="true" />
          </CardHeader>
          <ActivityList events={events.slice(0, 4)} />
          <Button
            variant="text"
            className="activity-link"
            onClick={() => onNavigate("activity")}
          >
            {t("action_view_activity", "View activity log")}
            <ArrowRight size={15} aria-hidden="true" />
          </Button>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <h2>
              {role === "admin"
                ? t("overview_panel_pipeline_admin", "Auction pipeline")
                : t("overview_panel_pipeline_general", "Your trading summary")}
            </h2>
            <p>{t("overview_panel_pipeline_sub", "Catches grouped by current auction stage.")}</p>
          </div>
          <span className="muted small-text">LKR · Sri Lanka</span>
        </CardHeader>
        <div className="pipeline" aria-label="Auction pipeline stages">
          {[
            ["pending", t("status_pending", "Awaiting review")],
            ["scheduled", t("status_scheduled", "Scheduled")],
            ["live", t("status_live", "In auction")],
            ["closed", t("status_closed", "Completed")],
          ].map(([s, label], i) => (
            <div key={s}>
              <span className={`pipeline-number p${i}`}>
                {visible.filter((l) => l.status === s).length}
              </span>
              <div>
                <strong>{label}</strong>
                <small>
                  {s === "closed"
                    ? t("overview_pipeline_sales_recorded", "Sales recorded")
                    : t("overview_pipeline_auction_lots", "Auction lots")}
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
