import React, { useEffect } from "react";
import { useTranslation } from "next-i18next";
import { isValidGovEmail } from "@lib/validation";
import { Input } from "./shared";

const HintText = ({ id, children }: { id: string; children?: JSX.Element | string }) => {
  return (
    <span className="block text-sm mb-1" id={id}>
      {children}
    </span>
  );
};

const InvalidEmailError = ({ id, isActive }: { id: string; isActive: boolean }) => {
  const { t, i18n } = useTranslation("form-builder");

  return (
    <div id={id} className="mt-2 mb-2" role="alert">
      {isActive && (
        <>
          <h2 className="text-red text-sm font-bold pb-1">{t("settingsInvalidEmailAlertTitle")}</h2>
          <div className="bg-red-100 w-3/5 text-sm p-2">
            <span>{t("settingsInvalidEmailAlertDesc1")}</span>
            <br />
            <a href={`/${i18n.language}/form-builder/support`} target="_blank" rel="noreferrer">
              {t("contactSupport")}
            </a>
            <span> {t("settingsInvalidEmailAlertDesc2")}</span>
          </div>
        </>
      )}
    </div>
  );
};

export const ResponseEmail = ({
  inputEmail,
  setInputEmail,
  subjectEn,
  setSubjectEn,
  subjectFr,
  setSubjectFr,
  isInvalidEmailError,
  setIsInvalidEmailError,
}: {
  inputEmail: string;
  setInputEmail: (email: string) => void;
  subjectEn: string;
  setSubjectEn: (subject: string) => void;
  subjectFr: string;
  setSubjectFr: (subject: string) => void;
  isInvalidEmailError: boolean;
  setIsInvalidEmailError: (isInvalid: boolean) => void;
}) => {
  const { t } = useTranslation("form-builder");

  const handleEmailChange = (email: string) => {
    setInputEmail(email);
  };

  useEffect(() => {
    const completeEmailAddressRegex =
      /^([a-zA-Z0-9!#$%&'*+-/=?^_`{|}~.])+@([a-zA-Z0-9-.]+)\.([a-zA-Z0-9]{2,})+$/;

    // We want to make sure the email address is complete before validating it
    if (!completeEmailAddressRegex.test(inputEmail)) {
      setIsInvalidEmailError(false);
      return;
    }

    if (inputEmail === "" || isValidGovEmail(inputEmail)) {
      setIsInvalidEmailError(false);
    } else {
      setIsInvalidEmailError(true);
    }
  }, [inputEmail, setIsInvalidEmailError]);

  return (
    <div className="mb-10 pl-8 border-l-4 ml-4 ">
      <InvalidEmailError id="invalidEmailError" isActive={isInvalidEmailError} />
      <div className="block font-bold mb-1 text-sm">{t("settingsResponseEmailTitle")}</div>
      <HintText id="response-delivery-hint-1">{t("settingsResponseHint1")}</HintText>
      <Input
        id="response-delivery"
        isInvalid={isInvalidEmailError}
        describedBy="response-delivery-hint-1 invalidEmailError"
        value={inputEmail}
        theme={isInvalidEmailError ? "error" : "default"}
        className="w-3/5"
        onChange={(e) => handleEmailChange(e.target.value)}
      />

      <div>
        <div className="block font-bold mt-6 text-sm">
          {t("settingsResponseDelivery.emailSubjectEn.title")}
        </div>
        <Input
          id="response-delivery-subject-en"
          describedBy="response-delivery-hint-1 invalidEmailError"
          value={subjectEn}
          theme={"default"}
          className="w-3/5"
          onChange={(e) => setSubjectEn(e.target.value)}
        />
      </div>
      <div className="block font-bold mt-6 text-sm">
        {t("settingsResponseDelivery.emailSubjectFr.title")}
      </div>
      <Input
        id="response-delivery-subject-en"
        describedBy="response-delivery-hint-1 invalidEmailError"
        value={subjectFr}
        theme={"default"}
        className="w-3/5"
        onChange={(e) => setSubjectFr(e.target.value)}
      />
    </div>
  );
};
