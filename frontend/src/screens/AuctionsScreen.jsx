import React from "react";
import { Clock } from "lucide-react";
import {
  PageHeader,
  PageTitle,
  PageDescription,
  PageActions,
} from "../components/ui/PageContainer.jsx";
import { AuctionList } from "../components/domain/index.js";

/**
 * Screen 2: Modernized Auctions Screen.
 * Displays marketplace auctions with search, harbor filtering, sorting,
 * status tabs, and interactive lot cards.
 */
export function AuctionsScreen({
  role = "buyer",
  lots = [],
  search = "",
  setSearch,
  onSelectLot,
}) {
  const eyebrow =
    role === "admin"
      ? "HARBOR OPERATIONS"
      : role === "seller"
        ? "FROM YOUR BOAT TO THE MARKET"
        : "FRESH OPPORTUNITIES, FAIR PRICES";

  const visibleLots = lots.filter(
    (l) => role === "admin" || !["pending", "cancelled"].includes(l.status),
  );

  return (
    <>
      <PageHeader>
        <PageTitle
          eyebrow={eyebrow}
          description="Explore fresh catches and follow the latest auction activity."
        >
          Auctions
        </PageTitle>

        <PageActions>
          <span className="date-pill">
            <Clock size={15} aria-hidden="true" />
            {new Date().toLocaleDateString("en-GB", {
              timeZone: "Asia/Colombo",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </PageActions>
      </PageHeader>

      <AuctionList
        lots={visibleLots}
        search={search}
        setSearch={setSearch}
        onOpen={onSelectLot}
        role={role}
        type="auctions"
      />
    </>
  );
}
