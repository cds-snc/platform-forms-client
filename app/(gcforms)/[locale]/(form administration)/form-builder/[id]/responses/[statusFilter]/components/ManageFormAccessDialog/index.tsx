"use client";

import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";
import { isValidGovEmail } from "@lib/validation/validation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { TemplateUser } from "./types";
import { InviteUsers } from "./InviteUsers";
import { sendInvitation } from "./actions";
import { ManageUsers } from "./ManageUsers";

type ManageFormAccessDialogProps = {
  formId: string;
};

export const ManageFormAccessDialog = ({ formId }: ManageFormAccessDialogProps) => {
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
  const [errors, setErrors] = useState<string[]>([]);

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
   * Handle adding one or more emails addresses to the list.
   * Multiple emails can be delimited by comma or space.
   * Emails are validated before being added to the list.
   *
   * @param emails
   */
  const handleAddEmail = (emails: string) => {
    if (!emails) return;
    setErrors([]);

    const emailArray = emails.split(/[\s,]+/).map((email) => email.trim());
    const validEmails = emailArray.filter((email: string) => isValidEmail(email));

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
   * Add an error to the list
   * @param error
   */
  const handleAddError = (error: string) => {
    setErrors((prevErrors) => [...prevErrors, error]);
  };

  /**
   * Validate an email address
   * Add an error for display if the email is invalid
   *
   * @param email
   * @returns
   */
  const isValidEmail = (email: string) => {
    let valid = true;

    // User already has access
    if (usersWithAccess.find((user) => user.email === email)) {
      handleAddError(`${email} already has access`);
      valid = false;
    }

    // Not a valid government email
    if (!isValidGovEmail(email)) {
      handleAddError(`${email} is an invalid email address`);
      valid = false;
    }

    // Email already in the list
    if (emailList.includes(email)) {
      handleAddError(`${email} is already in the list`);
      valid = false;
    }

    return valid;
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
        <Button theme="secondary" onClick={handleClose}>
          Cancel
        </Button>
      )}
      {isInvitationScreen && (
        <Button theme="secondary" onClick={() => setIsInvitationScreen(false)}>
          Back
        </Button>
      )}
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
          title={isManagementScreen ? "Manage form access" : "Invite to form"}
          actions={dialogActions}
        >
          <div className="p-4">
            {isManagementScreen && (
              <ManageUsers
                formId={formId}
                selectedEmail={selectedEmail}
                setSelectedEmail={setSelectedEmail}
                usersWithAccess={usersWithAccess}
                setUsersWithAccess={setUsersWithAccess}
                loggedInUserEmail={session?.user.email || ""}
                handleAddEmail={handleAddEmail}
                emailList={emailList}
                handleRemoveEmail={handleRemoveEmail}
                errors={errors}
              />
            )}
            {isInvitationScreen && <InviteUsers emailList={emailList} setMessage={setMessage} />}
          </div>
        </Dialog>
      )}
    </>
  );
};
