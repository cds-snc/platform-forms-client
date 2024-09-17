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
  const dialogContext = useContext(ManageFormAccessDialogContext);

  if (!dialogContext) {
    throw new Error("ManageFormAccessDialog must be used within a ManageFormAccessDialogProvider");
  }

  const {
    isOpen,
    setIsOpen,
    selectedEmail,
    setSelectedEmail,
    setFormId,
    emailList,
    setEmailList,
    message,
    setErrors,
  } = dialogContext;

  useEffect(() => {
    setFormId(formId);
  }, [formId, setFormId]);

  const dialogRef = useDialogRef();
  const { Event } = useCustomEvent();

  const [isInvitationScreen, setIsInvitationScreen] = useState(false);
  const isManagementScreen = !isInvitationScreen;

  /**
   * Open the dialog
   */
  const handleOpenDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  /**
   * Close the dialog and reset the data
   */
  const handleClose = () => {
    setSelectedEmail("");
    setEmailList([]);
    setIsOpen(false);
    setIsInvitationScreen(false);
    setErrors([]);
  };

  /**
   * Validate all emails in the list before submit.
   * @TODO: we do this on entry, maybe we don't need to do it again?
   *
   * @returns boolean
   */
  const validate = () => {
    return emailList.every((email) => isValidGovEmail(email));
  };

  useEffect(() => {
    Event.on("open-form-access-dialog", handleOpenDialog);

    return () => {
      Event.off("open-form-access-dialog", handleOpenDialog);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleOpenDialog]);

  const dialogActions = (
    <div className="flex flex-row gap-4">
      {isManagementScreen && (
        <>
          <Button theme="secondary" onClick={handleClose}>
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
              sendInvitation(selectedEmail, formId, message);
              handleClose();
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
          handleClose={handleClose}
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
