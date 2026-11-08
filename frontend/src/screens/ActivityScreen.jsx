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

/**
 * Screen 8: Modernized Activity Log Screen.
 * Full audit record of transactions, bidding rounds, catch updates,
 * and user verification actions across the workspace.
 */
export function ActivityScreen({ events = [], onRefresh, role = "seller" }) {
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
          description="A traceable record of activity across your workspace."
        >
          Activity log
        </PageTitle>
      </PageHeader>

      <Card>
        <CardHeader>
          <div>
            <h2>Workspace activity</h2>
            <p>Latest 25 events · timestamps shown in Sri Lanka time.</p>
          </div>
          <Button
            variant="secondary"
            onClick={onRefresh}
            icon={<RefreshCw size={15} aria-hidden="true" />}
          >
            Refresh
          </Button>
        </CardHeader>

        <ActivityList events={events} />
      </Card>
    </>
  );
}
