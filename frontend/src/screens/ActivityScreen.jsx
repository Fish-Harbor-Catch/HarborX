import React from "react";
import { RefreshCw } from "lucide-react";
import {
  PageHeader,
  PageTitle,
  PageDescription,
} from "../components/ui/PageContainer.jsx";
import { Card, CardHeader } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { ActivityList } from "../components/domain/index.js";
import { useLanguage } from "../i18n.jsx";

/**
 * Screen 8: Modernized Activity Log Screen.
 * Full audit record of transactions, bidding rounds, catch updates,
 * and user verification actions across the workspace.
 */
export function ActivityScreen({ events = [], onRefresh, role = "seller" }) {
  const { lang, t } = useLanguage();

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
          description={t("activity_desc", "A traceable record of activity across your workspace.")}
        >
          {t("activity_title", "Activity log")}
        </PageTitle>
      </PageHeader>

      <Card>
        <CardHeader>
          <div>
            <h2>{t("activity_heading", "Workspace activity")}</h2>
            <p>{t("activity_heading_sub", "Latest 25 events · timestamps shown in Sri Lanka time.")}</p>
          </div>
          <Button
            variant="secondary"
            onClick={onRefresh}
            icon={<RefreshCw size={15} aria-hidden="true" />}
          >
            {t("action_refresh", "Refresh")}
          </Button>
        </CardHeader>

        <ActivityList events={events} />
      </Card>
    </>
  );
}
