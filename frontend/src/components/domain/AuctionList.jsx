import React, { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { LotCard } from "./LotCard.jsx";
import { Card } from "../ui/Card.jsx";
import { EmptyState } from "../ui/EmptyState.jsx";
import { useLanguage } from "../../i18n.jsx";

/**
 * Modernized Auction and Catch List component.
 * Provides multi-facet search, harbor filters, sort ordering, status tabs,
 * and responsive lot card grid.
 */
export function AuctionList({ lots, search, setSearch, onOpen, role, type }) {
  const { lang, t } = useLanguage();
  const [status, setStatus] = useState("all");
  const [harbor, setHarbor] = useState("all");
  const [sort, setSort] = useState("newest");

  const filtered = lots
    .filter(
      (l) =>
        (status === "all" || l.status === status) &&
        (harbor === "all" || l.harbor === harbor) &&
        `${l.species} ${l.code} ${l.boat_name} ${l.seller_name}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "price"
        ? Number(a.highest_bid || a.base_price) -
          Number(b.highest_bid || b.base_price)
        : new Date(b.created_at) - new Date(a.created_at),
    );

  const availableHarbors = [...new Set(lots.map((l) => l.harbor))].sort();

  const statusTabList = [
    "all",
    ...(role === "admin" || type === "catches" ? ["pending"] : []),
    "live",
    "scheduled",
    "closed",
    ...(type === "catches" || role === "admin"
      ? ["unsold", "cancelled"]
      : []),
  ];

  return (
    <>
      <div className="filters-bar">
        <div className="search-box">
          <Search size={17} aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("list_search_placeholder", "Search fish, lot ID or boat…")}
            aria-label={t("list_search_placeholder", "Search auction lots")}
          />
        </div>
        <div className="filter-controls">
          <div className="select-icon">
            <MapPin size={15} aria-hidden="true" />
            <select
              aria-label="Filter by harbor"
              value={harbor}
              onChange={(e) => setHarbor(e.target.value)}
            >
              <option value="all">{t("list_all_harbors", "All harbors")}</option>
              {availableHarbors.map((h) => {
                const harborKey = h.toLowerCase().replace(/\s+/g, "_");
                const label = t(`harbor_${harborKey}`, h);
                return (
                  <option key={h} value={h}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
          <select
            aria-label="Sort auctions"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">{t("list_sort_newest", "Newest first")}</option>
            <option value="price">{t("list_sort_price", "Price: low to high")}</option>
          </select>
        </div>
      </div>

      <div className="status-tabs" role="tablist" aria-label="Filter by auction status">
        {statusTabList.map((s) => {
          const count =
            s === "all"
              ? lots.length
                : lots.filter((l) => l.status === s).length;
          const label =
            s === "all"
              ? t("list_all_lots", "All lots")
              : s === "pending"
                ? t("status_pending", "Awaiting review")
                : t(`status_${s}`, s[0].toUpperCase() + s.slice(1));

          return (
            <button
              key={s}
              role="tab"
              aria-selected={status === s}
              className={status === s ? "selected" : ""}
              onClick={() => setStatus(s)}
            >
              {label}
              <span>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="listing-summary" role="status">
        <span>{filtered.length} / {lots.length} {t("listing_catches", "catches")}</span>
        {(search || harbor !== "all" || status !== "all") && (
          <button className="text-btn" onClick={() => { setSearch(""); setHarbor("all"); setStatus("all"); }}>
            {t("listing_clear", "Clear filters")}
          </button>
        )}
      </div>
      {filtered.length ? (
        <div className="lot-grid">
          {filtered.map((l) => (
            <LotCard key={l.id} lot={l} onOpen={() => onOpen(l.id)} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            title={t("list_empty_title", "No catches found")}
            text={t("list_empty_desc", "Try another filter, or check back when new catches arrive.")}
          />
        </Card>
      )}
    </>
  );
}
