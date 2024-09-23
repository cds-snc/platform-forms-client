import { CancelIcon } from "@serverComponents/icons";
import { DeleteConfirm } from "./DeleteConfirm";
import { getTemplateUsers, removeUserFromForm } from "./actions";
import { useContext, useEffect, useState } from "react";
import { ManageFormAccessDialogContext } from "./ManageFormAccessDialogContext";
import { isValidGovEmail } from "@lib/validation/validation";
import { useSession } from "next-auth/react";
import { TemplateUser } from "./types";
import { hasOwnProperty } from "@lib/tsUtils";

export const ManageUsers = () => {
  const { data: session } = useSession();
  const loggedInUserEmail = session?.user.email || "";
  const [errors, setErrors] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [usersWithAccess, setUsersWithAccess] = useState<TemplateUser[]>([]);

  const manageFormAccessDialogContext = useContext(ManageFormAccessDialogContext);

  if (!manageFormAccessDialogContext) {
    throw new Error("ManageFormAccessDialog must be used within a ManageFormAccessDialogProvider");
  }

  const { formId, emailList, setEmailList } = manageFormAccessDialogContext;

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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsersWithAccess = async () => {
      const users = await getTemplateUsers(formId);
      setUsersWithAccess(users || []);
      setLoading(false);
    };

    fetchUsersWithAccess();
  }, [formId, setUsersWithAccess]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleRemoveUser = async (userId: string) => {
    const result = await removeUserFromForm(userId, formId);
    if (result.success) {
      setUsersWithAccess(usersWithAccess.filter((user) => user.id !== userId));
      return true;
    }
    return false;
  };

  return (
    <>
      <section>
        <label htmlFor="email" className="font-bold">
          Add people to share access
        </label>
        <p className="pb-3">Must be a government email address</p>

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

        <div className="flex flex-wrap gap-2 border border-black p-2">
          {emailList.map((email) => {
            return (
              <div
                key={email}
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
            value={selectedEmail}
          />
        </div>
      </section>

      <section className="mt-4">
        <h3>People with access</h3>
        <div className="max-h-96 overflow-scroll border-1 border-black p-4">
          {usersWithAccess.map((user) => (
            <div className="flex flex-row py-2" key={user.email}>
              <div className="grow">{user.email}</div>
              {hasOwnProperty(user, "expired") ? (
                <div>{user.expired ? "expired" : "invited"}</div>
              ) : (
                <div>
                  {/* Disable delete for current user or only remaining user */}
                  {loggedInUserEmail === user.email || usersWithAccess.length <= 1 ? (
                    <span></span>
                  ) : (
                    <DeleteConfirm callback={() => handleRemoveUser(user.id)} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
};
