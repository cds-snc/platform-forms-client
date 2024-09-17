import { useContext, useState } from "react";
import { ManageFormAccessDialogContext } from "./ManageFormAccessDialogContext";

export const InviteUsers = () => {
  const [message, setMessage] = useState("");
  const manageFormAccessDialogContext = useContext(ManageFormAccessDialogContext);

  if (!manageFormAccessDialogContext) {
    throw new Error("ManageFormAccessDialog must be used within a ManageFormAccessDialogProvider");
  }

  const { emailList } = manageFormAccessDialogContext;

  return (
    <>
      <section>
        <div className="flex flex-wrap gap-2">
          {emailList.map((email) => {
            return (
              <div
                key={email}
                className="flex items-center gap-1 rounded-md border border-violet-700 bg-violet-50 px-3"
              >
                <div>{email}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-4">
        <label>Message</label>
        <textarea className="gc-textarea" onChange={(e) => setMessage(e.target.value)}>
          {message}
        </textarea>
      </section>
    </>
  );
};
