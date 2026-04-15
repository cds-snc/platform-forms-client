"use client";

import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";
import { useCallback, useEffect, useState } from "react";
import { InviteUsers } from "./InviteUsers";
import { ManageUsers } from "./ManageUsers";
import { useManageFormAccessDialog } from "./ManageFormAccessDialogContext";
import { isValidGovEmail } from "@lib/validation/validation";
import { useTranslation } from "@i18n/client";

export const ManageFormAccessDialog = () => {
  const { t } = useTranslation("manage-form-access");
  const { isOpen, setIsOpen, emailList, setEmailList } = useManageFormAccessDialog();
  const dialogRef = useDialogRef();
  const { Event } = useCustomEvent();
  const [isInvitationScreen, setIsInvitationScreen] = useState(false);
  const isManagementScreen = !isInvitationScreen;

  /**
   * Open the dialog
   */
  const handleOpenDialog = useCallback(() => {
    setIsInvitationScreen(false);
    setEmailList([]);
    setIsOpen(true);
  }, [setEmailList, setIsOpen]);

  /**
   * Close the dialog and reset the data
   */
  const handleCloseDialog = () => {
    setIsOpen(false);
    setIsInvitationScreen(false);
  };

  useEffect(() => {
    Event.on("open-form-access-dialog", handleOpenDialog);

    return () => {
      Event.off("open-form-access-dialog", handleOpenDialog);
    };
  }, [Event, handleOpenDialog]);

  /**
   * Validate all emails in the list before submit.
   *
   * @returns boolean
   */
  const validate = () => {
    return emailList.every((email) => isValidGovEmail(email));
  };

  const dialogActions = (
    <div className="flex flex-row gap-4">
      {isManagementScreen && (
        <>
          <Button theme="secondary" onClick={handleCloseDialog}>
            {t("cancel")}
          </Button>

          <Button
            theme="primary"
            onClick={async () => {
              if (validate()) {
                setIsInvitationScreen(true);
              }
            }}
            disabled={emailList.length === 0}
          >
            {t("next")}
          </Button>
        </>
      )}
    </div>
  );

  return (
    <>
      {isOpen && (
        <Dialog
          dialogRef={dialogRef}
          handleClose={handleCloseDialog}
          title={isManagementScreen ? t("manageFormAccess") : t("inviteToForm")}
          actions={dialogActions}
        >
          <div className="p-4">
            {isManagementScreen && <ManageUsers />}
            {isInvitationScreen && <InviteUsers />}
          </div>
        </Dialog>
      )}
    </>
  );
};
