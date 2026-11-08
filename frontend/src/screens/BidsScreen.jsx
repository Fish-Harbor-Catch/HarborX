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

/**
 * Screen 4a: Modernized Buyer Bids History Screen.
 * Displays all active and closed bids with round status, rank position badges,
 * pricing per kilogram, and direct links to lot detail dialogs.
 */
export function BidsScreen({ bids = [], user, onSelectLot }) {
  return (
    <>
      <PageHeader>
        <PageTitle
          eyebrow="FRESH OPPORTUNITIES, FAIR PRICES"
          description="Keep an eye on every bid you place."
        >
          My bids
        </PageTitle>
      </PageHeader>

      <Card>
        <CardHeader>
          <div>
            <h2>
              Your bid history <span className="count">{bids.length}</span>
            </h2>
            <p>Accepted bids are binding and cannot be withdrawn.</p>
          </div>
        </CardHeader>

        {bids.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Auction lot</th>
                  <th scope="col">Round</th>
                  <th scope="col">Your bid / kg</th>
                  <th scope="col">Highest / kg</th>
                  <th scope="col">Position</th>
                  <th scope="col">Placed at</th>
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
                      ? "Won"
                      : "Closed"
                    : isLeading
                      ? "Leading"
                      : "Outbid";

                  return (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.species}</strong>
                        <small>{b.code}</small>
                      </td>
                      <td>Round {b.round}</td>
                      <td>LKR {money(b.amount)}</td>
                      <td>LKR {money(b.highest_bid)}</td>
                      <td>
                        <Badge status={statusKey}>{statusLabel}</Badge>
                      </td>
                      <td>{date(b.created_at)}</td>
                      <td>
                        <Button
                          variant="icon"
                          aria-label={`View ${b.code}`}
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
            title="Your first bid is waiting"
            text="Explore auctions and place a bid to get started."
          />
        )}
      </Card>
    </>
  );
}
