import React, { useState } from "react";
import { Wallet, ArrowUpRight } from "lucide-react";
import {
  PageHeader,
  PageTitle,
  PageDescription,
} from "../components/ui/PageContainer.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Badge } from "../components/ui/Badge.jsx";
import { Button } from "../components/ui/Button.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { money } from "../api.js";

/**
 * Screen 5: Modernized Payments and Invoices Screen.
 * Displays financial balances, recorded payments, outstanding amounts,
 * payment status filters, and invoice breakdown tables.
 */
export function PaymentsScreen({ invoices = [], role = "seller", onOpen }) {
  const [filter, setFilter] = useState("all");

  const shown = invoices.filter(
    (l) => filter === "all" || l.payment_status === filter,
  );

  const totalFinalPrice = invoices.reduce(
    (n, l) => n + Number(l.final_price || 0),
    0,
  );
  const totalPaidAmount = invoices.reduce(
    (n, l) => n + Number(l.paid_amount || 0),
    0,
  );
  const totalBalance = invoices.reduce(
    (n, l) => n + Number(l.balance || 0),
    0,
  );

  const eyebrow =
    role === "admin"
      ? "HARBOR OPERATIONS"
      : role === "seller"
        ? "FROM YOUR BOAT TO THE MARKET"
        : "FRESH OPPORTUNITIES, FAIR PRICES";

  return (
    <>
      <PageHeader>
        <PageTitle
          eyebrow={eyebrow}
          description="A clear view of invoices, payments, and outstanding balances."
        >
          Payments
        </PageTitle>
      </PageHeader>

      <div className="stats-grid three" aria-label="Financial overview">
        <Card variant="stat">
          <span className="muted">Total invoice value</span>
          <strong>LKR {money(totalFinalPrice)}</strong>
          <small>Recorded auction sales</small>
        </Card>
        <Card variant="stat">
          <span className="muted">Payments recorded</span>
          <strong>LKR {money(totalPaidAmount)}</strong>
          <small>Cash and bank references</small>
        </Card>
        <Card variant="stat">
          <span className="muted">Outstanding balance</span>
          <strong>LKR {money(totalBalance)}</strong>
          <small>Awaiting buyer payment</small>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <h2>Auction invoices</h2>
            <p>
              {role === "admin"
                ? "Select an invoice to record a received payment."
                : "Payments are confirmed and recorded by the auction manager."}
            </p>
          </div>
          <select
            aria-label="Filter invoices"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {["all", "Pending", "Partially Paid", "Paid", "Overdue"].map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All payments" : s}
              </option>
            ))}
          </select>
        </CardHeader>

        {shown.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Invoice / lot</th>
                  <th scope="col">Buyer</th>
                  <th scope="col">Total</th>
                  <th scope="col">Paid</th>
                  <th scope="col">Balance</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {shown.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <strong>{l.code}</strong>
                      <small>{l.species}</small>
                    </td>
                    <td>{l.winner_name}</td>
                    <td>
                      LKR {money(l.final_price)}
                      <small>Commission: {money(l.commission)}</small>
                    </td>
                    <td>{money(l.paid_amount)}</td>
                    <td>{money(l.balance)}</td>
                    <td>
                      <Badge status={l.payment_status} />
                    </td>
                    <td>
                      <Button variant="text" onClick={() => onOpen(l.id)}>
                        Details
                        <ArrowUpRight size={14} aria-hidden="true" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Wallet}
            title="No matching invoices"
            text="Completed sales and their payment records will appear here."
          />
        )}
      </Card>
    </>
  );
}
