import React, { useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { isValidGovEmail } from "@lib/validation";
import { Input } from "./shared";
import { completeEmailAddressRegex } from "../util";

const HintText = ({ id, children }: { id: string; children?: JSX.Element | string }) => {
  return (
    <span className="mb-1 block text-sm" id={id}>
      {children}
    </span>
  );
};

const InvalidEmailError = ({ id, isActive }: { id: string; isActive: boolean }) => {
  const { t, i18n } = useTranslation("form-builder");

  return (
    <div id={id} className="my-2" role="alert">
      {isActive && (
        <>
          <h2 className="pb-1 text-sm font-bold text-red">{t("settingsInvalidEmailAlertTitle")}</h2>
          <div className="w-3/5 bg-red-100 p-2 text-sm">
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
    <div className="mb-10 ml-4 border-l-4 pl-8 ">
      <InvalidEmailError id="invalidEmailError" isActive={isInvalidEmailError} />
      <div className="mb-1 block text-sm font-bold">{t("settingsResponseEmailTitle")}</div>
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
        <div className="mb-1 mt-6 block text-sm font-bold">
          {t("settingsResponseDelivery.emailSubjectEn.title")}
        </div>
        <HintText id="response-delivery-subject-en-hint-1">
          {t("settingsResponseDelivery.emailSubjectEn.hint")}
        </HintText>
        <Input
          id="response-delivery-subject-en"
          describedBy="response-delivery-subject-en-hint invalidEmailError"
          value={subjectEn}
          theme={"default"}
          className="w-3/5"
          onChange={(e) => setSubjectEn(e.target.value)}
        />
      </div>
      <div className="mb-1 mt-6 block text-sm font-bold">
        {t("settingsResponseDelivery.emailSubjectFr.title")}
      </div>
      <HintText id="response-delivery-subject-fr-hint">
        {t("settingsResponseDelivery.emailSubjectFr.hint")}
      </HintText>
      <Input
        id="response-delivery-subject-en"
        describedBy="response-delivery-subject-fr-hint invalidEmailError"
        value={subjectFr}
        theme={"default"}
        className="w-3/5"
        onChange={(e) => setSubjectFr(e.target.value)}
      />
    </div>
  );
};
