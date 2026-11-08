import React from "react";
import { Ship, MapPin, Clock, ArrowRight } from "lucide-react";
import { FishArt } from "./FishArt.jsx";
import { Timer } from "./Timer.jsx";
import { Badge } from "../ui/Badge.jsx";
import { Button } from "../ui/Button.jsx";
import { money, date } from "../../api.js";

/**
 * Modernized Lot Card component for auction catches.
 * Displays artwork, grade, active status badge, pricing, bids, and round timer.
 */
export function LotCard({ lot: l, onOpen }) {
  const active = l.status === "live" && new Date(l.round_ends_at) > new Date();

  return (
    <article className="lot-card">
      <button
        className="lot-art"
        onClick={onOpen}
        aria-label={`View ${l.species} ${l.code}`}
      >
        <FishArt type={l.image_key} />
        <span className="lot-grade">Grade {l.grade}</span>
        <span className="lot-status">
          <Badge
            status={
              active ? "live" : l.status === "live" ? "scheduled" : l.status
            }
          >
            {l.status === "live"
              ? active
                ? "Live auction"
                : "Round ended"
              : l.status === "pending"
                ? "Awaiting review"
                : l.status}
          </Badge>
        </span>
      </button>

      <div className="lot-body">
        <div className="lot-title">
          <div>
            <small>{l.code}</small>
            <h3>{l.species}</h3>
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
            {l.harbor} harbor
          </span>
        </div>

        <div className="lot-price">
          <div>
            <small>{l.highest_bid ? "Highest bid" : "Base price"}</small>
            <strong>
              LKR {money(l.highest_bid || l.base_price)}
              <span>/ kg</span>
            </strong>
          </div>
          <small>
            {l.bid_count} bids
            <br />
            {l.round ? `Round ${l.round} of 3` : "Not started"}
          </small>
        </div>

        <div className="lot-bottom">
          <span>
            <Clock size={13} aria-hidden="true" />
            {l.status === "live" ? (
              <Timer until={l.round_ends_at} />
            ) : l.status === "closed" ? (
              "Auction completed"
            ) : (
              `ETA ${date(l.arrival_at, { day: undefined, month: undefined })}`
            )}
          </span>
          <Button variant="text" onClick={onOpen}>
            View lot
            <ArrowRight size={14} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
}
