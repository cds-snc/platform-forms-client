import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";
import { logMessage } from "@lib/logger";
import { isValidGovEmail } from "@lib/validation/validation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

export const ManageFormAccessDialog = ({
  templateUsers,
}: {
  templateUsers: { id: string; name: string | null; email: string }[] | undefined;
}) => {
  const dialogRef = useDialogRef();
  const { Event } = useCustomEvent();
  const [usersWithAccess, setUsersWithAccess] = useState<{ email: string }[]>([]);
  const [userEmailDomain, setUserEmailDomain] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const isDomainMatch = userEmailDomain === selectedEmail.split("@")[1];

  const isValidEmail = () => {
    return isValidGovEmail(selectedEmail) && isDomainMatch;
  };

  const handleClose = () => {
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
        onClick={() => {
          validate();
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
            <section>
              <label htmlFor="email" className="font-bold">
                Add people to share access
              </label>
              <p>
                You can only enter email addresses with your same domain. If they do not have an
                account, they will be invited to create one.
              </p>

              <input
                id="email"
                type="text"
                className="gc-input-text"
                onChange={(e) => {
                  setSelectedEmail(e.target.value);
                }}
              />
            </section>

            <section className="mt-4">
              <h3>People with access</h3>
              <div className="border-1 border-black p-4">
                {usersWithAccess.map((user) => (
                  <div className="flex flex-row py-2" key={user.email}>
                    <div className="grow">{user.email}</div>
                    <div>
                      {session?.user.email === user.email ? <span></span> : <button>X</button>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </Dialog>
      )}
    </>
  );
};
