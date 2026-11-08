import React from "react";
import { Download, Fish, MapPin, Anchor, FileText } from "lucide-react";
import {
  PageHeader,
  PageTitle,
  PageDescription,
  PageActions,
} from "../components/ui/PageContainer.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { money } from "../api.js";

/**
 * Screen 7: Modernized Reports and Analytics Screen.
 * Provides turnover metrics, fish sales volumes by species,
 * harbor sales summaries, and compliance CSV export.
 */
export function ReportsScreen({ lots = [], invoices = [] }) {
  const completed = lots.filter((l) => l.status === "closed");
  const total = completed.reduce((n, l) => n + Number(l.final_price || 0), 0);
  const totalCommission = completed.reduce(
    (n, l) => n + Number(l.commission || 0),
    0,
  );
  const totalWeight = completed.reduce(
    (n, l) => n + Number(l.actual_weight || 0),
    0,
  );
  const speciesList = [...new Set(lots.map((l) => l.species))];
  const harborList = [...new Set(lots.map((l) => l.harbor))];

  return (
    <>
      <PageHeader>
        <PageTitle
          eyebrow="HARBOR OPERATIONS"
          description="Turn your auction records into useful insights."
        >
          Reports
        </PageTitle>

        <PageActions>
          <a className="btn primary" href="/api/reports/export">
            <Download size={17} aria-hidden="true" />
            Export CSV
          </a>
        </PageActions>
      </PageHeader>

      <div className="stats-grid three" aria-label="Auction summary metrics">
        <Card variant="stat">
          <span className="muted">Auction turnover</span>
          <strong>LKR {money(total)}</strong>
          <small>Across {completed.length} completed auctions</small>
        </Card>
        <Card variant="stat">
          <span className="muted">Harbor commission</span>
          <strong>LKR {money(totalCommission)}</strong>
          <small>Across {completed.length} completed auctions</small>
        </Card>
        <Card variant="stat">
          <span className="muted">Fish sold</span>
          <strong>{money(totalWeight)} kg</strong>
          <small>Across {completed.length} completed auctions</small>
        </Card>
      </div>

      <div className="reports-grid">
        <Card>
          <CardHeader>
            <div>
              <h2>Catch volume by species</h2>
              <p>All registered catches · kilograms</p>
            </div>
            <Fish size={20} aria-hidden="true" />
          </CardHeader>
          <div className="bar-chart" aria-label="Volume by species bar chart">
            {speciesList.map((s) => {
              const weight = lots
                .filter((l) => l.species === s)
                .reduce((n, l) => n + Number(l.weight || 0), 0);
              const max = Math.max(
                ...speciesList.map((sp) =>
                  lots
                    .filter((l) => l.species === sp)
                    .reduce((n, l) => n + Number(l.weight || 0), 0),
                ),
                1,
              );
              const percentage = Math.round((weight / max) * 100);

              return (
                <div className="bar-row" key={s}>
                  <div>
                    <span>{s}</span>
                    <strong>{money(weight)} kg</strong>
                  </div>
                  <div className="bar-track">
                    <span style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <h2>Harbor summary</h2>
              <p>Recorded sales across locations</p>
            </div>
            <MapPin size={20} aria-hidden="true" />
          </CardHeader>
          <div className="harbor-summary-list">
            {harborList.map((h) => {
              const harborLots = lots.filter((l) => l.harbor === h);
              const harborSales = harborLots.reduce(
                (n, l) => n + Number(l.final_price || 0),
                0,
              );

              return (
                <div className="harbor-row" key={h}>
                  <span className="stat-icon teal">
                    <Anchor size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>{h}</strong>
                    <small>{harborLots.length} lots registered</small>
                  </div>
                  <strong>LKR {money(harborSales)}</strong>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="alert" role="status">
        <FileText size={20} aria-hidden="true" />
        <span>
          Export includes catch weights, harbor, sale price, commission, payment
          status, and winners. Confirm the Fisheries Department’s required
          format before official submission.
        </span>
        <a href="/api/reports/export" className="text-btn">
          Download CSV
          <Download size={15} aria-hidden="true" />
        </a>
      </div>
    </>
  );
}
