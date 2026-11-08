import React from "react";
import { Gavel, ArrowUpRight } from "lucide-react";
import {
  PageHeader,
  PageTitle,
  PageDescription,
} from "../components/ui/PageContainer.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { money, date } from "../api.js";
import { useLanguage } from "../i18n.jsx";

/**
 * Screen 4a: Modernized Buyer Bids History Screen.
 * Displays all active and closed bids with round status, rank position badges,
 * pricing per kilogram, and direct links to lot detail dialogs.
 */
export function BidsScreen({ bids = [], user, onSelectLot }) {
  const { lang, t } = useLanguage();

  return (
    <>
      <PageHeader>
        <PageTitle
          eyebrow={t("bids_eyebrow", "FRESH OPPORTUNITIES, FAIR PRICES")}
          description={t("bids_desc", "Keep an eye on every bid you place.")}
        >
          {t("bids_title", "My bids")}
        </PageTitle>
      </PageHeader>

      <Card>
        <CardHeader>
          <div>
            <h2>
              {t("bids_history_heading", "Your bid history")} <span className="count">{bids.length}</span>
            </h2>
            <p>{t("bids_history_sub", "Accepted bids are binding and cannot be withdrawn.")}</p>
          </div>
        </CardHeader>

        {bids.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">{t("bids_th_lot", "Auction lot")}</th>
                  <th scope="col">{t("bids_th_round", "Round")}</th>
                  <th scope="col">{t("bids_th_your_bid", "Your bid / kg")}</th>
                  <th scope="col">{t("bids_th_highest", "Highest / kg")}</th>
                  <th scope="col">{t("bids_th_position", "Position")}</th>
                  <th scope="col">{t("bids_th_placed_at", "Placed at")}</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {bids.map((b) => {
                  const isClosed = b.status === "closed";
                  const isWinner = isClosed && b.winner_id === user?.id;
                  const isLeading = !isClosed && b.highest_buyer_id === user?.id;
                  const statusKey = isClosed
                    ? isWinner
                      ? "won"
                      : "closed"
                    : isLeading
                      ? "leading"
                      : "outbid";
                  const statusLabel = isClosed
                    ? isWinner
                      ? t("status_won", "Won")
                      : t("status_closed", "Closed")
                    : isLeading
                      ? t("status_leading", "Leading")
                      : t("status_outbid", "Outbid");

                  const speciesKey = b.species?.toLowerCase().replace(/\s+/g, "_");
                  const speciesLabel = (speciesKey && t(`species_${speciesKey}`, null)) || b.species;

                  return (
                    <tr key={b.id}>
                      <td>
                        <strong>{speciesLabel}</strong>
                        <small>{b.code}</small>
                      </td>
                      <td>{t("lot_modal_round", `Round ${b.round}`, { round: b.round })}</td>
                      <td>LKR {money(b.amount)}</td>
                      <td>LKR {money(b.highest_bid)}</td>
                      <td>
                        <Badge status={statusKey}>{statusLabel}</Badge>
                      </td>
                      <td>{date(b.created_at)}</td>
                      <td>
                        <Button
                          variant="icon"
                          aria-label={`${t("action_view_lot", "View")} ${b.code}`}
                          onClick={() => onSelectLot(b.lot_id)}
                        >
                          <ArrowUpRight size={18} aria-hidden="true" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Gavel}
            title={t("bids_empty_title", "No bids placed yet")}
            text={t("bids_empty_desc", "Explore live auctions to place your first bid.")}
          />
        )}
      </Card>
    </>
  );
}
