"use client";

import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";
import { logMessage } from "@lib/logger";
import { isValidGovEmail } from "@lib/validation/validation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { TemplateUser } from "./types";
import { ManageUsers } from "./ManageUsers";
import { InviteUser } from "./InviteUser";
import { sendInvitation } from "./actions";

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
  const [message, setMessage] = useState("");
  const [userEmailDomain, setUserEmailDomain] = useState("");
  const [usersWithAccess, setUsersWithAccess] = useState<TemplateUser[]>([]);
  const [isInvitationScreen, setIsInvitationScreen] = useState(false);
  const isManagementScreen = !isInvitationScreen;

  const isDomainMatch = userEmailDomain === selectedEmail.split("@")[1];

  const isValidEmail = () => {
    return isValidGovEmail(selectedEmail) && isDomainMatch;
  };

  const handleClose = () => {
    setSelectedEmail("");
    setIsOpen(false);
    setIsInvitationScreen(false);
  };

  const handleOpenDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  /**
   * @TODO: Add validation messages/states
   */
  const validate = () => {
    if (!isValidGovEmail(selectedEmail)) {
      logMessage.info("Invalid email address");
      return;
    }

    if (!isDomainMatch) {
      logMessage.info("Email domain does not match");
      return;
    }

    if (usersWithAccess.find((user) => user.email === selectedEmail)) {
      logMessage.info("User already has access");
      return;
    }

    return true;
  };

  useEffect(() => {
    if (session) {
      setUserEmailDomain(session.user.email.split("@")[1]);
    }
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
          disabled={!isValidEmail()}
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
              />
            )}
            {isInvitationScreen && (
              <InviteUser selectedEmail={selectedEmail} setMessage={setMessage} />
            )}
          </div>
        </Dialog>
      )}
    </>
  );
};
