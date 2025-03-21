import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { logMessage } from "@lib/logger";
import { isValidGovEmail } from "@lib/validation/validation";
import { useState } from "react";

export const SupportFlow = () => {
  const { t } = useTranslation("form-builder");
  const [emailError, setEmailError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(false);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("support-flow-email") as string;

    if (!isValidGovEmail(email)) {
      setEmailError(true);
      return;
    }

    logMessage.info(`SupportFlow email set to - TODO send to DB: ${email}`);
  };

  const InvalidEmail = () => {
    return (
      <div className="mb-4 w-3/5 bg-red-100 p-2 text-sm">
        <p>{t("supportFLowAddEmail.error.validEmail.title")}</p>
        <p> {t("supportFLowAddEmail.error.validEmail.description")}</p>
      </div>
    );
  };

  return (
    <form className="mb-10" onSubmit={handleSubmit}>
      <h2>{t("supportFLowAddEmail.title")}</h2>
      <p className="mb-4" id="support-flow-description">
        {t("supportFLowAddEmail.description")}
      </p>
      <div role="alert">{emailError && <InvalidEmail />}</div>
      <div className="mb-4">
        <div className="inline-block rounded-sm border-1 border-solid  border-slate-500">
          <label
            htmlFor="support-flow-email"
            className="inline-block h-full bg-slate-100 px-4 py-2"
          >
            {t("supportFLowAddEmail.email")}
          </label>
          <input
            id="support-flow-email"
            name="support-flow-email"
            className="w-96 border-l-1 border-solid  border-slate-500 p-2"
            type="email"
            aria-describedby="support-flow-description"
          />
        </div>
      </div>
      <Button theme="secondary" type="submit">
        {t("supportFLowAddEmail.submit")}
      </Button>
    </form>
  );
};
