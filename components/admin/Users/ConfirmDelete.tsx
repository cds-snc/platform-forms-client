import React, { useState } from "react";
import { Button } from "@components/globals";
import { useTranslation } from "react-i18next";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { updateActiveStatus } from "@pages/admin/accounts";
import { useRefresh } from "@lib/hooks";

export const ConfirmDelete = ({ user }: { user: any }) => {
  const { t } = useTranslation("admin-users");
  const [confirmDeleteModal, showConfirmDeleteModal] = useState(false);
  const { refreshData } = useRefresh();

  return (
    <>
      <Button
        theme={!user.active ? "secondary" : "destructive"}
        className="mr-2"
        onClick={async () => {
          showConfirmDeleteModal(true);
          /* TODO: add confirmation modal
              - check for unconfirmed responses
              - check for published forms (must be transferred to another use)
             */
        }}
      >
        {user.active ? t("deactivateAccount") : t("activateAccount")}
      </Button>
      {confirmDeleteModal && (
        <ConfirmDeleteModal
          handleClose={function (): void {
            showConfirmDeleteModal(false);
          }}
          handleDeactivate={async () => {
            await updateActiveStatus(user.id, !user.active);
            await refreshData();
          }}
        />
      )}
    </>
  );
};
