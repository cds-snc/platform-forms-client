import React, { useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import axios from "axios";

import { Logos, options } from "./";
import { useTemplateStore } from "../../store";
import { LoggedOutTabName, LoggedOutTab } from "../LoggedOutTab";
import { useTemplateApi } from "../../hooks";
import { toast } from "../shared";
import { Button } from "@components/globals";
import Brand from "@components/globals/Brand";

const Label = ({ htmlFor, children }: { htmlFor: string; children?: JSX.Element | string }) => {
  return (
    <label className="mb-1 block text-sm font-bold" htmlFor={htmlFor}>
      {children}
    </label>
  );
};

export const Branding = ({ hasBrandingRequestForm }: { hasBrandingRequestForm: boolean }) => {
  const { t, i18n } = useTranslation("form-builder");
  const { status } = useSession();
  const { save } = useTemplateApi();
  const { id, isPublished, brandName, updateField, unsetField, getSchema, getName, brand } =
    useTemplateStore((s) => ({
      id: s.id,
      brandName: s.form?.brand?.name || "",
      unsetField: s.unsetField,
      updateField: s.updateField,
      getSchema: s.getSchema,
      getName: s.getName,
      isPublished: s.isPublished,
      brand: s.form.brand,
    }));

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

  const savedSuccessMessage = t("settingsResponseDelivery.savedSuccessMessage");
  const savedErrorMessage = t("settingsResponseDelivery.savedErrorMessage");

  const handleSave = useCallback(async () => {
    const result = await save({
      jsonConfig: getSchema(),
      name: getName(),
      formID: id,
    });

    if (!result || axios.isAxiosError(result)) {
      toast.error(savedErrorMessage);
      return;
    }

    toast.success(savedSuccessMessage);
  }, [id, save, getSchema, getName, savedSuccessMessage, savedErrorMessage]);

  const lang = i18n.language;
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

  if (status !== "authenticated") {
    return <LoggedOutTab tabName={LoggedOutTabName.SETTINGS} />;
  }

  return (
    <div>
      <h2 className="mb-6">{t("branding.heading")}</h2>
      <p className="block text-sm">{t("branding.text1")}</p>
      {/* Logo select */}
      <div>
        <Label htmlFor="branding-select">{t("branding.select")}</Label>
        <Logos
          className="mb-5 mt-2 max-w-[450px] truncate bg-gray-soft p-1 pr-10"
          disabled={isPublished as boolean}
          options={brandingOptions.map(({ value, label }) => ({ value, label }))}
          selected={brandName}
          handleUpdate={updateBrand}
        />
      </div>
      {/* Logo preview */}
      <div className="my-5">
        <div className="mb-3 text-sm font-bold">{t("branding.preview")}</div>
        {/* eslint-disable @next/next/no-img-element  */}
        <Brand brand={brand} />
      </div>
      <div className="mt-10">
        <Button disabled={isPublished as boolean} theme="secondary" onClick={handleSave}>
          {t("settingsResponseDelivery.saveButton")}
        </Button>
      </div>

      {hasBrandingRequestForm && (
        <div>
          <p className="mb-5 mt-6 text-sm">{t("branding.notFound")}</p>
          <p className="mb-5 text-sm">{t("branding.submitNew")}</p>
        </div>
      )}
    </div>
  );
};
