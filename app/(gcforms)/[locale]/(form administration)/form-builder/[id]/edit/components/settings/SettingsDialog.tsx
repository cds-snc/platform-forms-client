"use client";
import React, { useCallback, useState, useMemo } from "react";
import { useTranslation } from "@i18n/client";
import { useSession } from "next-auth/react";
import axios from "axios";

import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store";
import {
  useDialogRef,
  Dialog,
  Radio,
} from "app/(gcforms)/[locale]/(form administration)/form-builder/components/shared";
import { Logos, options } from "../../../settings/branding/components";
import Brand from "@clientComponents/globals/Brand";
import {
  ClassificationType,
  ClassificationSelect,
} from "app/(gcforms)/[locale]/(form administration)/form-builder/components/ClassificationSelect";
import { LocalizedFormProperties } from "@lib/types/form-builder-types";
import { ResponseEmail } from "app/(gcforms)/[locale]/(form administration)/form-builder/components/ResponseEmail";
import { isValidGovEmail } from "@lib/validation";
import { useTemplateApi } from "@lib/hooks";
import { completeEmailAddressRegex } from "@clientComponents/form-builder/util";

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
  const { save, updateResponseDelivery } = useTemplateApi();

  /*--------------------------------------------*
   * Current store values
   *--------------------------------------------*/
  const {
    id,
    email,
    subjectEn: initialSubjectEn,
    subjectFr: initialSubjectFr,
    defaultSubjectEn,
    defaultSubjectFr,
    resetDeliveryOption,
    getSchema,
    getName,
    getDeliveryOption,
    securityAttribute,
    updateSecurityAttribute,
    isPublished,
    brandName: initialBrandName,
    unsetField,
    updateField,
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
    securityAttribute: s.securityAttribute,
    updateSecurityAttribute: s.updateSecurityAttribute,
    isPublished: s.isPublished,
    brand: s.form?.brand,
    brandName: s.form?.brand?.name || "",
    unsetField: s.unsetField,
    updateField: s.updateField,
  }));

  const responsesLink = `/${i18n.language}/form-builder/responses/${id}`;

  /*--------------------------------------------*
   * Classification state and handlers
   *--------------------------------------------*/
  const [classification, setClassification] = useState<ClassificationType>(
    securityAttribute ? (securityAttribute as ClassificationType) : "Protected A"
  );

  const protectedBSelected = classification === "Protected B";

  const handleUpdateClassification = useCallback((value: ClassificationType) => {
    if (value === "Protected B") {
      setDeliveryOption(DeliveryOption.vault);
    }
    setClassification(value);
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

  const [deliveryOption, setDeliveryOption] = useState(initialDeliveryOption);
  const [inputEmail, setInputEmail] = useState(email ? email : userEmail);
  const [subjectEn, setSubjectEn] = useState(
    initialSubjectEn ? initialSubjectEn : defaultSubjectEn
  );
  const [subjectFr, setSubjectFr] = useState(
    initialSubjectFr ? initialSubjectFr : defaultSubjectFr
  );

  const updateDeliveryOption = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setDeliveryOption(value as DeliveryOption);
  }, []);

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

    if (brandName !== initialBrandName) {
      return true;
    }

    if (deliveryOption === initialDeliveryOption) {
      return false;
    }

    return true;
  }, [
    classification,
    securityAttribute,
    isInvalidEmailError,
    inputEmail,
    subjectEn,
    subjectFr,
    email,
    initialSubjectEn,
    initialSubjectFr,
    deliveryOption,
    brandName,
    initialBrandName,
    initialDeliveryOption,
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
   * Save Settings
   *--------------------------------------------*/

  const saveSettings = useCallback(async () => {
    let result;

    if (brandName === "") {
      unsetField("form.brand");
    }

    if (brandName !== initialBrandName) {
      updateField("form.brand", brand);
    }

    updateSecurityAttribute(classification);

    if (email !== "" && deliveryOption === DeliveryOption.vault) {
      result = await setToDatabaseDelivery();
    } else {
      result = await setToEmailDelivery();
    }

    if (!result || axios.isAxiosError(result)) {
      return false;
    }
  }, [
    brand,
    brandName,
    classification,
    deliveryOption,
    email,
    initialBrandName,
    setToDatabaseDelivery,
    setToEmailDelivery,
    unsetField,
    updateField,
    updateSecurityAttribute,
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
          dialog.current?.close();
          handleClose();
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
                  classification={classification}
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
                  checked={deliveryOption === DeliveryOption.vault}
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
