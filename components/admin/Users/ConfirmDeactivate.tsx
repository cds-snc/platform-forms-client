import React, { useState } from "react";
import { Button } from "@components/globals";
import { useTranslation } from "react-i18next";
import { ConfirmDeactivateModal } from "./ConfirmDeactivateModal";
import { DBUser } from "@lib/types/user-types";

export const ConfirmDeactivate = ({ user }: { user: DBUser }) => {
  const { t } = useTranslation("admin-users");
  const [confirmDeleteModal, showConfirmDeleteModal] = useState(false);

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
