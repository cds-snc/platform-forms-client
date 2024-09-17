"use client";

import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";
import { useCallback, useContext, useEffect, useState } from "react";
import { InviteUsers } from "./InviteUsers";
import { sendInvitation } from "./actions";
import { ManageUsers } from "./ManageUsers";
import { ManageFormAccessDialogContext } from "./ManageFormAccessDialogContext";
import { isValidGovEmail } from "@lib/validation/validation";

type ManageFormAccessDialogProps = {
  formId: string;
};

export const ManageFormAccessDialog = ({ formId }: ManageFormAccessDialogProps) => {
  const manageFormAccessDialogContext = useContext(ManageFormAccessDialogContext);

  if (!manageFormAccessDialogContext) {
    throw new Error("ManageFormAccessDialog must be used within a ManageFormAccessDialogProvider");
  }

  const { isOpen, setIsOpen, setFormId, emailList, setEmailList, message, setErrors } =
    manageFormAccessDialogContext;

  const dialogRef = useDialogRef();
  const { Event } = useCustomEvent();
  const [isInvitationScreen, setIsInvitationScreen] = useState(false);
  const isManagementScreen = !isInvitationScreen;

  /**
   * Open the dialog
   */
  const handleOpenDialog = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  /**
   * Close the dialog and reset the data
   */
  const handleCloseDialog = () => {
    setEmailList([]);
    setIsOpen(false);
    setIsInvitationScreen(false);
    setErrors([]);
  };

  useEffect(() => {
    setFormId(formId);
  }, [formId, setFormId]);

  useEffect(() => {
    Event.on("open-form-access-dialog", handleOpenDialog);

    return () => {
      Event.off("open-form-access-dialog", handleOpenDialog);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleOpenDialog]);

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
            Cancel
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
            Next
          </Button>
        </>
      )}
      {isInvitationScreen && (
        <>
          <Button theme="secondary" onClick={() => setIsInvitationScreen(false)}>
            Back
          </Button>

          <Button
            theme="primary"
            onClick={async () => {
              sendInvitation(emailList, formId, message);
              handleCloseDialog();
            }}
          >
            Invite
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
          title={isManagementScreen ? "Manage form access" : "Invite to form"}
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
