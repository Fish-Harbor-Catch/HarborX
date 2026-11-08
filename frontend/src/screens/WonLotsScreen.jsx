import React from "react";
import {
  PageHeader,
  PageTitle,
  PageDescription,
} from "../components/ui/PageContainer.jsx";
import { AuctionList } from "../components/domain/index.js";

/**
 * Screen 4b: Modernized Buyer Won Lots Screen.
 * Displays all completed lots won by the current buyer,
 * with search, filtering, and invoice payment statuses.
 */
export function WonLotsScreen({
  won = [],
  search = "",
  setSearch,
  onSelectLot,
  role = "buyer",
}) {
  return (
    <>
      <PageHeader>
        <PageTitle
          eyebrow="FRESH OPPORTUNITIES, FAIR PRICES"
          description="Your successful bids, ready for the next step."
        >
          Won lots
        </PageTitle>
      </PageHeader>

      <AuctionList
        lots={won}
        search={search}
        setSearch={setSearch}
        onOpen={onSelectLot}
        role={role}
        type="won"
      />
    </>
  );
}
