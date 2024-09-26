import { useContext, useState } from "react";
import { ManageFormAccessDialogContext } from "./ManageFormAccessDialogContext";
// import { useFormState } from "react-dom";
import { sendInvitation } from "./actions";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { toast } from "@formBuilder/components/shared";

export const InviteUsers = () => {
  const { t } = useTranslation("manage-form-access");
  const [message, setMessage] = useState("");

  const manageFormAccessDialogContext = useContext(ManageFormAccessDialogContext);

  if (!manageFormAccessDialogContext) {
    throw new Error("ManageFormAccessDialog must be used within a ManageFormAccessDialogProvider");
  }

  const { emailList, formId, setIsOpen } = manageFormAccessDialogContext;

  const handleSubmit = async () => {
    const result = await sendInvitation(emailList, formId, message);

    if (result.success) {
      toast.success(t("invitationSent"), "wide");
      setIsOpen(false);
    }

    // @TODO: handle errors
  };

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
        <label>{t("optionalMessage")}</label>
        <textarea
          className="gc-textarea"
          onChange={(e) => setMessage(e.target.value)}
          defaultValue={message}
        />
      </section>

      <section className="-mb-4 mt-4 flex gap-2">
        <Button theme="secondary" onClick={() => setIsOpen(false)}>
          {t("back")}
        </Button>

        <Button theme="primary" onClick={() => handleSubmit()}>
          {t("invite")}
        </Button>
      </section>
    </>
  );
};
