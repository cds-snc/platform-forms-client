"use client";
import React, { useCallback, type JSX } from "react";
import { useTranslation } from "@i18n/client";
import Link from "next/link";

import { cn } from "@lib/utils";
import { BrandingSelect } from "./BrandingSelect";
import { options } from "./options";

import { useTemplateStore } from "@lib/store/useTemplateStore";
import { toast } from "@formBuilder/components/shared/Toast";
import Brand from "@clientComponents/globals/Brand";
import { ExternalLinkIcon } from "@serverComponents/icons";
import { updateTemplate } from "@formBuilder/actions";
import { FormServerErrorCodes } from "@lib/types/form-builder-types";
import { safeJSONParse } from "@lib/utils";
import { ErrorSaving } from "@formBuilder/components/shared/ErrorSaving";
import { FormProperties } from "@lib/types";

const Label = ({ htmlFor, children }: { htmlFor: string; children?: JSX.Element | string }) => {
  return (
    <label className="mb-1 block text-sm font-bold" htmlFor={htmlFor}>
      {children}
    </label>
  );
};

export const Branding = ({ hasBrandingRequestForm }: { hasBrandingRequestForm: boolean }) => {
  const { t, i18n } = useTranslation(["form-builder", "common"]);
  const { id, isPublished, brandName, updateField, unsetField, getSchema, brand } =
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

  const savedSuccessMessage = t("settingsResponseDelivery.savedSuccessMessage");
  const savedErrorMessage = t("settingsResponseDelivery.savedErrorMessage");

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

  const handleSave = useCallback(async () => {
    const formConfig = safeJSONParse<FormProperties>(getSchema());
    if (!formConfig) {
      toast.error(<ErrorSaving errorCode={FormServerErrorCodes.JSON_PARSE} />, "wide");
      return;
    }

    const operationResult = await updateTemplate({
      id,
      formConfig,
    });

    if (operationResult.formRecord !== null) {
      toast.success(savedSuccessMessage);
      return;
    }

    toast.error(
      <ErrorSaving errorCode={FormServerErrorCodes.BRANDING} message={savedErrorMessage} />,
      "wide"
    );
  }, [id, getSchema, savedSuccessMessage, savedErrorMessage]);

  const updateBrand = useCallback(
    (type: string) => {
      if (type === "") {
        unsetField("form.brand");
        return;
      }

      const selectedBrand = options.find((o) => o.name === type);

      if (type !== brandName && selectedBrand) {
        updateField("form.brand", selectedBrand);

        handleSave();
      }
    },
    [brandName, updateField, unsetField, handleSave]
  );

  return (
    <>
      <h2>{t("branding.heading")}</h2>
      <p className="block text-sm">{t("branding.text1")}</p>
      {/* Logo select */}
      <div>
        <Label htmlFor="branding-select">{t("branding.select")}</Label>
        <BrandingSelect
          className="mb-5 mt-2 max-w-[450px] truncate bg-gray-soft p-1 pr-10"
          disabled={isPublished as boolean}
          options={brandingOptions.map(({ value, label }) => ({ value, label }))}
          selected={brandName}
          handleUpdate={updateBrand}
        />
      </div>
      {/* Logo preview */}
      <div className={cn(hasBrandingRequestForm ? "mb-10" : "")}>
        <div className="mb-3 text-sm font-bold">{t("branding.preview")}</div>
        <Brand brand={brand} />
      </div>
      {hasBrandingRequestForm && (
        <div>
          <p className="mb-2 text-sm font-bold">{t("branding.notFound")}</p>
          <p className="text-sm">
            <Link
              href={`https://forms-formulaires.alpha.canada.ca/${
                i18n.language === "fr"
                  ? "fr/id/cm6f4sci50083vt68djorvzjg/"
                  : "en/id/cm6f4sci50083vt68djorvzjg/"
              }`}
              passHref
              rel="noopener noreferrer"
              target={"_blank"}
            >
              {t("branding.submitNew")}
              <ExternalLinkIcon className="ml-1 inline-block" title={`(${t("opensInNewTab")})`} />
            </Link>
            .
          </p>
        </div>
      )}
    </>
  );
};
