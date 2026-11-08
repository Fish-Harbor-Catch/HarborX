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
import { useLanguage } from "../i18n.jsx";

/**
 * Screen 7: Modernized Reports and Analytics Screen.
 * Provides turnover metrics, fish sales volumes by species,
 * harbor sales summaries, and compliance CSV export.
 */
export function ReportsScreen({ lots = [], invoices = [] }) {
  const { lang, t } = useLanguage();

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
          eyebrow={t("reports_eyebrow", "HARBOR OPERATIONS")}
          description={t("reports_desc", "Auction turnover, commission, and species volume records.")}
        >
          {t("reports_title", "Reports")}
        </PageTitle>

        <PageActions>
          <a className="btn primary" href="/api/reports/export">
            <Download size={17} aria-hidden="true" />
            {t("action_export_csv", "Export CSV")}
          </a>
        </PageActions>
      </PageHeader>

      <div className="stats-grid three" aria-label="Auction summary metrics">
        <Card variant="stat">
          <span className="muted">{t("reports_stat_turnover", "Auction turnover")}</span>
          <strong>LKR {money(total)}</strong>
          <small>{t("reports_stat_turnover_sub", `Across ${completed.length} completed auctions`, { count: completed.length })}</small>
        </Card>
        <Card variant="stat">
          <span className="muted">{t("reports_stat_commission", "Harbor commission")}</span>
          <strong>LKR {money(totalCommission)}</strong>
          <small>{t("reports_stat_commission_sub", `Across ${completed.length} completed auctions`, { count: completed.length })}</small>
        </Card>
        <Card variant="stat">
          <span className="muted">{t("reports_stat_weight", "Fish sold")}</span>
          <strong>{money(totalWeight)} kg</strong>
          <small>{t("reports_stat_weight_sub", `Across ${completed.length} completed auctions`, { count: completed.length })}</small>
        </Card>
      </div>

      <div className="reports-grid">
        <Card>
          <CardHeader>
            <div>
              <h2>{t("reports_chart_volume_title", "Catch volume by species")}</h2>
              <p>{t("reports_chart_volume_sub", "All registered catches · kilograms")}</p>
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

              const speciesKey = s?.toLowerCase().replace(/\s+/g, "_");
              const speciesLabel = (speciesKey && t(`species_${speciesKey}`, null)) || s;

              return (
                <div className="bar-row" key={s}>
                  <div>
                    <span>{speciesLabel}</span>
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
              <h2>{t("reports_summary_title", "Harbor summary")}</h2>
              <p>{t("reports_summary_sub", "Recorded sales across locations")}</p>
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

              const harborKey = h?.toLowerCase().replace(/\s+/g, "_");
              const harborLabel = (harborKey && t(`harbor_${harborKey}`, null)) || h;

              return (
                <div className="harbor-row" key={h}>
                  <span className="stat-icon teal">
                    <Anchor size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>{harborLabel}</strong>
                    <small>{t("overview_pipeline_auction_lots", `${harborLots.length} lots registered`, { count: harborLots.length })}</small>
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
          {t("reports_compliance_notice", "Export includes catch weights, harbor, sale price, commission, payment status, and winners. Confirm the Fisheries Department’s required format before official submission.")}
        </span>
        <a href="/api/reports/export" className="text-btn">
          {t("action_export_csv", "Download CSV")}
          <Download size={15} aria-hidden="true" />
        </a>
      </div>
    </>
  );
}
