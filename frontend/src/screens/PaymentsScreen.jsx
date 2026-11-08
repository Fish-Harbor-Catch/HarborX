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
import { useLanguage } from "../i18n.jsx";

/**
 * Screen 5: Modernized Payments and Invoices Screen.
 * Displays financial balances, recorded payments, outstanding amounts,
 * payment status filters, and invoice breakdown tables.
 */
export function PaymentsScreen({ invoices = [], role = "seller", onOpen }) {
  const { lang, t } = useLanguage();
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
      ? t("overview_eyebrow_admin", "HARBOR OPERATIONS")
      : role === "seller"
        ? t("overview_eyebrow_seller", "FROM YOUR BOAT TO THE MARKET")
        : t("overview_eyebrow_buyer", "FRESH OPPORTUNITIES, FAIR PRICES");

  return (
    <>
      <PageHeader>
        <PageTitle
          eyebrow={eyebrow}
          description={t("payments_desc", "A clear view of invoices, payments, and outstanding balances.")}
        >
          {t("payments_title", "Payments")}
        </PageTitle>
      </PageHeader>

      <div className="stats-grid three" aria-label="Financial overview">
        <Card variant="stat">
          <span className="muted">{t("payments_stat_total_value", "Total invoice value")}</span>
          <strong>LKR {money(totalFinalPrice)}</strong>
          <small>{t("payments_stat_total_value_sub", "Recorded auction sales")}</small>
        </Card>
        <Card variant="stat">
          <span className="muted">{t("payments_stat_recorded", "Payments recorded")}</span>
          <strong>LKR {money(totalPaidAmount)}</strong>
          <small>{t("payments_stat_recorded_sub", "Cash and bank references")}</small>
        </Card>
        <Card variant="stat">
          <span className="muted">{t("payments_stat_balance", "Outstanding balance")}</span>
          <strong>LKR {money(totalBalance)}</strong>
          <small>{t("payments_stat_balance_sub", "Awaiting buyer payment")}</small>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <h2>{t("payments_invoices_heading", "Auction invoices")}</h2>
            <p>
              {role === "admin"
                ? t("payments_invoices_sub_admin", "Select an invoice to record a received payment.")
                : t("payments_invoices_sub_general", "Payments are confirmed and recorded by the auction manager.")}
            </p>
          </div>
          <select
            aria-label="Filter invoices"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {["all", "Pending", "Partially Paid", "Paid", "Overdue"].map((s) => {
              const label =
                s === "all"
                  ? t("payments_filter_all", "All payments")
                  : s === "Pending"
                    ? t("status_pending", "Pending")
                    : s === "Partially Paid"
                      ? t("status_partially_paid", "Partially Paid")
                      : s === "Paid"
                        ? t("status_paid", "Paid")
                        : t("status_overdue", "Overdue");

              return (
                <option key={s} value={s}>
                  {label}
                </option>
              );
            })}
          </select>
        </CardHeader>

        {shown.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">{t("payments_th_lot", "Invoice / lot")}</th>
                  <th scope="col">{t("payments_th_buyer", "Buyer")}</th>
                  <th scope="col">{t("payments_th_total", "Total")}</th>
                  <th scope="col">{t("payments_th_paid", "Paid")}</th>
                  <th scope="col">{t("payments_th_balance", "Balance")}</th>
                  <th scope="col">{t("payments_th_status", "Status")}</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {shown.map((l) => {
                  const speciesKey = l.species?.toLowerCase().replace(/\s+/g, "_");
                  const speciesLabel = (speciesKey && t(`species_${speciesKey}`, null)) || l.species;

                  return (
                    <tr key={l.id}>
                      <td>
                        <strong>{l.code}</strong>
                        <small>{speciesLabel}</small>
                      </td>
                      <td>{l.winner_name}</td>
                      <td>
                        LKR {money(l.final_price)}
                        <small>{t("payments_th_commission", "Commission")}: {money(l.commission)}</small>
                      </td>
                      <td>{money(l.paid_amount)}</td>
                      <td>{money(l.balance)}</td>
                      <td>
                        <Badge status={l.payment_status} />
                      </td>
                      <td>
                        <Button variant="text" onClick={() => onOpen(l.id)}>
                          {t("lot_modal_tab_details", "Details")}
                          <ArrowUpRight size={14} aria-hidden="true" />
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
            icon={Wallet}
            title={t("payments_empty_title", "No matching invoices")}
            text={t("payments_empty_desc", "Completed sales and their payment records will appear here.")}
          />
        )}
      </Card>
    </>
  );
}
