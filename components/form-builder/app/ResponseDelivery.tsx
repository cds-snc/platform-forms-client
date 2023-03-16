import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { useTemplateStore } from "../store";
import { Input } from "./shared";
import { isValidGovEmail } from "@lib/validation";
import { DeleteForm } from "./DeleteForm";

const Label = ({ htmlFor, children }: { htmlFor: string; children?: JSX.Element | string }) => {
  return (
    <label className="block font-bold mb-1" htmlFor={htmlFor}>
      {children}
    </label>
  );
};

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

export const ResponseDelivery = () => {
  const { t, i18n } = useTranslation("form-builder");

  const { email, updateField, isPublished } = useTemplateStore((s) => ({
    email: s.deliveryOption?.emailAddress,
    updateField: s.updateField,
    isPublished: s.isPublished,
  }));

  const [inputEmail, setInputEmail] = useState(email ?? "");
  const [IsInvalidEmailErrorActive, setIsInvalidEmailErrorActive] = useState(false);

  const handleEmailChange = (email: string) => {
    setInputEmail(email);

    const completeEmailAddressRegex =
      /^([a-zA-Z0-9!#$%&'*+-/=?^_`{|}~.])+@([a-zA-Z0-9-.]+)\.([a-zA-Z0-9]{2,})+$/;

    // We want to make sure the email address is complete before validating it
    if (!completeEmailAddressRegex.test(email)) {
      setIsInvalidEmailErrorActive(false);
      return;
    }

    if (isValidGovEmail(email)) {
      setIsInvalidEmailErrorActive(false);
      updateField(`deliveryOption.emailAddress`, email);
    } else {
      setIsInvalidEmailErrorActive(true);
    }
  };

  return (
    <>
      <h1 className="visually-hidden">{t("formSettings")}</h1>

      {isPublished && (
        <div className="mb-10">
          <Label htmlFor="response-delivery">{t("settingsResponseTitle")}</Label>
          <HintText id="response-delivery-hint-1">{t("settingsResponseHint1")}</HintText>
          <HintText id="response-delivery-hint-2">{t("settingsResponseHint2")}</HintText>
          <div className="mt-4 mb-4 p-4 bg-purple-200 text-sm inline-block">
            {t("settingsResponseNotePublished")}
            <a
              href={`/${i18n.language}/form-builder/support`}
              className="ml-2"
              target="_blank"
              rel="noreferrer"
            >
              {t("contactSupport")}
            </a>
            .
          </div>
          <div>{inputEmail}</div>
        </div>
      )}

      {!isPublished && (
        <div className="mb-10">
          <Label htmlFor="response-delivery">{t("settingsResponseTitle")}</Label>
          <HintText id="response-delivery-hint-1">{t("settingsResponseHint1")}</HintText>
          <HintText id="response-delivery-hint-2">{t("settingsResponseHint2")}</HintText>
          <div className="mt-4 p-4 bg-purple-200 text-sm inline-block">
            {t("settingsResponseNote")}
            <a
              href={`/${i18n.language}/form-builder/support`}
              className="ml-2"
              target="_blank"
              rel="noreferrer"
            >
              {t("contactSupport")}
            </a>
            .
          </div>
          <InvalidEmailError id="invalidEmailError" isActive={IsInvalidEmailErrorActive} />

          <div className="block font-bold mb-1 text-sm">{t("settingsResponseEmailTitle")}</div>
          <Input
            id="response-delivery"
            isInvalid={IsInvalidEmailErrorActive}
            describedBy="response-delivery-hint-1 response-delivery-hint-2 invalidEmailError"
            value={inputEmail}
            theme={IsInvalidEmailErrorActive ? "error" : "default"}
            className="w-3/5"
            onChange={(e) => handleEmailChange(e.target.value)}
          />
        </div>
      )}
    </>
  );
};
