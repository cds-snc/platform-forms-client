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
  const loggedInUserEmail = session?.user.email || "";

  const handleAddEmail = (emails: string) => {
    const emailArray = emails.split(",").map((email) => email.trim());
    console.log({ emailArray });
    const validEmails = emailArray.filter(
      (email: string) => isValidEmail(email) && !emailList.includes(email)
    );
    console.log({ validEmails });
    setEmailList([...emailList, ...validEmails]);
    setSelectedEmail("");
  };

  const handleRemoveEmail = (email: string) => {
    setEmailList(emailList.filter((e) => e !== email));
  };

  const isValidEmail = (email: string) => {
    return isValidGovEmail(email);
  };

  const handleClose = () => {
    setSelectedEmail("");
    setEmailList([]);
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
    let valid = true;
    emailList.forEach((email) => {
      if (!isValidGovEmail(email)) {
        logMessage.info("Invalid email address");
        valid = false;
      }

      // @TODO: maybe check this on entry?
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
          // disabled={!isValidEmail()} @TODO: fix this?
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
              <>
                <section>
                  <label htmlFor="email" className="font-bold">
                    Add people to share access
                  </label>
                  <p>
                    You can only enter email addresses with your same domain. If they do not have an
                    account, they will be invited to create one.
                  </p>

                  <div className="border-2 border-black flex-wrap flex gap-2 p-2">
                    {emailList.map((email) => {
                      return (
                        <div key={email} className="bg-violet-50 px-2 py-1 rounded-md inline-block">
                          {email}{" "}
                          <button className="" onClick={() => handleRemoveEmail(email)}>
                            x
                          </button>
                        </div>
                      );
                    })}

                    <input
                      id="email"
                      type="text"
                      className="inline-block grow border-none outline-none px-2 py-1"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setSelectedEmail(e.target.value);
                      }}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") {
                          handleAddEmail(e.currentTarget.value);
                        }
                      }}
                      value={selectedEmail}
                    />
                  </div>
                </section>

                <section className="mt-4">
                  <h3>People with access</h3>
                  <div className="border-1 border-black p-4">
                    {usersWithAccess.map((user) => (
                      <div className="flex flex-row py-2" key={user.email}>
                        <div className="grow">{user.email}</div>
                        <div>
                          {loggedInUserEmail === user.email ? <span></span> : <button>X</button>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
              // <ManageUsers
              //   selectedEmail={selectedEmail}
              //   setSelectedEmail={setSelectedEmail}
              //   usersWithAccess={usersWithAccess}
              //   loggedInUserEmail={session?.user.email || ""}
              //   handleAddEmail={handleAddEmail}
              //   emailList={emailList}
              // />
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
