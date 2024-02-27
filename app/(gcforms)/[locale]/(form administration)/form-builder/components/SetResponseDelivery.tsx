"use client";
import React, { useCallback, useState, useMemo } from "react";
import { LocalizedFormProperties } from "@clientComponents/form-builder/types";
import axios from "axios";
import { useTranslation } from "@i18n/client";
import { useSession } from "next-auth/react";

import { useRefresh } from "@lib/hooks";
import { isValidGovEmail } from "@lib/validation";
import { ResponseEmail } from "./ResponseEmail";
import { Radio } from "./shared";
import { Button } from "@clientComponents/globals";
import { useTemplateApi } from "hooks";
import { useTemplateStore } from "@clientComponents/form-builder/store";
import { completeEmailAddressRegex } from "@clientComponents/form-builder/util";
import { toast } from "./shared/Toast";
import { ResponseDeliveryHelpButton } from "app/(gcforms)/[locale]/(form administration)/form-builder/components/shared";
import { ClassificationType, ClassificationSelect } from "./ClassificationSelect";

enum DeliveryOption {
  vault = "vault",
  email = "email",
}

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

  const [classification, setClassification] = useState<ClassificationType>(
    securityAttribute ? (securityAttribute as ClassificationType) : "Protected A"
  );

  const protectedBSelected = classification === "Protected B";
  const emailLabel = protectedBSelected ? (
    <>
      <span className="block">{t("formSettingsModal.emailOption.label")}</span>
      <span className="block">{t("formSettingsModal.emailOption.note")}</span>
    </>
  ) : (
    t("formSettingsModal.emailOption.label")
  );

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

    return save({
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
    return save({
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

  const handleUpdateClassification = useCallback((value: ClassificationType) => {
    if (value === "Protected B") {
      setDeliveryOption(DeliveryOption.vault);
    }
    setClassification(value);
  }, []);

  return (
    <>
      {status === "authenticated" && (
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="mb-6">{t("settingsResponseDelivery.selectClassification")}</h2>
            <p className="mb-5 inline-block bg-purple-200 p-3 text-sm font-bold">
              {t("settingsResponseDelivery.beforePublishMessage")}
            </p>
            <div>
              <ClassificationSelect
                className="max-w-[400px] truncate bg-gray-soft p-1 pr-10"
                lang={lang}
                isPublished={isPublished}
                classification={classification}
                handleUpdateClassification={handleUpdateClassification}
              />
            </div>
          </div>
          <div className="mb-4">
            <h2 className="mb-6">{t("settingsResponseDelivery.title")}</h2>
            {protectedBSelected ? (
              <p className="mb-5 inline-block bg-purple-200 p-3 text-sm font-bold">
                {t("settingsResponseDelivery.protectedBMessage")}
              </p>
            ) : null}
            <Radio
              disabled={isPublished}
              id={`delivery-option-${DeliveryOption.vault}`}
              checked={deliveryOption === DeliveryOption.vault}
              name="response-delivery"
              value={DeliveryOption.vault}
              label={t("settingsResponseDelivery.vaultOption")}
              onChange={updateDeliveryOption}
            >
              <span className="mb-1 ml-3 block text-sm">
                {t("settingsResponseDelivery.vaultOptionHint.text1")}{" "}
                <a href={responsesLink}>{t("settingsResponseDelivery.vaultOptionHint.text2")}</a>.
                {t("settingsResponseDelivery.vaultOptionHint.text3")}
              </span>
            </Radio>
            <Radio
              disabled={isPublished || protectedBSelected}
              id={`delivery-option-${DeliveryOption.email}`}
              checked={deliveryOption === DeliveryOption.email}
              name="response-delivery"
              value={DeliveryOption.email}
              label={emailLabel}
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
          <ResponseDeliveryHelpButton />
        </div>
      )}
    </>
  );
};
