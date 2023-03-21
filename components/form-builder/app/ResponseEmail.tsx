import React, { useState } from "react";
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
}: {
  inputEmail: string;
  setInputEmail: (email: string) => void;
}) => {
  const { t } = useTranslation("form-builder");
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
    } else {
      setIsInvalidEmailErrorActive(true);
    }
  };

  return (
    <div className="mb-10 pl-8 border-l-4 ml-4 ">
      <InvalidEmailError id="invalidEmailError" isActive={IsInvalidEmailErrorActive} />
      <div className="block font-bold mb-1 text-sm">{t("settingsResponseEmailTitle")}</div>
      <HintText id="response-delivery-hint-1">{t("settingsResponseHint1")}</HintText>
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
  );
};
