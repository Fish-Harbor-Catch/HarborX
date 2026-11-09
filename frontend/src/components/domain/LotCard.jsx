import React from "react";
import { Ship, MapPin, Clock, ArrowRight, Fish } from "lucide-react";
import { Timer } from "./Timer.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Button } from "../ui/Button.jsx";
import { money, date } from "../../api.js";
import { useLanguage } from "../../i18n.jsx";

/**
 * Modernized Lot Card component for auction catches.
 * Displays artwork, grade, active status badge, pricing, bids, and round timer.
 */
export function LotCard({ lot: l, onOpen }) {
  const { lang, t } = useLanguage();
  const active = l.status === "live" && new Date(l.round_ends_at) > new Date();

  const speciesKey = l.species?.toLowerCase().replace(/\s+/g, "_");
  const speciesLabel = (speciesKey && t(`species_${speciesKey}`, null)) || l.species;
  const harborKey = l.harbor?.toLowerCase().replace(/\s+/g, "_");
  const harborName = (harborKey && t(`harbor_${harborKey}`, null)) || l.harbor;
  const harborText = t("harbor_suffix", `${harborName} harbor`, { harbor: harborName });

  return (
    <article className="lot-card">
      <button
        className="lot-art"
        onClick={onOpen}
        aria-label={`${t("action_view_lot", "View")} ${l.species} ${l.code}`}
      >
        <span className="catch-placeholder" aria-label={t("catch_no_photo", "No catch photo supplied")}>
          <Fish size={42} strokeWidth={1.25} aria-hidden="true" />
          <small>{t("catch_no_photo", "No catch photo supplied")}</small>
        </span>
        <span className="lot-grade">
          {t("lot_card_grade", `Grade ${l.grade}`, { grade: l.grade })}
        </span>
        <span className="lot-status">
          <Badge
            status={
              active ? "live" : l.status === "live" ? "scheduled" : l.status
            }
          >
            {l.status === "live"
              ? active
                ? t("status_live", "Live auction")
                : t("helper_round_ended", "Round ended")
              : l.status === "pending"
                ? t("status_pending", "Awaiting review")
                : t(`status_${l.status}`, l.status)}
          </Badge>
        </span>
      </button>

      <div className="lot-body">
        <div className="lot-title">
          <div>
            <small>{l.code}</small>
            <h3>{speciesLabel}</h3>
          </div>
          <span className="weight-chip">{money(l.weight)} kg</span>
        </div>

        <div className="lot-meta">
          <span>
            <Ship size={13} aria-hidden="true" />
            {l.boat_name}
          </span>
          <span>
            <MapPin size={13} aria-hidden="true" />
            {harborText}
          </span>
        </div>

        <div className="lot-price">
          <div>
            <small>
              {l.highest_bid
                ? t("lot_card_highest_bid", "Highest bid")
                : t("lot_card_base_price", "Base price")}
            </small>
            <strong>
              LKR {money(l.highest_bid || l.base_price)}
              <span>{t("lot_card_per_kg", "/ kg")}</span>
            </strong>
          </div>
          <small>
            {t("lot_card_bids", `${l.bid_count} bids`, { count: l.bid_count })}
            <br />
            {l.round
              ? t("lot_card_round_of", `Round ${l.round} of 3`, { round: l.round })
              : t("lot_card_not_started", "Not started")}
          </small>
        </div>

        <div className="lot-bottom">
          <span>
            <Clock size={13} aria-hidden="true" />
            {l.status === "live" ? (
              <Timer until={l.round_ends_at} />
            ) : l.status === "closed" ? (
              t("lot_card_completed", "Auction completed")
            ) : (
              `ETA ${date(l.arrival_at, { day: undefined, month: undefined })}`
            )}
          </span>
          <Button variant="text" onClick={onOpen}>
            {t("action_view_lot", "View lot")}
            <ArrowRight size={14} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
}
