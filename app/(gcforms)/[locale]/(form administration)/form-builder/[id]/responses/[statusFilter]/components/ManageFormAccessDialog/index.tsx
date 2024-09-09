"use client";

import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";
import { logMessage } from "@lib/logger";
import { isValidGovEmail } from "@lib/validation/validation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { checkEmailExists } from "./actions";
import { TemplateUser } from "./types";
import { SelectUser } from "./SelectUser";

export const ManageFormAccessDialog = ({
  templateUsers,
}: {
  templateUsers: TemplateUser[] | undefined;
}) => {
  const dialogRef = useDialogRef();
  const { Event } = useCustomEvent();
  const [usersWithAccess, setUsersWithAccess] = useState<TemplateUser[]>([]);
  const [userEmailDomain, setUserEmailDomain] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const isDomainMatch = userEmailDomain === selectedEmail.split("@")[1];

  const isValidEmail = () => {
    return isValidGovEmail(selectedEmail) && isDomainMatch;
  };

  const handleClose = () => {
    setSelectedEmail("");
    setIsOpen(false);
  };

  const handleOpenDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      setUserEmailDomain(session.user.email.split("@")[1]);
    }
    if (templateUsers) {
      setUsersWithAccess(templateUsers);
    }
  }, [session, templateUsers]);

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
      <Button
        theme="primary"
        onClick={async () => {
          if (validate()) {
            const result = await checkEmailExists(selectedEmail);
            if (result) {
              // User exists, display add owner form
            } else {
              // User does not exists, display invite form
            }
          }
        }}
        disabled={!isValidEmail()}
      >
        Next
      </Button>
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
            <SelectUser
              selectedEmail={selectedEmail}
              setSelectedEmail={setSelectedEmail}
              usersWithAccess={usersWithAccess}
              loggedInUserEmail={session?.user.email || ""}
            />
          </div>
        </Dialog>
      )}
    </>
  );
};
