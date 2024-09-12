"use client";

import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";
import { logMessage } from "@lib/logger";
import { isValidGovEmail } from "@lib/validation/validation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { TemplateUser } from "./types";
import { InviteUser } from "./InviteUser";
import { sendInvitation } from "./actions";
import { ManageUsers } from "./ManageUsers";

type ManageFormAccessDialogProps = {
  templateUsers: TemplateUser[] | undefined;
  formId: string;
};

export const ManageFormAccessDialog = ({ templateUsers, formId }: ManageFormAccessDialogProps) => {
  const dialogRef = useDialogRef();
  const { Event } = useCustomEvent();
  const { data: session } = useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [emailList, setEmailList] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [usersWithAccess, setUsersWithAccess] = useState<TemplateUser[]>([]);
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
  };

  /**
   * Handle adding one or more emails to the list
   *
   * @param emails
   */
  const handleAddEmail = (emails: string) => {
    const emailArray = emails.split(",").map((email) => email.trim());
    const validEmails = emailArray.filter((email: string) => isValidEmail(email));

    // @TODO: Add a message to the user if one or more emails are invalid

    setEmailList([...emailList, ...validEmails]);
    setSelectedEmail("");
  };

  /**
   * Remove an email from the list
   * @param email
   */
  const handleRemoveEmail = (email: string) => {
    setEmailList(emailList.filter((e) => e !== email));
  };

  /**
   * Validate an email address
   *
   * @param email
   * @returns
   */
  const isValidEmail = (email: string) => {
    let valid = true;
    // User already has access
    if (usersWithAccess.find((user) => user.email === email)) {
      valid = false;
    }

    // Not a valid government email
    if (!isValidGovEmail(email)) {
      valid = false;
    }

    // Email already in the list
    if (emailList.includes(email)) {
      valid = false;
    }

    return valid;
  };

  /**
   * @TODO: We're doing this on entry, do we need to do it again?
   */
  const validate = () => {
    let valid = true;
    emailList.forEach((email) => {
      if (!isValidGovEmail(email)) {
        logMessage.info("Invalid email address");
        valid = false;
      }

      if (usersWithAccess.find((user) => user.email === email)) {
        logMessage.info("User already has access");
        valid = false;
      }
    });

    return valid;
  };

  useEffect(() => {
    if (templateUsers) {
      setUsersWithAccess(templateUsers);
    }
  }, [session, templateUsers]);

  useEffect(() => {
    Event.on("open-form-access-dialog", handleOpenDialog);

    return () => {
      Event.off("open-form-access-dialog", handleOpenDialog);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleOpenDialog]);

  const dialogActions = (
    <div className="flex flex-row gap-4">
      <Button theme="secondary" onClick={handleClose}>
        Cancel
      </Button>
      {isManagementScreen && (
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
      )}
      {isInvitationScreen && (
        <Button
          theme="primary"
          onClick={async () => {
            sendInvitation(selectedEmail, formId, message);
            handleClose();
          }}
        >
          Invite
        </Button>
      )}
    </div>
  );

  return (
    <>
      {isOpen && (
        <Dialog
          dialogRef={dialogRef}
          handleClose={handleClose}
          title={"Manage form access"}
          actions={dialogActions}
        >
          <div className="p-4">
            {isManagementScreen && (
              <ManageUsers
                selectedEmail={selectedEmail}
                setSelectedEmail={setSelectedEmail}
                usersWithAccess={usersWithAccess}
                loggedInUserEmail={session?.user.email || ""}
                handleAddEmail={handleAddEmail}
                emailList={emailList}
                handleRemoveEmail={handleRemoveEmail}
              />
            )}
            {isInvitationScreen && <InviteUser emailList={emailList} setMessage={setMessage} />}
          </div>
        </Dialog>
      )}
    </>
  );
};
