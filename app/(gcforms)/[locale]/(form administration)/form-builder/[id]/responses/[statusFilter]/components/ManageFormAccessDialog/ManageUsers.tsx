import { TemplateUser } from "./types";

type ManageUsersProps = {
  selectedEmail: string;
  setSelectedEmail: (email: string) => void;
  usersWithAccess: TemplateUser[];
  loggedInUserEmail: string;
};

export const ManageUsers = ({
  setSelectedEmail,
  usersWithAccess,
  loggedInUserEmail,
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
              <div>{loggedInUserEmail === user.email ? <span></span> : <button>X</button>}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};
