import React from "react";
import { Plus, ArrowRight, Clock, MapPin, Fish } from "lucide-react";
import {
  PageHeader,
  PageTitle,
  PageActions,
} from "../components/ui/PageContainer.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { ActivityList } from "../components/domain/index.js";
import { money } from "../api.js";
import { useLanguage } from "../i18n.jsx";

/** Operational overview; every metric and listing comes from authenticated API data. */
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
  const { t } = useLanguage();
  const recent = role === "seller" ? own : role === "admin" ? visible : live;
  const latest = [...recent]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);
  const title =
    role === "seller"
      ? t("overview_catch_heading", "Catch overview")
      : role === "admin"
        ? t("overview_operations_heading", "Harbor operations")
        : t("overview_auction_heading", "Auction overview");

  return (
    <>
      <PageHeader>
        <PageTitle description={user?.name}>{title}</PageTitle>
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
            <Button variant="primary" onClick={() => onNavigate("auctions")}>
              {t("action_explore_auctions", "View auctions")}{" "}
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          )}
        </PageActions>
      </PageHeader>

      <section className="stats-grid" aria-label="Key statistics">
        {stats.map(({ label, value, sub, icon: Icon, color }) => (
          <Card variant="stat" key={label}>
            <div className="stat-top">
              <span>{label}</span>
              <div className={`stat-icon ${color}`}>
                <Icon size={17} aria-hidden="true" />
              </div>
            </div>
            <strong>{value}</strong>
            <small>{sub}</small>
          </Card>
        ))}
      </section>

      <Card className="stage-panel">
        <div className="pipeline" aria-label="Auction pipeline stages">
          {[
            ["pending", t("status_pending", "Awaiting review")],
            ["scheduled", t("status_scheduled", "Scheduled")],
            ["live", t("status_live", "Live auction")],
            ["closed", t("status_closed", "Completed")],
          ].map(([status, label]) => (
            <div key={status}>
              <span className={`stage-dot ${status}`} aria-hidden="true" />
              <strong>{label}</strong>
              <span className="stage-value">
                {visible.filter((l) => l.status === status).length}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="overview-grid">
        <Card className="auctions-panel">
          <CardHeader>
            <h2>
              {role === "seller"
                ? t("overview_panel_seller_catches", "Your latest catches")
                : role === "admin"
                  ? t("overview_recent_lots", "Recent auction lots")
                  : t("overview_panel_live_harbor", "Live at the harbor")}
              <span className="count">{recent.length}</span>
            </h2>
            <Button
              variant="text"
              onClick={() =>
                onNavigate(role === "seller" ? "catches" : "auctions")
              }
            >
              {t("action_view_all", "View all")}{" "}
              <ArrowRight size={15} aria-hidden="true" />
            </Button>
          </CardHeader>
          {latest.length ? (
            <div className="recent-lots">
              {latest.map((lot) => {
                const active =
                  lot.status === "live" &&
                  new Date(lot.round_ends_at) > new Date();
                return (
                  <button
                    className="recent-lot"
                    key={lot.id}
                    onClick={() => onSelectLot(lot.id)}
                    aria-label={`${t("action_view_lot", "View lot")} ${lot.species} ${lot.code}`}
                  >
                    <span className="recent-fish" aria-hidden="true">
                      <Fish size={26} strokeWidth={1.4} />
                    </span>
                    <span className="recent-species">
                      <small>{lot.code}</small>
                      <strong>{lot.species}</strong>
                      <span>
                        <MapPin size={12} aria-hidden="true" /> {lot.harbor}
                        <span className="recent-mobile-weight">
                          {" "}
                          · {money(lot.weight)} kg
                        </span>
                      </span>
                    </span>
                    <span className="recent-quantity">
                      <strong>{money(lot.weight)} kg</strong>
                      <small>{lot.boat_name}</small>
                    </span>
                    <span className="recent-price">
                      <strong>
                        LKR {money(lot.highest_bid || lot.base_price)}
                      </strong>
                      <small>{t("lot_card_per_kg", "/ kg")}</small>
                    </span>
                    <Badge
                      status={
                        active
                          ? "live"
                          : lot.status === "live"
                            ? "scheduled"
                            : lot.status
                      }
                    >
                      {lot.status === "live" && !active
                        ? t("helper_round_ended", "Round ended")
                        : t(`status_${lot.status}`, lot.status)}
                    </Badge>
                    <ArrowRight
                      size={16}
                      className="recent-arrow"
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title={t("list_empty_title", "No catches found")}
              text={t(
                "list_empty_desc",
                "Try another filter, or check back when new catches arrive.",
              )}
            />
          )}
        </Card>

        <Card className="activity-panel">
          <CardHeader>
            <h2>{t("overview_panel_recent_activity", "Recent activity")}</h2>
            <Clock size={17} aria-hidden="true" />
          </CardHeader>
          <ActivityList events={events.slice(0, 4)} />
          <Button
            variant="text"
            className="activity-link"
            onClick={() => onNavigate("activity")}
          >
            {t("action_view_activity", "View activity log")}{" "}
            <ArrowRight size={15} aria-hidden="true" />
          </Button>
        </Card>
      </div>
    </>
  );
}
