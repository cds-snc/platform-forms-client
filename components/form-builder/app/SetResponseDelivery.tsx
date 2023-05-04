import React, { useCallback, useState, useMemo } from "react";
import { LocalizedFormProperties } from "../types";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";

import { useRefresh } from "@lib/hooks";
import { isValidGovEmail } from "@lib/validation";
import { ResponseEmail } from "./ResponseEmail";
import { Radio, Button } from "./shared";
import { useTemplateApi } from "../hooks";
import { useTemplateStore } from "../store";
import { completeEmailAddressRegex } from "../util";
import { toast } from "./shared/Toast";

enum DeliveryOption {
  vault = "vault",
  email = "email",
}

const classificationOptions = [
  { value: "Unclassified", en: "Unclassified", fr: "Non classifié" },
  { value: "Protected A", en: "Protected A", fr: "Protégé A" },
] as const;

type Classification = (typeof classificationOptions)[number]["value"];

export const SetResponseDelivery = () => {
  const { t, i18n } = useTranslation("form-builder");
  const { status } = useSession();
  const session = useSession();
  const { save, updateResponseDelivery } = useTemplateApi();
  const { refreshData } = useRefresh();
  const lang = i18n.language === "en" ? "en" : "fr";

  const {
    email,
    id,
    resetDeliveryOption,
    getSchema,
    getName,
    getDeliveryOption,
    updateField,
    subjectEn: initialSubjectEn,
    subjectFr: initialSubjectFr,
    defaultSubjectEn,
    defaultSubjectFr,
    securityAttribute,
    updateSecurityAttribute,
    isPublished,
  } = useTemplateStore((s) => ({
    id: s.id,
    email: s.deliveryOption?.emailAddress,
    subjectEn: s.deliveryOption?.emailSubjectEn,
    subjectFr: s.deliveryOption?.emailSubjectFr,
    defaultSubjectEn: s.form[s.localizeField(LocalizedFormProperties.TITLE, "en")] + " - Response",
    defaultSubjectFr: s.form[s.localizeField(LocalizedFormProperties.TITLE, "fr")] + " - Réponse",
    resetDeliveryOption: s.resetDeliveryOption,
    getSchema: s.getSchema,
    getName: s.getName,
    getDeliveryOption: s.getDeliveryOption,
    updateField: s.updateField,
    updateSecurityAttribute: s.updateSecurityAttribute,
    securityAttribute: s.securityAttribute,
    isPublished: s.isPublished,
  }));

  const userEmail = session.data?.user.email ?? "";
  const initialDeliveryOption = !email ? DeliveryOption.vault : DeliveryOption.email;

  const [deliveryOption, setDeliveryOption] = useState(initialDeliveryOption);
  const [inputEmail, setInputEmail] = useState(email ? email : userEmail);
  const [subjectEn, setSubjectEn] = useState(
    initialSubjectEn ? initialSubjectEn : defaultSubjectEn
  );
  const [subjectFr, setSubjectFr] = useState(
    initialSubjectFr ? initialSubjectFr : defaultSubjectFr
  );

  const [classification, setClassification] = useState<Classification>(
    securityAttribute as Classification
  );

  const [isInvalidEmailError, setIsInvalidEmailError] = useState(false);

  /*--------------------------------------------*
   * Form Validation
   *--------------------------------------------*/
  const isValid = useMemo(() => {
    if (classification !== securityAttribute) {
      return true;
    }

    const isValidDeliveryOption =
      !isInvalidEmailError && inputEmail !== "" && subjectEn !== "" && subjectFr !== "";
    const emailDeliveryOptionsChanged =
      inputEmail !== email || subjectEn !== initialSubjectEn || subjectFr !== initialSubjectFr;

    if (deliveryOption === DeliveryOption.email) {
      if (!completeEmailAddressRegex.test(inputEmail)) {
        return false;
      }
      return isValidDeliveryOption && emailDeliveryOptionsChanged;
    }

    if (deliveryOption === initialDeliveryOption) {
      return false;
    }

    return true;
  }, [
    deliveryOption,
    initialDeliveryOption,
    isInvalidEmailError,
    inputEmail,
    email,
    subjectEn,
    initialSubjectEn,
    subjectFr,
    initialSubjectFr,
    classification,
    securityAttribute,
  ]);

  /*--------------------------------------------*
   * Set as Database Storage
   *--------------------------------------------*/
  const setToDatabaseDelivery = useCallback(async () => {
    setInputEmail("");
    resetDeliveryOption();
    updateSecurityAttribute(classification);

    const result = await updateResponseDelivery(id);

    if (!result || axios.isAxiosError(result)) {
      return result;
    }

    return await save({
      jsonConfig: getSchema(),
      name: getName(),
      formID: id,
      securityAttribute: classification,
    });
  }, [
    id,
    resetDeliveryOption,
    setInputEmail,
    classification,
    updateSecurityAttribute,
    save,
    getSchema,
    getName,
    updateResponseDelivery,
  ]);

  /*--------------------------------------------*
   * Set as Email Delivery
   *--------------------------------------------*/
  const setToEmailDelivery = useCallback(async () => {
    if (!isValidGovEmail(inputEmail)) return false;
    updateField("deliveryOption.emailAddress", inputEmail);
    updateField("deliveryOption.emailSubjectEn", subjectEn);
    updateField("deliveryOption.emailSubjectFr", subjectFr);

    updateSecurityAttribute(classification);
    return await save({
      jsonConfig: getSchema(),
      name: getName(),
      formID: id,
      deliveryOption: getDeliveryOption(),
      securityAttribute: classification,
    });
  }, [
    inputEmail,
    subjectEn,
    subjectFr,
    id,
    save,
    getSchema,
    getName,
    getDeliveryOption,
    updateField,
    classification,
    updateSecurityAttribute,
  ]);

  /*--------------------------------------------*
   * Save Delivery Option
   *--------------------------------------------*/
  const saveDeliveryOption = useCallback(async () => {
    let result;

    if (email !== "" && deliveryOption === DeliveryOption.vault) {
      result = await setToDatabaseDelivery();
    } else {
      result = await setToEmailDelivery();
    }

    if (!result || axios.isAxiosError(result)) {
      toast.error(t("settingsResponseDelivery.savedErrorMessage"));

      return;
    }

    toast.success(t("settingsResponseDelivery.savedSuccessMessage"));

    refreshData && refreshData();
  }, [refreshData, deliveryOption, email, setToDatabaseDelivery, setToEmailDelivery, t]);

  const updateDeliveryOption = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setDeliveryOption(value as DeliveryOption);
  }, []);

  const responsesLink = `/${i18n.language}/form-builder/responses/${id}`;

  const handleUpdateClassification = useCallback((value: Classification) => {
    setClassification(value);
  }, []);

  return (
    <>
      <h1 className="visually-hidden">{t("formSettings")}</h1>
      {status === "authenticated" && (
        <div className="mb-10">
          <div className="mb-4">
            <p className="block mb-4 text-xl font-bold">
              {t("settingsResponseDelivery.selectClassification")}
            </p>
            <p className="inline-block mb-5 p-3 bg-purple-200 font-bold text-sm">
              {t("settingsResponseDelivery.beforePublishMessage")}
            </p>
            <select
              disabled={isPublished}
              id="classification-select"
              value={classification}
              className="gc-dropdown inline-block mb-5 text-black-default"
              onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => {
                const val = evt.target.value;
                handleUpdateClassification(val as Classification);
              }}
            >
              {classificationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option[lang]}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <div className="block mb-4 text-xl font-bold">
              {t("settingsResponseDelivery.title")}
            </div>
            <Radio
              disabled={isPublished}
              id={`delivery-option-${DeliveryOption.vault}`}
              checked={deliveryOption === DeliveryOption.vault}
              name="response-delivery"
              value={DeliveryOption.vault}
              label={t("settingsResponseDelivery.vaultOption")}
              onChange={updateDeliveryOption}
            >
              <span className="block ml-3 text-sm mb-1">
                {t("settingsResponseDelivery.vaultOptionHint.text1")}{" "}
                <a href={responsesLink}>{t("settingsResponseDelivery.vaultOptionHint.text2")}</a>.
              </span>
            </Radio>
            <Radio
              disabled={isPublished}
              id={`delivery-option-${DeliveryOption.email}`}
              checked={deliveryOption === DeliveryOption.email}
              name="response-delivery"
              value={DeliveryOption.email}
              label={t("settingsResponseDelivery.emailOption")}
              onChange={updateDeliveryOption}
            />
          </div>

          {deliveryOption === DeliveryOption.email && (
            <ResponseEmail
              inputEmail={inputEmail}
              setInputEmail={setInputEmail}
              subjectEn={subjectEn}
              setSubjectEn={setSubjectEn}
              subjectFr={subjectFr}
              setSubjectFr={setSubjectFr}
              isInvalidEmailError={isInvalidEmailError}
              setIsInvalidEmailError={setIsInvalidEmailError}
            />
          )}

          <Button disabled={!isValid || isPublished} theme="secondary" onClick={saveDeliveryOption}>
            {t("settingsResponseDelivery.saveButton")}
          </Button>
          {/* #1800 -- turn on when Protected B */}
          {/* <ResponseDeliveryHelpButton /> */}
        </div>
      )}
    </>
  );
};
