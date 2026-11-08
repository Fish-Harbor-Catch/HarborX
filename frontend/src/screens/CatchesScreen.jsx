import React from "react";
import { Plus } from "lucide-react";
import {
  PageHeader,
  PageTitle,
  PageDescription,
  PageActions,
} from "../components/ui/PageContainer.jsx";
import { Button } from "../components/ui/Button.jsx";
import { AuctionList } from "../components/domain/index.js";
import { DraftPanel } from "../DraftPanel.jsx";
import { api } from "../api.js";

/**
 * Screen 3: Modernized Seller Catches Screen.
 * Allows sellers to monitor registered catches, review stages,
 * and manage encrypted local offline drafts.
 */
export function CatchesScreen({
  user,
  role = "seller",
  own = [],
  search = "",
  setSearch,
  onSelectLot,
  onRegisterCatch,
  draftStore,
  online = true,
  verifyDraftOwner,
  syncDrafts,
  onEditDraft,
}) {
  const handleAuthorize = async () => {
    const { user: current } = await api("/auth/me");
    if (current.id !== user.id || current.role !== "seller") {
      throw new Error("Sign in again as this seller.");
    }
    if (verifyDraftOwner) {
      await verifyDraftOwner(current);
    }
  };

  return (
    <>
      <PageHeader>
        <PageTitle
          eyebrow="FROM YOUR BOAT TO THE MARKET"
          description="Manage your catch, from registration to the final sale."
        >
          My catches
        </PageTitle>

        <PageActions>
          {role === "seller" && (
            <Button
              variant="primary"
              onClick={onRegisterCatch}
              icon={<Plus size={17} aria-hidden="true" />}
            >
              Register catch
            </Button>
          )}
        </PageActions>
      </PageHeader>

      <AuctionList
        lots={own}
        search={search}
        setSearch={setSearch}
        onOpen={onSelectLot}
        role={role}
        type="catches"
      />

      {role === "seller" && draftStore && (
        <DraftPanel
          store={draftStore}
          online={online}
          allowSetup={online}
          authorize={handleAuthorize}
          onSync={syncDrafts}
          onEdit={onEditDraft}
        />
      )}
    </>
  );
}
