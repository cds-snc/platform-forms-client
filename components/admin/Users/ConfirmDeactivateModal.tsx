import React from "react";
import { useTranslation } from "next-i18next";
import { FormElementTypes } from "@lib/types";
import { Button } from "@components/globals";
import { Dialog, useDialogRef } from "@components/form-builder/app/shared";
import { updateActiveStatus } from "@pages/admin/accounts";
import { useRefresh } from "@lib/hooks";
import { getAllTemplates } from "@lib/templates";
import axios from "axios";
import { logMessage } from "@lib/logger";

export const ConfirmDeactivateModal = ({
  handleClose,
  user,
}: {
  handleAddType?: (type?: FormElementTypes) => void;
  handleClose: () => void;
  user: any;
}) => {
  const { t } = useTranslation("admin-users");
  const dialog = useDialogRef();
  const { refreshData } = useRefresh();

  const actions = (
    <>
      <Button
        className=""
        theme="primary"
        onClick={async () => {
          /* TODO: add confirmation modal
            - check for unconfirmed responses
            - check for published forms (must be transferred to another use)
          */
          const resp = await axios({
            url: `/api/account/${user.id}/forms`,
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
          });

          if (resp.data.length > 0) {
            logMessage.info("User has published forms");
            return;
          }

          await updateActiveStatus(user.id, !user.active);
          await refreshData();

          dialog.current?.close();
          handleClose();
        }}
      >
        {t("deactivateAccount")}
      </Button>
      <Button
        className="ml-5"
        theme="secondary"
        onClick={() => {
          dialog.current?.close();
          handleClose();
        }}
      >
        {t("cancel")}
      </Button>
    </>
  );

  return (
    <div className="form-builder">
      <Dialog
        title={t("share.title")}
        dialogRef={dialog}
        handleClose={handleClose}
        actions={actions}
        className="max-h-[80%] overflow-y-scroll"
      >
        <div className="my-8">Huzzah</div>
      </Dialog>
    </div>
  );
};
