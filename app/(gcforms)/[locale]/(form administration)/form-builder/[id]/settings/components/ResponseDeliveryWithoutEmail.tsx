"use client";
import React, { useCallback, useState, useEffect } from "react";
import {
  LocalizedFormProperties,
  FormServerError,
  FormServerErrorCodes,
} from "@lib/types/form-builder-types";
import { useTranslation } from "@i18n/client";
import { useSession } from "next-auth/react";
import { Radio } from "@formBuilder/components/shared/MultipleChoice";
import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { FormPurposeHelpButton } from "./dialogs/FormPurposeHelpButton";
import { ResponseDeliveryHelpButtonWithApi } from "./dialogs/ResponseDeliveryHelpDialogApiWithApi";
import {
  ClassificationType,
  ClassificationSelect,
} from "@formBuilder/components/ClassificationSelect";
import {
  sendResponsesToVault,
  updateTemplateSecurityAttribute,
  updateTemplateFormPurpose,
} from "@formBuilder/actions";
import { useRefresh } from "@lib/hooks/useRefresh";

import Markdown from "markdown-to-jsx";

import { toast } from "@formBuilder/components/shared/Toast";
import { ErrorSaving } from "@formBuilder/components/shared/ErrorSaving";
import { ApiKeyButton } from "./ApiKeyButton";
import { ApiDocNotes } from "./ApiDocNotes";
import { DeleteKeyToChangeOptionsNote } from "./DeleteKeyToChangeOptionsNote";
import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";

import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";

enum DeliveryOption {
  vault = "vault",
  api = "api",
  email = "email",
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

export const ResponseDeliveryWithoutEmail = () => {
  const { t, i18n } = useTranslation("form-builder");
  const { status } = useSession();
  const { refreshData } = useRefresh();
  const lang = i18n.language === "en" ? "en" : "fr";
  const { apiKeyId } = useFormBuilderConfig();
  const { Event } = useCustomEvent();

  const {
    email,
    id,
    resetDeliveryOption,
    updateField,
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

  const protectedBSelected = classification === "Protected B";
  const emailLabel = protectedBSelected ? (
    <>
      <span className="block">{t("formSettingsModal.emailOption.label")}</span>
      <span className="block">{t("formSettingsModal.emailOption.note")}</span>
    </>
  ) : (
    t("formSettingsModal.emailOption.label")
  );

  // TODO: Once emailDelivery flag is removed, replace the below with ... = DeliveryOption.vault;
  let initialDeliveryOption = !email ? DeliveryOption.vault : DeliveryOption.email;

  const hasApiKey = apiKeyId ? true : false;

  // Check for API key -- if a key is present, set the initial delivery option to API
  if (hasApiKey) {
    initialDeliveryOption = DeliveryOption.api;
  }

  const [deliveryOptionValue, setDeliveryOptionValue] = useState(
    initialDeliveryOption as DeliveryOption
  );
  const [purposeOption, setPurposeOption] = useState(formPurpose as PurposeOption);

  /*--------------------------------------------*
   * Set as Database Storage
   *--------------------------------------------*/
  const setToDatabaseDelivery = useCallback(async () => {
    const result = await sendResponsesToVault({
      id: id,
    });

    if (!result.error) {
      // Update the template store
      resetDeliveryOption();
      updateSecurityAttribute(classification);
    }

    return result;
  }, [id, resetDeliveryOption, classification, updateSecurityAttribute]);

  /*--------------------------------------------*
   * Save Delivery Option
   *--------------------------------------------*/
  const saveDeliveryOptions = useCallback(async () => {
    const resultDelivery = (await setToDatabaseDelivery()) as FormServerError;
    if (resultDelivery?.error) {
      toast.error(<ErrorSaving errorCode={FormServerErrorCodes.DELIVERY_OPTION} />, "wide");
      return;
    }

    const resultAttribute = (await updateTemplateSecurityAttribute({
      id,
      securityAttribute: classification,
    })) as FormServerError;
    if (resultAttribute?.error) {
      toast.error(<ErrorSaving errorCode={FormServerErrorCodes.DELIVERY_OPTION} />, "wide");
      return;
    }

    toast.success(t("settingsResponseDelivery.savedSuccessMessage"));

    refreshData && refreshData();
  }, [t, refreshData, id, classification, setToDatabaseDelivery]);

  /*--------------------------------------------*
   * Save form purpose option
   *--------------------------------------------*/

  const saveFormPurpose = useCallback(async () => {
    const result = await updateTemplateFormPurpose({
      id,
      formPurpose: purposeOption,
    });

    if (result?.error) {
      toast.error(<ErrorSaving errorCode={FormServerErrorCodes.FORM_PURPOSE} />, "wide");
      return;
    }

    // Update the template store
    updateField("formPurpose", purposeOption);

    toast.success(t("settingsResponseDelivery.savedSuccessMessage"));

    refreshData && refreshData();
  }, [t, refreshData, id, purposeOption, updateField]);

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

  const handleDeleteApiKey = useCallback(() => {
    if (deliveryOptionValue === DeliveryOption.vault) {
      return;
    }

    // Set to vault when an API key is deleted
    setDeliveryOptionValue(DeliveryOption.vault);
  }, [deliveryOptionValue]);

  useEffect(() => {
    Event.on(EventKeys.deleteApiKey, handleDeleteApiKey);
    return () => {
      Event.off(EventKeys.deleteApiKey, handleDeleteApiKey);
    };
  }, [Event, handleDeleteApiKey]);

  return (
    <>
      <h1>WITHOUT EMAIL</h1>
      <p className="mb-4 w-3/5 rounded-md bg-indigo-50 p-3 font-bold">
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

              {isPublished && deliveryOptionValue === DeliveryOption.email && (
                <div className="mb-10">
                  <Radio
                    disabled={isPublished}
                    id={`delivery-option-${DeliveryOption.email}`}
                    checked={deliveryOptionValue === DeliveryOption.email}
                    name="response-delivery"
                    value={DeliveryOption.email}
                    label={emailLabel}
                    onChange={updateDeliveryOption}
                    className="mb-0"
                  />
                </div>
              )}

              {/* Vault Option */}
              {!hasApiKey && (
                <>
                  <div className="mb-10">
                    <Radio
                      disabled={isPublished || hasApiKey}
                      id={`delivery-option-${DeliveryOption.vault}`}
                      checked={deliveryOptionValue === DeliveryOption.vault}
                      name="response-delivery"
                      value={DeliveryOption.vault}
                      label={t("settingsResponseDelivery.vaultOption")}
                      onChange={updateDeliveryOption}
                      className="mb-0"
                    >
                      <span className="ml-3 block text-sm">
                        {t("settingsResponseDelivery.vaultOptionHint.text1")}{" "}
                        <a href={responsesLink}>
                          {t("settingsResponseDelivery.vaultOptionHint.text2")}
                        </a>
                        .{t("settingsResponseDelivery.vaultOptionHint.text3")}
                      </span>
                    </Radio>
                  </div>
                  {/* End Vault Option */}

                  {/* API Option */}
                  <div className="mb-10">
                    <div>
                      <Radio
                        disabled={isPublished || protectedBSelected || hasApiKey}
                        id={`delivery-option-${DeliveryOption.api}`}
                        checked={deliveryOptionValue === DeliveryOption.api}
                        name="response-delivery"
                        value={DeliveryOption.api}
                        label={t("formSettingsModal.apiOption.label")}
                        onChange={updateDeliveryOption}
                        className="mb-0"
                      >
                        <span className="ml-3 block text-sm">
                          {t("formSettingsModal.apiOption.note")}
                        </span>
                      </Radio>
                    </div>
                    {/* End API Option */}

                    {/*  API note */}
                    {deliveryOptionValue === DeliveryOption.api && (
                      <div className="mb-10 ml-4 border-l-4 pl-8">
                        <span className="block py-6 font-bold">
                          {t("formSettingsModal.apiOption.startNote")}
                        </span>
                      </div>
                    )}
                    {/*  End API note */}
                  </div>
                </>
              )}

              {deliveryOptionValue === DeliveryOption.api && (
                <div>
                  <DeleteKeyToChangeOptionsNote hasApiKey={hasApiKey} />
                  <ApiKeyButton showDelete />
                  <ApiDocNotes />
                </div>
              )}
              {deliveryOptionValue !== DeliveryOption.api && !hasApiKey && (
                <>
                  <Button
                    // disabled={!isValid || isPublished}
                    disabled={isPublished}
                    theme="secondary"
                    onClick={saveDeliveryOptions}
                  >
                    {t("settingsResponseDelivery.saveButton")}
                  </Button>
                  <ResponseDeliveryHelpButtonWithApi />
                </>
              )}
            </div>

            {/*--------------------------------------------*
             * Purpose option section
             *--------------------------------------------*/}

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
                className="mb-20"
              />
              <div className="mb-4 ml-12 text-sm">
                <div>
                  <Markdown options={{ forceBlock: false }}>
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
                  <Markdown options={{ forceBlock: false }}>
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

          <Button disabled={isPublished} theme="secondary" onClick={saveFormPurpose}>
            {t("settingsPurposeAndUse.saveButton")}
          </Button>
          <FormPurposeHelpButton />
        </div>
      )}
    </>
  );
};
