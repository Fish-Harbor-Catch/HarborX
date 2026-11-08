import React from "react";
import {
  PageHeader,
  PageTitle,
  PageDescription,
} from "../components/ui/PageContainer.jsx";
import { AuctionList } from "../components/domain/index.js";
import { useLanguage } from "../i18n.jsx";

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
  const { lang, t } = useLanguage();

  return (
    <>
      <PageHeader>
        <PageTitle
          eyebrow={t("won_eyebrow", "BUYER PORTAL")}
          description={t("won_desc", "Completed auction lots awarded to your account.")}
        >
          {t("won_title", "Won lots")}
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
