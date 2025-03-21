import { useState } from "react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { isValidGovEmail } from "@lib/validation/validation";
import { cn } from "@lib/utils";
import { logMessage } from "@lib/logger";
import {
  MessageType,
  ValidationMessage,
} from "@clientComponents/globals/ValidationMessage/ValidationMessage";

export const SupportFlow = () => {
  const { t } = useTranslation("form-builder");
  const [emailError, setEmailError] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(false);
    setEmailSaved(false);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("support-flow-email") as string;

    if (!isValidGovEmail(email)) {
      setEmailError(true);
      return;
    }

    // @TODO DB call to save email
    logMessage.info(`SupportFlow email saved for email: ${email}`);
    setEmailSaved(true);
  };

  const cssBorderDefault = "border-1 border-slate-500";
  const cssBorderError =
    "border-2 border-red outline-red focus:outline-red-focus focus:outline-red focus:border-red-focus";

  return (
    <form className="mb-10" onSubmit={handleSubmit} noValidate>
      <h2>{t("supportFLowAddEmail.title")}</h2>
      <p className="mb-4" id="support-flow-description">
        {t("supportFLowAddEmail.description")}
      </p>
      <div className="mb-4">
        <ValidationMessage show={emailError} messageType={MessageType.ERROR}>
          {t("supportFLowAddEmail.error.validEmail.description")}
        </ValidationMessage>
        <ValidationMessage show={emailSaved} messageType={MessageType.SUCCESS}>
          {t("supportFLowAddEmail.emailSaved")}
        </ValidationMessage>
      </div>
      <div className="mb-4">
        <label
          htmlFor="support-flow-email"
          className="inline-block rounded-l-md border-1 border-r-0 border-solid  border-slate-500 px-4 py-2"
        >
          {t("supportFLowAddEmail.email")}
        </label>
        <input
          id="support-flow-email"
          name="support-flow-email"
          className={cn(
            "w-96 rounded-r-md border-solid p-2",
            emailError ? cssBorderError : cssBorderDefault
          )}
          type="email"
          aria-describedby="support-flow-description"
          required
        />
      </div>
      <Button theme="secondary" type="submit">
        {t("supportFLowAddEmail.submit")}
      </Button>
    </form>
  );
};
