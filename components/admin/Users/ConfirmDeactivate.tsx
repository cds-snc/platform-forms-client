import React, { useState } from "react";
import { Button } from "@components/globals";
import { useTranslation } from "react-i18next";
import { ConfirmDeactivateModal } from "./ConfirmDeactivateModal";
import { useRefresh } from "@lib/hooks";
import { User } from "@prisma/client";

export const ConfirmDeactivate = ({ user }: { user: User }) => {
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
