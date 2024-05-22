"use client";
import React, { useCallback, useState, useMemo } from "react";
import { LocalizedFormProperties } from "@lib/types/form-builder-types";
import { useTranslation } from "@i18n/client";
import { useSession } from "next-auth/react";
import { isValidGovEmail } from "@lib/validation/validation";
import { ResponseEmail } from "@formBuilder/components/ResponseEmail";
import { Radio } from "@formBuilder/components/shared";
import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { completeEmailAddressRegex } from "@lib/utils/form-builder";
import { toast } from "@formBuilder/components/shared/Toast";
import { ResponseDeliveryHelpButton } from "@formBuilder/components/shared";
import {
  ClassificationType,
  ClassificationSelect,
} from "@formBuilder/components/ClassificationSelect";
import {
  sendResponsesToVault,
  updateTemplateDeliveryOption,
  updateTemplateSecurityAttribute,
} from "@formBuilder/actions";
import { useRefresh } from "@lib/hooks/useRefresh";

enum DeliveryOption {
  vault = "vault",
  email = "email",
}

export const ResponseDelivery = () => {
  const { t, i18n } = useTranslation("form-builder");
  const { status } = useSession();
  const session = useSession();
  const { refreshData } = useRefresh();
  const lang = i18n.language === "en" ? "en" : "fr";

  const {
    email,
    id,
    resetDeliveryOption,
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

  const [deliveryOptionValue, setDeliveryOptionValue] = useState(initialDeliveryOption);
  const [inputEmailValue, setInputEmailValue] = useState(email ? email : userEmail);
  const [subjectEnValue, setSubjectEnValue] = useState(
    initialSubjectEn ? initialSubjectEn : defaultSubjectEn
  );
  const [subjectFrValue, setSubjectFrValue] = useState(
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
      !isInvalidEmailError &&
      inputEmailValue !== "" &&
      subjectEnValue !== "" &&
      subjectFrValue !== "";
    const emailDeliveryOptionsChanged =
      inputEmailValue !== email ||
      subjectEnValue !== initialSubjectEn ||
      subjectFrValue !== initialSubjectFr;

    if (deliveryOptionValue === DeliveryOption.email) {
      if (!completeEmailAddressRegex.test(inputEmailValue)) {
        return false;
      }
      return isValidDeliveryOption && emailDeliveryOptionsChanged;
    }

    if (deliveryOptionValue === initialDeliveryOption) {
      return false;
    }

    return true;
  }, [
    deliveryOptionValue,
    initialDeliveryOption,
    isInvalidEmailError,
    inputEmailValue,
    email,
    subjectEnValue,
    initialSubjectEn,
    subjectFrValue,
    initialSubjectFr,
    classification,
    securityAttribute,
  ]);

  /*--------------------------------------------*
   * Set as Database Storage
   *--------------------------------------------*/
  const setToDatabaseDelivery = useCallback(async () => {
    setInputEmailValue("");
    resetDeliveryOption();
    updateSecurityAttribute(classification);

    await sendResponsesToVault({
      id: id,
    });
  }, [id, resetDeliveryOption, setInputEmailValue, classification, updateSecurityAttribute]);

  /*--------------------------------------------*
   * Set as Email Delivery
   *--------------------------------------------*/
  const setToEmailDelivery = useCallback(async () => {
    if (!isValidGovEmail(inputEmailValue)) return false;
    updateField("deliveryOption.emailAddress", inputEmailValue);
    updateField("deliveryOption.emailSubjectEn", subjectEnValue);
    updateField("deliveryOption.emailSubjectFr", subjectFrValue);

    updateSecurityAttribute(classification);

    await updateTemplateDeliveryOption({
      id,
      deliveryOption: getDeliveryOption(),
    });
  }, [
    inputEmailValue,
    subjectEnValue,
    subjectFrValue,
    id,
    getDeliveryOption,
    updateField,
    classification,
    updateSecurityAttribute,
  ]);

  /*--------------------------------------------*
   * Save Delivery Option
   *--------------------------------------------*/
  const saveDeliveryOption = useCallback(async () => {
    try {
      if (email !== "" && deliveryOptionValue === DeliveryOption.vault) {
        await setToDatabaseDelivery();
      } else {
        await setToEmailDelivery();
      }

      updateTemplateSecurityAttribute({
        id,
        securityAttribute: classification,
      });
    } catch (error) {
      toast.error(t("settingsResponseDelivery.savedErrorMessage"));
      return;
    }

    toast.success(t("settingsResponseDelivery.savedSuccessMessage"));

    refreshData && refreshData();
  }, [
    t,
    refreshData,
    email,
    deliveryOptionValue,
    id,
    classification,
    setToDatabaseDelivery,
    setToEmailDelivery,
  ]);

  const updateDeliveryOption = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setDeliveryOptionValue(value as DeliveryOption);
  }, []);

  const responsesLink = `/${i18n.language}/form-builder/${id}/responses`;

  const handleUpdateClassification = useCallback((value: ClassificationType) => {
    if (value === "Protected B") {
      setDeliveryOptionValue(DeliveryOption.vault);
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
              checked={deliveryOptionValue === DeliveryOption.vault}
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
              checked={deliveryOptionValue === DeliveryOption.email}
              name="response-delivery"
              value={DeliveryOption.email}
              label={emailLabel}
              onChange={updateDeliveryOption}
            />
          </div>

          {deliveryOptionValue === DeliveryOption.email && (
            <ResponseEmail
              inputEmail={inputEmailValue}
              setInputEmail={setInputEmailValue}
              subjectEn={subjectEnValue}
              setSubjectEn={setSubjectEnValue}
              subjectFr={subjectFrValue}
              setSubjectFr={setSubjectFrValue}
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
