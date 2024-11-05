import { CancelIcon } from "@serverComponents/icons";
import { getTemplateUsers } from "./actions";
import { useCallback, useEffect, useState } from "react";
import { useManageFormAccessDialog } from "./ManageFormAccessDialogContext";
import { isValidGovEmail } from "@lib/validation/validation";
import { useSession } from "next-auth/react";
import { TemplateUser } from "./types";
import { hasOwnProperty } from "@lib/tsUtils";
import { useTranslation } from "@i18n/client";
import { cn } from "@lib/utils";
import { UserActions } from "./UserActions";

export const ManageUsers = () => {
  const { t } = useTranslation("manage-form-access");
  const { data: session } = useSession();
  const loggedInUserEmail = session?.user.email || "";
  const [errors, setErrors] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [usersWithAccess, setUsersWithAccess] = useState<TemplateUser[]>([]);

  const { formId, emailList, setEmailList } = useManageFormAccessDialog();

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
    if (
      usersWithAccess.find(
        (user) =>
          user.email.toLowerCase() === email.toLowerCase() && !hasOwnProperty(user, "expired")
      )
    ) {
      handleAddError(t("userAlreadyHasAccess", { email }));
      valid = false;
    }

    // Not a valid government email
    if (!isValidGovEmail(email)) {
      handleAddError(t("invalidEmail", { email }));
      return false;
    }

    // Email already in the list
    if (emailList.some((e) => e.toLowerCase() === email.toLowerCase())) {
      handleAddError(t("emailAlreadyInList", { email }));
      valid = false;
    }

    // Email domain must match the logged-in user's email domain
    const loggedInUserDomain = loggedInUserEmail.split("@");
    if (loggedInUserDomain.length < 2) {
      handleAddError(t("emailDomainMismatch", { email }));
      valid = false;
    }

    const emailDomain = email.split("@")[1];
    if (emailDomain !== loggedInUserDomain[1]) {
      handleAddError(t("emailDomainMismatch", { email }));
      valid = false;
    }

    return valid;
  };

  /**
   * Add an error to the list
   * @param error
   */
  const handleAddError = (error: string) => {
    setErrors((prevErrors: string[]) => [...prevErrors, error]);
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

    const emailArray = emails.split(/[\s,]+/).map((email) => email.trim().toLowerCase());
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

  const [loading, setLoading] = useState(true);

  /**
   * Fetch users with access to the form
   */
  const fetchUsersWithAccess = useCallback(async () => {
    const users = await getTemplateUsers(formId);

    // Make sure the logged-in user is at the top of the list
    const sorted = [...users].sort((a, b) => {
      if (a.email === loggedInUserEmail) return -1;
      if (b.email === loggedInUserEmail) return 1;
      return 0;
    });

    setUsersWithAccess(sorted || []);
    setLoading(false);
  }, [formId, loggedInUserEmail]);

  useEffect(() => {
    fetchUsersWithAccess();
  }, [fetchUsersWithAccess, formId, setUsersWithAccess]);

  return (
    <>
      <section>
        <label htmlFor="email" className="font-bold">
          {t("addPeopleToShareAccess")}
        </label>
        <p className="pb-3">{t("mustBeAGovernmentAddress")}</p>

        <div role="alert">
          {errors.length > 0 && (
            <div className="my-2 flex flex-wrap gap-2">
              {errors.map((error, index) => (
                <div
                  className="rounded-md border border-red-700 bg-red-100 px-2 text-red-700"
                  key={`error-${index}`}
                >
                  {error}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border border-black p-2">
          {emailList.map((email, index) => {
            return (
              <div
                key={`${email}-${index}`}
                className="flex items-center gap-1 rounded-md border border-violet-700 bg-violet-50 px-2"
              >
                <div className="">{email}</div>
                <button className="" onClick={() => handleRemoveEmail(email)}>
                  <CancelIcon className="size-5" />
                </button>
              </div>
            );
          })}

          <input
            id="email"
            type="text"
            className="inline-block grow border-none px-2 py-1 outline-none"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSelectedEmail(e.target.value);
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Backspace" && e.currentTarget.value === "") {
                handleRemoveEmail(emailList[emailList.length - 1]);
              }
              if (e.key === "," || e.key === " " || e.key === ";" || e.key === "Enter") {
                e.preventDefault();
                handleAddEmail(e.currentTarget.value);
              }
              if (e.key === "Tab" && e.currentTarget.value !== "") {
                e.preventDefault();
                handleAddEmail(e.currentTarget.value);
              }
            }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
              handleAddEmail(e.currentTarget.value);
            }}
            value={selectedEmail}
          />
        </div>
      </section>

      <section className="mt-4">
        <h3>{t("peopleWithAccess")}</h3>
        <div className="max-h-96 overflow-y-scroll border-1 border-black">
          {loading && <div className="p-10">{t("loading")}</div>}
          {!loading && (
            <>
              {usersWithAccess.map((user, index) => {
                const disableRow =
                  loggedInUserEmail === user.email ||
                  (index === 0 &&
                    usersWithAccess.filter((u) => !hasOwnProperty(u, "expired")).length <= 1);
                return (
                  <div
                    className={cn(
                      "flex flex-row items-start px-4 py-2",
                      disableRow && "bg-slate-100 py-4"
                    )}
                    key={user.email}
                  >
                    <div className="grow" id={user.email}>
                      {user.email}
                    </div>
                    <UserActions
                      user={user}
                      isInvitation={hasOwnProperty(user, "expired")}
                      usersWithAccess={usersWithAccess}
                      setUsersWithAccess={setUsersWithAccess}
                      handleAddEmail={handleAddEmail}
                      formId={formId}
                      disableRow={disableRow}
                    />
                  </div>
                );
              })}
            </>
          )}
        </div>
      </section>
    </>
  );
};
