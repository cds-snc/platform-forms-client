"use client";
import React, { useCallback, useState, useMemo, useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { useSession } from "next-auth/react";
import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useDialogRef, Dialog, Radio } from "@formBuilder/components/shared";
import { Logos, options } from "../../../settings/branding/components";
import Brand from "@clientComponents/globals/Brand";
import {
  LocalizedFormProperties,
  FormServerError,
  FormServerErrorCodes,
} from "@lib/types/form-builder-types";
import { ResponseEmail } from "@formBuilder/components/ResponseEmail";
import { isValidGovEmail } from "@lib/validation/validation";
import { completeEmailAddressRegex } from "@lib/utils/form-builder";
import {
  ClassificationSelect,
  ClassificationType,
} from "@formBuilder/components/ClassificationSelect";
import {
  sendResponsesToVault,
  updateTemplate,
  updateTemplateDeliveryOption,
} from "@formBuilder/actions";

import { toast } from "@formBuilder/components/shared/Toast";
import { ErrorSaving } from "@formBuilder/components/shared/ErrorSaving";
import { useTemplateContext } from "@lib/hooks/form-builder/useTemplateContext";
import { safeJSONParse } from "@lib/utils";
import { FormProperties } from "@lib/types";

enum DeliveryOption {
  vault = "vault",
  email = "email",
}

type BrandOption = (typeof options)[number];

const getBrand = (type: string, options: BrandOption[]): BrandOption => {
  return options.filter((o: BrandOption) => o.name === type)[0];
};

export const SettingsDialog = ({
  handleClose,
}: {
  formId: string;
  handleClose: () => void;
  isPublished?: boolean;
}) => {
  const dialog = useDialogRef();
  const { t, i18n } = useTranslation("form-builder");
  const { status, data } = useSession();

  const { createOrUpdateTemplate } = useTemplateContext();

  /*--------------------------------------------*
   * Current store values
   *--------------------------------------------*/
  const {
    id,
    getId,
    setId,
    email,
    subjectEn: initialSubjectEn,
    subjectFr: initialSubjectFr,
    defaultSubjectEn,
    defaultSubjectFr,
    resetDeliveryOption,
    getSchema,
    getDeliveryOption,
    securityAttribute,
    updateSecurityAttribute,
    isPublished,
    brandName: initialBrandName,
    unsetField,
    updateField,
  } = useTemplateStore((s) => ({
    id: s.id,
    getId: s.getId,
    setId: s.setId,
    email: s.deliveryOption?.emailAddress,
    subjectEn: s.deliveryOption?.emailSubjectEn,
    subjectFr: s.deliveryOption?.emailSubjectFr,
    defaultSubjectEn: s.form[s.localizeField(LocalizedFormProperties.TITLE, "en")] + " - Response",
    defaultSubjectFr: s.form[s.localizeField(LocalizedFormProperties.TITLE, "fr")] + " - Réponse",
    resetDeliveryOption: s.resetDeliveryOption,
    getSchema: s.getSchema,
    getDeliveryOption: s.getDeliveryOption,
    securityAttribute: s.securityAttribute,
    updateSecurityAttribute: s.updateSecurityAttribute,
    isPublished: s.isPublished,
    brand: s.form?.brand,
    brandName: s.form?.brand?.name || "",
    unsetField: s.unsetField,
    updateField: s.updateField,
  }));

  const responsesLink = `/${i18n.language}/form-builder/${id}/responses/new`;

  /*--------------------------------------------*
   * Classification state and handlers
   *--------------------------------------------*/
  const [classificationValue, setClassificationValue] = useState<ClassificationType>(
    securityAttribute ? (securityAttribute as ClassificationType) : "Protected A"
  );

  const protectedBSelected = classificationValue === "Protected B";

  // Update local state
  const handleUpdateClassification = useCallback((value: ClassificationType) => {
    if (value === "Protected B") {
      setDeliveryOptionValue(DeliveryOption.vault);
    }
    setClassificationValue(value);
  }, []);

  /*--------------------------------------------*
   * Branding options state and handlers
   *--------------------------------------------*/
  const lang = i18n.language === "en" ? "en" : "fr";
  const logoTitle = lang === "en" ? "logoTitleEn" : "logoTitleFr";

  let brandingOptions = options.map((option) => ({
    value: option.name,
    label: option[logoTitle],
  }));

  brandingOptions = brandingOptions.sort((a, b) => a.label.localeCompare(b.label));

  brandingOptions.unshift({
    value: "",
    label: `${t("branding.defaultOption")} ${t("branding.default")}`,
  });

  const [brandName, setBrandName] = useState<string>(
    initialBrandName ? initialBrandName : brandingOptions[0].value
  );

  const brand = useMemo(() => {
    return getBrand(brandName, options);
  }, [brandName]);

  useEffect(() => {
    // Auto save the template when the settings dialog
    // is opened if no id exists
    const autoSave = async () => {
      if (!createOrUpdateTemplate) {
        return;
      }

      const id = getId();
      if (id) {
        return;
      }

      const formConfig = safeJSONParse(getSchema()) as FormProperties;
      if (!formConfig) {
        toast.error(<ErrorSaving />, "wide");
        return;
      }

      const { formRecord: template } = await createOrUpdateTemplate({ id, formConfig });
      template && setId(template.id);
    };
    autoSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*--------------------------------------------*
   * Delivery options state and handlers
   *--------------------------------------------*/
  const [isInvalidEmailError, setIsInvalidEmailError] = useState(false);
  const userEmail = data?.user.email ?? "";
  const initialDeliveryOption = !email ? DeliveryOption.vault : DeliveryOption.email;

  const emailLabel = protectedBSelected ? (
    <>
      <span className="block">{t("formSettingsModal.emailOption.label")}</span>
      <span className="block">{t("formSettingsModal.emailOption.note")}</span>
    </>
  ) : (
    t("formSettingsModal.emailOption.label")
  );

  const [deliveryOptionValue, setDeliveryOptionValue] = useState(initialDeliveryOption);
  const [inputEmailValue, setInputEmailValue] = useState(email ? email : userEmail);
  const [subjectEn, setSubjectEn] = useState(
    initialSubjectEn ? initialSubjectEn : defaultSubjectEn
  );
  const [subjectFr, setSubjectFr] = useState(
    initialSubjectFr ? initialSubjectFr : defaultSubjectFr
  );

  // Update local state
  const updateDeliveryOption = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setDeliveryOptionValue(value as DeliveryOption);
  }, []);

  /*--------------------------------------------*
   * Form Validation
   *--------------------------------------------*/
  const isValid = useMemo(() => {
    if (classificationValue !== securityAttribute) {
      return true;
    }

    const isValidDeliveryOption =
      !isInvalidEmailError && inputEmailValue !== "" && subjectEn !== "" && subjectFr !== "";
    const emailDeliveryOptionsChanged =
      inputEmailValue !== email || subjectEn !== initialSubjectEn || subjectFr !== initialSubjectFr;

    if (deliveryOptionValue === DeliveryOption.email) {
      if (!completeEmailAddressRegex.test(inputEmailValue)) {
        return false;
      }
      return isValidDeliveryOption && emailDeliveryOptionsChanged;
    }

    if (brandName !== initialBrandName) {
      return true;
    }

    if (deliveryOptionValue === initialDeliveryOption) {
      return false;
    }

    return true;
  }, [
    classificationValue,
    securityAttribute,
    isInvalidEmailError,
    inputEmailValue,
    subjectEn,
    subjectFr,
    email,
    initialSubjectEn,
    initialSubjectFr,
    deliveryOptionValue,
    brandName,
    initialBrandName,
    initialDeliveryOption,
  ]);

  /*--------------------------------------------*
   * Set as Email Delivery
   *--------------------------------------------*/
  const setToEmailDelivery = useCallback(async () => {
    if (!isValidGovEmail(inputEmailValue)) return false;

    // Call to server action
    const result = await updateTemplateDeliveryOption({
      id,
      deliveryOption: getDeliveryOption(),
    });

    if (!result.error) {
      // Update the template store with the new email delivery settings
      updateSecurityAttribute(classificationValue);
      updateField("deliveryOption.emailAddress", inputEmailValue);
      updateField("deliveryOption.emailSubjectEn", subjectEn);
      updateField("deliveryOption.emailSubjectFr", subjectFr);
    }

    return result;
  }, [
    inputEmailValue,
    subjectEn,
    subjectFr,
    id,
    getDeliveryOption,
    updateField,
    classificationValue,
    updateSecurityAttribute,
  ]);

  /*--------------------------------------------*
   * Set as Database Storage
   *--------------------------------------------*/
  const setToDatabaseDelivery = useCallback(async () => {
    const result = await sendResponsesToVault({
      id: id,
    });

    if (!result.error) {
      // Reset local state
      setInputEmailValue("");

      // Update the template store with the new vault delivery settings
      resetDeliveryOption();
      updateSecurityAttribute(classificationValue);
    }

    return result;
  }, [id, resetDeliveryOption, setInputEmailValue, classificationValue, updateSecurityAttribute]);

  /*--------------------------------------------*
   * Save Settings
   *--------------------------------------------*/

  const saveSettings = useCallback(async () => {
    let result;
    if (email !== "" && deliveryOptionValue === DeliveryOption.vault) {
      // Call local callBack which will call the server action
      result = (await setToDatabaseDelivery()) as FormServerError;
    } else {
      // Call local callBack which will call the server action
      result = (await setToEmailDelivery()) as FormServerError;
    }

    if (result?.error) {
      // Close the dialog and show an error saving toast
      // The dialog is closed first to prevent the obscuring the toast message
      handleClose();
      toast.error(<ErrorSaving />, "wide");
      return;
    }

    // Update the template store with the new settings
    if (brandName === "") {
      unsetField("form.brand");
    }

    if (brandName !== initialBrandName) {
      updateField("form.brand", brand);
    }

    updateSecurityAttribute(classificationValue);

    const formConfig = safeJSONParse(getSchema());
    if (formConfig.error) {
      handleClose();
      toast.error(<ErrorSaving errorCode={FormServerErrorCodes.JSON_PARSE} />, "wide");
      return;
    }
    updateTemplate({
      id,
      formConfig,
      securityAttribute: classificationValue,
      deliveryOption: getDeliveryOption(),
    });

    handleClose();
  }, [
    brand,
    brandName,
    classificationValue,
    deliveryOptionValue,
    email,
    getDeliveryOption,
    getSchema,
    id,
    initialBrandName,
    setToDatabaseDelivery,
    setToEmailDelivery,
    unsetField,
    updateField,
    updateSecurityAttribute,
    handleClose,
  ]);

  const actions = (
    <>
      <Button
        theme="secondary"
        onClick={() => {
          dialog.current?.close();
          handleClose();
        }}
      >
        {t("formSettingsModal.cancel")}
      </Button>
      <Button
        className="ml-5"
        theme="primary"
        disabled={!isValid || isPublished}
        onClick={() => {
          saveSettings();
        }}
      >
        {t("formSettingsModal.okay")}
      </Button>
    </>
  );

  return (
    <Dialog
      handleClose={handleClose}
      dialogRef={dialog}
      actions={actions}
      title={t("formSettingsModal.title")}
    >
      <div>
        {protectedBSelected && (
          <div className="inline-block w-full bg-purple-200 p-3">
            <span className="block">
              <strong>{t("formSettingsModal.vaultNote.text1")}</strong>
            </span>
            <span>{t("formSettingsModal.vaultNote.text2")}</span>
          </div>
        )}
        {isValid && (
          <div className="mb-5 bg-amber-100 p-3">
            <span className="block">
              <strong>{t("formSettingsModal.saveNote.text1")}</strong>
            </span>
            <span>{t("formSettingsModal.saveNote.text2")}</span>
          </div>
        )}
        <div className="p-5">
          {status === "authenticated" && (
            <div className="mb-10">
              <div className="mb-9">
                <h3 className="mb-4">{t("formSettingsModal.classification")}</h3>
                <ClassificationSelect
                  className="max-w-[400px] truncate border-none p-1 pr-10"
                  lang={lang}
                  isPublished={isPublished}
                  classification={classificationValue}
                  handleUpdateClassification={handleUpdateClassification}
                />
              </div>
              <div className="mb-9">
                <h3 className="mb-4">{t("formSettingsModal.branding")}</h3>
                <Logos
                  className="mb-4 max-w-[350px] truncate p-1 pr-10"
                  disabled={isPublished as boolean}
                  options={brandingOptions.map(({ value, label }) => ({ value, label }))}
                  selected={brandName}
                  handleUpdate={setBrandName}
                  aria-label={t("brandingSelect.label")}
                />
                {/* Logo preview */}
                <div>
                  <div className="mb-3 text-sm font-bold">{t("branding.preview")}</div>
                  {/* eslint-disable @next/next/no-img-element  */}
                  <Brand brand={brand} />
                </div>
              </div>
              <h3 className="mb-4">{t("settingsResponseDelivery.title")}</h3>
              <div>
                <Radio
                  disabled={isPublished}
                  id={`delivery - option - ${DeliveryOption.vault} `}
                  checked={deliveryOptionValue === DeliveryOption.vault}
                  name="response-delivery"
                  value={DeliveryOption.vault}
                  label={t("settingsResponseDelivery.vaultOption")}
                  onChange={updateDeliveryOption}
                >
                  <span className="mb-1 ml-3 block text-sm">
                    {t("settingsResponseDelivery.vaultOptionHint.text1")}{" "}
                    <a href={responsesLink}>
                      {t("settingsResponseDelivery.vaultOptionHint.text2")}
                    </a>
                    .
                  </span>
                </Radio>
                <Radio
                  disabled={isPublished || protectedBSelected}
                  id={`delivery - option - ${DeliveryOption.email} `}
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
                  subjectEn={subjectEn}
                  setSubjectEn={setSubjectEn}
                  subjectFr={subjectFr}
                  setSubjectFr={setSubjectFr}
                  isInvalidEmailError={isInvalidEmailError}
                  setIsInvalidEmailError={setIsInvalidEmailError}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export const SettingsModal = ({
  show,
  id,
  isPublished,
  handleClose,
}: {
  show: string | boolean | string[] | undefined;
  id: string;
  isPublished: boolean;
  handleClose: (arg: boolean) => void;
}) => {
  return (
    <>
      {show && (
        <SettingsDialog
          formId={id}
          handleClose={() => handleClose(false)}
          isPublished={isPublished}
        />
      )}
    </>
  );
};
