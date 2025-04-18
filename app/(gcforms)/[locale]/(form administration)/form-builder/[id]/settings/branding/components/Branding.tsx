"use client";
import React, { useCallback, type JSX } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "@i18n/client";
import Link from "next/link";
import { Logos, options } from ".";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { LoggedOutTabName, LoggedOutTab } from "@formBuilder/components/LoggedOutTab";
import { toast } from "@formBuilder/components/shared/Toast";
import { Button } from "@clientComponents/globals";
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
  const { status } = useSession();
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
    const formConfig = safeJSONParse<FormProperties>(getSchema());
    if (!formConfig) {
      toast.error(<ErrorSaving errorCode={FormServerErrorCodes.JSON_PARSE} />, "wide");
      return;
    }

    const operationResult = await updateTemplate({
      id,
      formConfig,
      name: getName(),
    });

    if (operationResult.formRecord !== null) {
      toast.success(savedSuccessMessage);
      return;
    }

    toast.error(
      <ErrorSaving errorCode={FormServerErrorCodes.BRANDING} message={savedErrorMessage} />,
      "wide"
    );
  }, [id, getSchema, getName, savedSuccessMessage, savedErrorMessage]);

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
        <Brand brand={brand} />
      </div>
      <div className="mt-10">
        <Button disabled={isPublished as boolean} theme="secondary" onClick={handleSave}>
          {t("settingsResponseDelivery.saveButton")}
        </Button>
      </div>
      {hasBrandingRequestForm && (
        <div className="mt-10">
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
    </div>
  );
};
