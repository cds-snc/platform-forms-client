import React, { useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import axios from "axios";

import { Logos, options } from ".";
import { useTemplateStore } from "../../store";
import { LoggedOutTabName, LoggedOutTab } from "../LoggedOutTab";
import { useTemplateApi } from "../../hooks";
import { toast } from "../shared";
import { Button } from "@appComponents/globals";
import Brand from "@appComponents/globals/Brand";

const Label = ({ htmlFor, children }: { htmlFor: string; children?: JSX.Element | string }) => {
  return (
    <label className="block font-bold mb-1 text-sm" htmlFor={htmlFor}>
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

  const brandingOptions = options.map((option) => ({
    value: option.name,
    label: option[logoTitle],
  }));

  brandingOptions.unshift({
    value: "",
    label: `${t("branding.defaultOption")} ${t("branding.default")}`,
  });

  if (status !== "authenticated") {
    return <LoggedOutTab tabName={LoggedOutTabName.SETTINGS} />;
  }

  return (
    <div>
      <h1 className="visually-hidden">{t("branding.heading")}</h1>
      <div className="block mb-4 text-xl font-bold">{t("branding.heading")}</div>
      <p className="block text-md">{t("branding.text1")}</p>
      <p className="inline-block mt-5 mb-5 p-3 bg-purple-200 font-bold text-sm">
        {t("settingsResponseDelivery.beforePublishMessage")}
      </p>

      {/* Logo select */}
      <div>
        <Label htmlFor="branding-select">{t("branding.select")}</Label>
        <Logos
          disabled={isPublished as boolean}
          options={brandingOptions.map(({ value, label }) => ({ value, label }))}
          selected={brandName}
          handleUpdate={updateBrand}
        />
      </div>
      {/* Logo preview */}
      <div className="mt-5 mb-5">
        <div className="font-bold mb-3 text-md">{t("branding.preview")}</div>
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
          <p className="text-md mb-5 mt-6">{t("branding.notFound")}</p>
          <p className="text-md mb-5">
            <Link
              href="/form-builder/settings/branding-request"
              passHref
              rel="noopener noreferrer"
              target={"_blank"}
            >
              {/* Href is passed down to child.  This behavior is fixed in NextJS 13 */}
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a target="_blank" rel="noopener noreferrer">
                {t("branding.submitNew")}
              </a>
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};
