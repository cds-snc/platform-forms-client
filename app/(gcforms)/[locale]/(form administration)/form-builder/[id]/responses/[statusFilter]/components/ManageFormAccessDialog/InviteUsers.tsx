import { useState } from "react";
import { useManageFormAccessDialog } from "./ManageFormAccessDialogContext";
import { sendInvitation } from "./actions";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { toast } from "@formBuilder/components/shared/Toast";

export const InviteUsers = () => {
  const { t } = useTranslation("manage-form-access");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const { emailList, formId, setIsOpen } = useManageFormAccessDialog();

  const handleSubmit = async () => {
    const result = await sendInvitation(emailList, formId, message);

    if (result.success) {
      toast.success(t("invitationSent"), "wide");
      setIsOpen(false);
    }

    if (result.errors) {
      setErrors(result.errors);
    }
  };

  return (
    <>
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

      <section>
        <div className="flex flex-wrap gap-2">
          {emailList.map((email, index) => {
            return (
              <div
                key={`${email}-${index}`}
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
