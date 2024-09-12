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
};

export const ManageUsers = ({
  selectedEmail,
  setSelectedEmail,
  usersWithAccess,
  loggedInUserEmail,
  handleAddEmail,
  handleRemoveEmail,
  emailList,
}: ManageUsersProps) => {
  return (
    <>
      <section>
        <label htmlFor="email" className="font-bold">
          Add people to share access
        </label>
        <p>
          You can only enter email addresses with your same domain. If they do not have an account,
          they will be invited to create one.
        </p>

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
