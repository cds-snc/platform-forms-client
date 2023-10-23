import React, { useState, useCallback } from "react";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";

import { ClassificationType, ClassificationSelect } from "../ClassificationSelect";
import { Logos, options } from "../branding";
import { useTemplateStore } from "../../store";
import { useTemplateApi } from "../../hooks";
import { SettingsModal } from "./SettingsDialog";
import { Tooltip } from "../shared/Tooltip";

enum DeliveryOption {
  vault = "vault",
  email = "email",
}

export const Panel = () => {
  const { t, i18n } = useTranslation("form-builder");
  const lang = i18n.language === "en" ? "en" : "fr";
  const { save } = useTemplateApi();
  const { status } = useSession();

  const {
    id,
    getSchema,
    getName,
    getDeliveryOption,
    email,
    securityAttribute,
    updateSecurityAttribute,
    isPublished,
    brandName,
    unsetField,
    updateField,
  } = useTemplateStore((s) => ({
    id: s.id,
    getSchema: s.getSchema,
    getName: s.getName,
    getDeliveryOption: s.getDeliveryOption,
    email: s.deliveryOption?.emailAddress,
    updateSecurityAttribute: s.updateSecurityAttribute,
    securityAttribute: s.securityAttribute,
    isPublished: s.isPublished,
    brandName: s.form?.brand?.name || "",
    unsetField: s.unsetField,
    updateField: s.updateField,
  }));

  const initialDeliveryOption = !email ? DeliveryOption.vault : DeliveryOption.email;

  const [, setDeliveryOption] = useState(initialDeliveryOption);

  const [classification, setClassification] = useState<ClassificationType>(
    securityAttribute ? (securityAttribute as ClassificationType) : "Protected A"
  );

  const handleUpdateClassification = useCallback(
    (value: ClassificationType) => {
      if (value === "Protected B") {
        setDeliveryOption(DeliveryOption.vault);
      }
      setClassification(value);
      updateSecurityAttribute(value);

      save({
        jsonConfig: getSchema(),
        name: getName(),
        formID: id,
        deliveryOption: getDeliveryOption(),
        securityAttribute: value,
      });
    },
    [updateSecurityAttribute, getDeliveryOption, getSchema, getName, id, save]
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
    (type: string) => {
      if (type === "") {
        unsetField("form.brand");
        return;
      }

      if (type !== brandName) {
        updateField("form.brand", options.filter((o) => o.name === type)[0]);
      }
    },
    [brandName, updateField, unsetField]
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
          <Tooltip text={t("formSettingsModal.more")}>
            <button
              onClick={() => {
                setShowShowSettings(true);
              }}
              className="flex h-full rounded-r-md bg-indigo-500 p-1 pt-2 text-white"
            >
              {"..."}
            </button>
          </Tooltip>
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
