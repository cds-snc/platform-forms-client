import { CancelIcon } from "@serverComponents/icons";
import { TemplateUser } from "./types";

type ManageUsersProps = {
  selectedEmail: string;
  setSelectedEmail: (email: string) => void;
  usersWithAccess: TemplateUser[];
  loggedInUserEmail: string;
  handleAddEmail: (email: string) => void;
  handleRemoveEmail: (email: string) => void;
  emailList: string[];
  errors: string[];
};

export const ManageUsers = ({
  selectedEmail,
  setSelectedEmail,
  usersWithAccess,
  loggedInUserEmail,
  handleAddEmail,
  handleRemoveEmail,
  emailList,
  errors,
}: ManageUsersProps) => {
  return (
    <>
      <section>
        <label htmlFor="email" className="font-bold">
          Add people to share access
        </label>
        <p className="pb-3">Must be a government email address</p>

        {errors.length > 0 && (
          <div className="flex-wrap flex gap-2 my-2">
            {errors.map((error, index) => (
              <div
                className="bg-red-100 border border-red-700 px-2 rounded-md text-red-700"
                key={`error-${index}`}
              >
                {error}
              </div>
            ))}
          </div>
        )}

        <div className="border border-black flex-wrap flex gap-2 p-2">
          {emailList.map((email) => {
            return (
              <div
                key={email}
                className="bg-violet-50 border border-violet-700 flex items-center gap-1 px-2 rounded-md"
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
            className="inline-block grow border-none outline-none px-2 py-1"
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
        <div className="border-1 border-black p-4">
          {usersWithAccess.map((user) => (
            <div className="flex flex-row py-2" key={user.email}>
              <div className="grow">{user.email}</div>
              <div>{loggedInUserEmail === user.email ? <span></span> : <button>X</button>}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};
