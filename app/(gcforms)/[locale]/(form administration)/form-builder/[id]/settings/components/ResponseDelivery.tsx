"use client";
import React, { useCallback, useState, useMemo } from "react";
import {
  LocalizedFormProperties,
  FormServerError,
  FormServerErrorCodes,
} from "@lib/types/form-builder-types";
import { useTranslation } from "@i18n/client";
import { useSession } from "next-auth/react";
import { isValidGovEmail } from "@lib/validation/validation";
import { ResponseEmail } from "@formBuilder/components/ResponseEmail";
import { Radio } from "@formBuilder/components/shared/MultipleChoice";
import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { completeEmailAddressRegex } from "@lib/utils/form-builder";
import { ResponseDeliveryHelpButton } from "@formBuilder/components/shared/ResponseDeliveryHelpDialog";
import { FormPurposeHelpButton } from "@formBuilder/components/shared/FormPurposeHelpButton";
import { ResponseDeliveryHelpButtonWithApi } from "@formBuilder/components/shared/ResponseDeliveryHelpDialogApiWithApi";
import {
  ClassificationType,
  ClassificationSelect,
} from "@formBuilder/components/ClassificationSelect";
import {
  sendResponsesToVault,
  updateTemplateDeliveryOption,
  updateTemplateSecurityAttribute,
  updateTemplateFormPurpose,
} from "@formBuilder/actions";
import { useRefresh } from "@lib/hooks/useRefresh";

import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";

import Markdown from "markdown-to-jsx";

import { toast } from "@formBuilder/components/shared/Toast";
import { ErrorSaving } from "@formBuilder/components/shared/ErrorSaving";
import { ApiKeyButton } from "../api/components/ApiKeyButton";
import { ApiDocNotes } from "./ApiDocNotes";

enum DeliveryOption {
  vault = "vault",
  email = "email",
  api = "api",
}

/*
 * PurposeOption is used to determine the purpose of the form
 * admin: The form is used to collect personal information
 * nonAdmin: The form is used to collect non-personal information
 */
export enum PurposeOption {
  none = "",
  admin = "admin",
  nonAdmin = "nonAdmin",
}

type ResponseDeliveryProps = {
  keyId: string | false;
};

export const ResponseDelivery = ({ keyId }: ResponseDeliveryProps) => {
  const { t, i18n } = useTranslation("form-builder");
  const { status } = useSession();
  const session = useSession();
  const { refreshData } = useRefresh();
  const lang = i18n.language === "en" ? "en" : "fr";

  const {
    email,
    id,
    resetDeliveryOption,
    updateField,
    subjectEn: initialSubjectEn,
    subjectFr: initialSubjectFr,
    defaultSubjectEn,
    defaultSubjectFr,
    securityAttribute,
    updateSecurityAttribute,
    isPublished,
    formPurpose,
  } = useTemplateStore((s) => ({
    id: s.id,
    email: s.deliveryOption?.emailAddress,
    subjectEn: s.deliveryOption?.emailSubjectEn,
    subjectFr: s.deliveryOption?.emailSubjectFr,
    defaultSubjectEn: s.form[s.localizeField(LocalizedFormProperties.TITLE, "en")] + " - Response",
    defaultSubjectFr: s.form[s.localizeField(LocalizedFormProperties.TITLE, "fr")] + " - Réponse",
    resetDeliveryOption: s.resetDeliveryOption,
    formPurpose: s.formPurpose,
    updateField: s.updateField,
    updateSecurityAttribute: s.updateSecurityAttribute,
    securityAttribute: s.securityAttribute,
    isPublished: s.isPublished,
  }));

  const [classification, setClassification] = useState<ClassificationType>(
    securityAttribute ? (securityAttribute as ClassificationType) : "Protected A"
  );

  const { getFlag } = useFeatureFlags();
  const apiAccess = getFlag("apiAccess");

  const protectedBSelected = classification === "Protected B";
  const emailLabel = protectedBSelected ? (
    <>
      <span className="block">{t("formSettingsModal.emailOption.label")}</span>
      <span className="block">{t("formSettingsModal.emailOption.note")}</span>
    </>
  ) : (
    t("formSettingsModal.emailOption.label")
  );

  const apiLabel = (
    <>
      <span className="block">{t("formSettingsModal.apiOption.label")}</span>
      <span className="block">{t("formSettingsModal.apiOption.note")}</span>
    </>
  );

  const userEmail = session.data?.user.email ?? "";
  let initialDeliveryOption = !email ? DeliveryOption.vault : DeliveryOption.email;

  const hasApiKey = keyId && apiAccess ? true : false;

  // Check for API key -- if a key is present, set the initial delivery option to API
  if (hasApiKey) {
    initialDeliveryOption = DeliveryOption.api;
  }

  const [deliveryOptionValue, setDeliveryOptionValue] = useState(initialDeliveryOption);
  const [purposeOption, setPurposeOption] = useState(formPurpose as PurposeOption);

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
      return (
        isValidDeliveryOption && (emailDeliveryOptionsChanged || purposeOption !== formPurpose)
      );
    }

    if (deliveryOptionValue === initialDeliveryOption && purposeOption === formPurpose) {
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
    purposeOption,
    formPurpose,
  ]);

  /*--------------------------------------------*
   * Set as Database Storage
   *--------------------------------------------*/
  const setToDatabaseDelivery = useCallback(async () => {
    const result = await sendResponsesToVault({
      id: id,
    });

    if (!result.error) {
      // Update local state
      setInputEmailValue("");

      // Update the template store
      resetDeliveryOption();
      updateSecurityAttribute(classification);
    }

    return result;
  }, [id, resetDeliveryOption, setInputEmailValue, classification, updateSecurityAttribute]);

  /*--------------------------------------------*
   * Set as Email Delivery
   *--------------------------------------------*/
  const setToEmailDelivery = useCallback(async () => {
    if (!isValidGovEmail(inputEmailValue)) return false;

    // Call server action
    const result = await updateTemplateDeliveryOption({
      id,
      deliveryOption: {
        emailAddress: inputEmailValue,
        emailSubjectEn: subjectEnValue,
        emailSubjectFr: subjectFrValue,
      },
    });

    if (!result.error) {
      // Update the template store
      updateField("deliveryOption.emailAddress", inputEmailValue);
      updateField("deliveryOption.emailSubjectEn", subjectEnValue);
      updateField("deliveryOption.emailSubjectFr", subjectFrValue);
      updateSecurityAttribute(classification);
    }

    return result;
  }, [
    inputEmailValue,
    subjectEnValue,
    subjectFrValue,
    id,
    updateField,
    classification,
    updateSecurityAttribute,
  ]);

  /*--------------------------------------------*
   * Save Delivery Option
   *--------------------------------------------*/
  const saveDeliveryOptions = useCallback(async () => {
    let result;

    if (
      (email !== "" && deliveryOptionValue === DeliveryOption.vault) ||
      deliveryOptionValue === DeliveryOption.api
    ) {
      // Call local callBack which will call the server action
      result = (await setToDatabaseDelivery()) as FormServerError;
    } else {
      // Call local callBack which will call the server action
      result = (await setToEmailDelivery()) as FormServerError;
    }

    if (result?.error) {
      toast.error(<ErrorSaving errorCode={FormServerErrorCodes.DELIVERY_OPTION} />, "wide");
      return;
    }

    // Update security attribute server action
    result = (await updateTemplateSecurityAttribute({
      id,
      securityAttribute: classification,
    })) as FormServerError;

    if (result?.error) {
      toast.error(<ErrorSaving errorCode={FormServerErrorCodes.DELIVERY_OPTION} />, "wide");
      return;
    }

    updateField("formPurpose", purposeOption);
    result = (await updateTemplateFormPurpose({
      id,
      formPurpose: formPurpose,
    })) as FormServerError;

    if (result?.error) {
      toast.error(<ErrorSaving errorCode={FormServerErrorCodes.FORM_PURPOSE} />, "wide");
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
    updateField,
    purposeOption,
    formPurpose,
  ]);

  // Update local state
  const updateDeliveryOption = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setDeliveryOptionValue(value as DeliveryOption);
  }, []);

  // Update local state
  const updatePurposeOption = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setPurposeOption(value as PurposeOption);
  }, []);

  const responsesLink = `/${i18n.language}/form-builder/${id}/responses`;

  // Update local state
  const handleUpdateClassification = useCallback((value: ClassificationType) => {
    if (value === "Protected B") {
      setDeliveryOptionValue(DeliveryOption.vault);
    }
    setClassification(value);
  }, []);

  return (
    <>
      <p className="mb-10 inline-block bg-purple-200 p-3 text-sm font-bold">
        {t("settingsResponseDelivery.beforePublishMessage")}
      </p>
      {status === "authenticated" && (
        <div className="mb-10">
          <div className="mb-10">
            <h2 className="mb-6">{t("settingsResponseDelivery.selectClassification")}</h2>
            <div className="mb-10">
              <ClassificationSelect
                className="max-w-[400px] truncate bg-gray-soft p-1 pr-10"
                lang={lang}
                isPublished={isPublished}
                classification={classification}
                disabled={hasApiKey}
                handleUpdateClassification={handleUpdateClassification}
              />
            </div>

            <div className="mb-10">
              <h2 className="mb-6">{t("settingsResponseDelivery.title")}</h2>
              {protectedBSelected ? (
                <p className="mb-5 inline-block bg-purple-200 p-3 text-sm font-bold">
                  {t("settingsResponseDelivery.protectedBMessage")}
                </p>
              ) : null}
              <Radio
                disabled={isPublished || hasApiKey}
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
                disabled={isPublished || protectedBSelected || hasApiKey}
                id={`delivery-option-${DeliveryOption.email}`}
                checked={deliveryOptionValue === DeliveryOption.email}
                name="response-delivery"
                value={DeliveryOption.email}
                label={emailLabel}
                onChange={updateDeliveryOption}
              />

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
              {deliveryOptionValue !== DeliveryOption.email && <div className="mb-8"></div>}

              {apiAccess && (
                <Radio
                  disabled={isPublished || hasApiKey || protectedBSelected}
                  id={`delivery-option-${DeliveryOption.api}`}
                  checked={deliveryOptionValue === DeliveryOption.api}
                  name="response-delivery"
                  value={DeliveryOption.api}
                  label={apiLabel}
                  onChange={updateDeliveryOption}
                />
              )}

              {apiAccess && deliveryOptionValue === DeliveryOption.api && (
                <div>
                  <div className="mb-10 ml-4 border-l-4 pl-8">
                    <span className="block py-6 font-bold">
                      {t("formSettingsModal.apiOption.startNote")}
                    </span>
                  </div>
                  <div className="flex">
                    <ApiKeyButton showDelete keyId={keyId} />{" "}
                    <div className="mt-2">
                      <ResponseDeliveryHelpButtonWithApi />
                    </div>
                  </div>
                  <ApiDocNotes />
                </div>
              )}
              {deliveryOptionValue !== DeliveryOption.api && !hasApiKey && (
                <>
                  <Button
                    disabled={!isValid || isPublished}
                    theme="secondary"
                    onClick={saveDeliveryOptions}
                  >
                    {t("settingsResponseDelivery.saveButton")}
                  </Button>
                  {apiAccess ? (
                    <ResponseDeliveryHelpButtonWithApi />
                  ) : (
                    <ResponseDeliveryHelpButton />
                  )}
                </>
              )}
            </div>

            <div className="mb-10">
              <h2>{t("settingsPurposeAndUse.title")}</h2>
              <p className="mb-2">
                <strong>{t("settingsPurposeAndUse.helpUs")}</strong>
              </p>
              <p className="mb-6 text-sm">{t("settingsPurposeAndUse.description")}</p>
              <Radio
                id="purposeAndUseAdmin"
                name="purpose-use"
                label={t("settingsPurposeAndUse.personalInfo")}
                disabled={isPublished}
                checked={purposeOption === PurposeOption.admin}
                value={PurposeOption.admin}
                onChange={updatePurposeOption}
              />
              <div className="mb-4 ml-12 text-sm">
                <div>
                  <Markdown options={{ forceBlock: true }}>
                    {t("settingsPurposeAndUse.personalInfoDetails")}
                  </Markdown>
                </div>
                <ul>
                  <li>{t("settingsPurposeAndUse.personalInfoDetailsVals.1")}</li>
                  <li>{t("settingsPurposeAndUse.personalInfoDetailsVals.2")}</li>
                  <li>{t("settingsPurposeAndUse.personalInfoDetailsVals.3")}</li>
                </ul>
              </div>
              <Radio
                id="purposeAndUseNonAdmin"
                name="purpose-use"
                label={t("settingsPurposeAndUse.nonAdminInfo")}
                disabled={isPublished}
                checked={purposeOption === PurposeOption.nonAdmin}
                value={PurposeOption.nonAdmin}
                onChange={updatePurposeOption}
              />
              <div className="mb-4 ml-12 text-sm">
                <div>
                  <Markdown options={{ forceBlock: true }}>
                    {t("settingsPurposeAndUse.nonAdminInfoDetails")}
                  </Markdown>
                </div>
                <ul>
                  <li>{t("settingsPurposeAndUse.nonAdminInfoDetailsVals.1")}</li>
                  <li>{t("settingsPurposeAndUse.nonAdminInfoDetailsVals.2")}</li>
                  <li>{t("settingsPurposeAndUse.nonAdminInfoDetailsVals.3")}</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            disabled={!isValid || isPublished}
            theme="secondary"
            onClick={saveDeliveryOptions}
          >
            {t("settingsResponseDelivery.saveButton")}
          </Button>
          <FormPurposeHelpButton />
        </div>
      )}
    </>
  );
};
