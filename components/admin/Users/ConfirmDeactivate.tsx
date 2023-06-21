import React, { useState } from "react";
import { Button } from "@components/globals";
import { useTranslation } from "react-i18next";
import { ConfirmDeactivateModal } from "./ConfirmDeactivateModal";
import { updateActiveStatus } from "@pages/admin/accounts";
import { useRefresh } from "@lib/hooks";

export const ConfirmDeactivate = ({ user }: { user: any }) => {
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
        }}
      >
        {user.active ? t("deactivateAccount") : t("activateAccount")}
      </Button>
      {confirmDeleteModal && (
        <ConfirmDeactivateModal
          user={user}
          handleClose={function (): void {
            showConfirmDeleteModal(false);
          }}
        />
      )}
    </>
  );
};
