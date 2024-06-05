"use client";
import React, { useState, useCallback } from "react";
import { useTranslation } from "@i18n/client";
import { useSession } from "next-auth/react";

import {
  ClassificationType,
  ClassificationSelect,
} from "@formBuilder/components/ClassificationSelect";
import { Logos, options } from "../../../settings/branding/components";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { SettingsModal } from "./SettingsDialog";
import { Tooltip } from "@formBuilder/components/shared/Tooltip";
import { updateTemplate, updateTemplateSecurityAttribute } from "@formBuilder/actions";

import { toast } from "@formBuilder/components/shared/Toast";
import { ErrorSaving } from "@formBuilder/components/shared/ErrorSaving";
import { FormServerErrorCodes } from "@lib/types/form-builder-types";
import { safeJSONParse } from "@lib/utils";

enum DeliveryOption {
  vault = "vault",
  email = "email",
}

export const SettingsPanel = () => {
  const { t, i18n } = useTranslation("form-builder");
  const lang = i18n.language === "en" ? "en" : "fr";
  const { status } = useSession();

  const {
    id,
    email,
    securityAttribute,
    updateSecurityAttribute,
    isPublished,
    brandName,
    unsetField,
    updateField,
    getSchema,
  } = useTemplateStore((s) => ({
    id: s.id,
    email: s.deliveryOption?.emailAddress,
    updateSecurityAttribute: s.updateSecurityAttribute,
    securityAttribute: s.securityAttribute,
    isPublished: s.isPublished,
    brandName: s.form?.brand?.name || "",
    unsetField: s.unsetField,
    updateField: s.updateField,
    getSchema: s.getSchema,
  }));

  const initialDeliveryOption = !email ? DeliveryOption.vault : DeliveryOption.email;
  const [, setDeliveryOption] = useState(initialDeliveryOption);

  const classification = securityAttribute
    ? (securityAttribute as ClassificationType)
    : "Protected A";

  const handleUpdateClassification = useCallback(
    async (value: ClassificationType) => {
      if (value === "Protected B") {
        setDeliveryOption(DeliveryOption.vault);
      }

      // Call sever action
      const result = await updateTemplateSecurityAttribute({
        id,
        securityAttribute: value,
      });

      if (!result.error) {
        updateSecurityAttribute(value);
        return;
      }

      toast.error(<ErrorSaving errorCode={FormServerErrorCodes.BRANDING} />, "wide");
    },
    [updateSecurityAttribute, id]
  );

  // Branding options
  const logoTitle = lang === "en" ? "logoTitleEn" : "logoTitleFr";

  let brandingOptions = options.map((option) => ({
    value: option.name,
    label: option[logoTitle],
  }));

  // Sort by label
  brandingOptions = brandingOptions.sort((a, b) => a.label.localeCompare(b.label));

  brandingOptions.unshift({
    value: "",
    label: `${t("branding.defaultOption")} ${t("branding.default")}`,
  });

  const updateBrand = useCallback(
    async (type: string) => {
      const formConfig = safeJSONParse(getSchema());
      if (formConfig.error) {
        toast.error(<ErrorSaving errorCode={FormServerErrorCodes.JSON_PARSE} />, "wide");
        return;
      }

      if (type === "") {
        const result = await updateTemplate({
          id,
          formConfig,
        });

        if (!result.error) {
          unsetField("form.brand");
          return;
        }
      }

      if (type !== brandName) {
        const result = await updateTemplate({
          id,
          formConfig,
        });

        if (!result.error) {
          updateField("form.brand", options.filter((o) => o.name === type)[0]);
          return;
        }

        toast.error(<ErrorSaving errorCode={FormServerErrorCodes.CLASSIFICATION} />, "wide");
      }
    },
    [brandName, unsetField, updateField, id, getSchema]
  );

  // More ...
  const [showSettings, setShowShowSettings] = useState<boolean>(false);

  if (status !== "authenticated") {
    return null;
  }

  return (
    <>
      <div className="mb-4 flex w-[800px] justify-between rounded-lg border-1 border-indigo-500 bg-violet-50">
        <div className="flex w-full justify-between">
          <div className="ml-4 inline-block">
            <div className="my-[6px] border-[.5px] border-violet-50 p-1 px-2 hover:border-[.5px] hover:border-slate-800">
              <ClassificationSelect
                disableProtectedB={email ? true : false}
                className="w-auto max-w-[400px] truncate border-none bg-violet-50 p-1 text-sm"
                lang={lang}
                isPublished={isPublished}
                classification={classification}
                handleUpdateClassification={handleUpdateClassification}
                aria-label={t("classificationSelect.label")}
              />
            </div>
          </div>
          <div className="my-[6px] mr-6 border-[.5px] border-violet-50 p-1 px-2 hover:border-[.5px] hover:border-slate-800 ">
            <Logos
              className="w-auto max-w-[350px] truncate bg-violet-50 p-1 pr-10 text-sm"
              disabled={isPublished as boolean}
              options={brandingOptions.map(({ value, label }) => ({ value, label }))}
              selected={brandName}
              handleUpdate={updateBrand}
              aria-label={t("brandingSelect.label")}
            />
          </div>
        </div>
        <div>
          <Tooltip.Simple text={t("formSettingsModal.more")}>
            <button
              onClick={() => {
                setShowShowSettings(true);
              }}
              className="flex h-full rounded-r-md bg-indigo-500 p-1 pt-2 text-white"
              aria-label={t("more")}
            >
              {"..."}
            </button>
          </Tooltip.Simple>
        </div>
      </div>
      <SettingsModal
        show={showSettings}
        id={id}
        isPublished={isPublished}
        handleClose={setShowShowSettings}
      />
    </>
  );
};
