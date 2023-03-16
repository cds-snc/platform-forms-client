import React, { useCallback } from "react";
import Image from "next/image";

import { Logos, options } from "./";
import { useTemplateStore } from "../../store";
import { useTranslation } from "next-i18next";

const Label = ({ htmlFor, children }: { htmlFor: string; children?: JSX.Element | string }) => {
  return (
    <label className="block font-bold mb-1 text-sm" htmlFor={htmlFor}>
      {children}
    </label>
  );
};

export const Branding = () => {
  const { t, i18n } = useTranslation("form-builder");
  const { brandName, updateField, unsetField, brandLogoEn, brandLogoFr, logoTitleEn, logoTitleFr } =
    useTemplateStore((s) => ({
      id: s.id,
      brandName: s.form?.brand?.name || "",
      brandLogoEn: s.form?.brand?.logoEn || "",
      brandLogoFr: s.form?.brand?.logoFr || "",
      logoTitleEn: s.form?.brand?.logoTitleEn || "",
      logoTitleFr: s.form?.brand?.logoTitleFr || "",
      unsetField: s.unsetField,
      updateField: s.updateField,
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

  const lang = i18n.language;
  const logo = lang === "en" ? brandLogoEn : brandLogoFr;
  const defaultLogo = lang === "en" ? "/img/sig-blk-en.svg" : "/img/sig-blk-fr.svg";
  const logoTitle = lang === "en" ? "logoTitleEn" : "logoTitleFr";
  const altText = lang === "en" ? logoTitleEn : logoTitleFr;

  const brandingOptions = options.map((option) => ({
    value: option.name,
    label: option[logoTitle],
  }));

  brandingOptions.unshift({ value: "", label: t("branding.defaultOption") });

  return (
    <div>
      <h1 className="visually-hidden">{t("branding.heading")}</h1>
      <h2>{t("branding.heading")}</h2>
      <p className="block text-sm mb-5">{t("branding.text1")}</p>
      {/* Logo select */}
      <div>
        <Label htmlFor="branding-select">{t("branding.select")}</Label>
        <Logos
          options={brandingOptions.map(({ value, label }) => ({ value, label }))}
          selected={brandName}
          handleUpdate={updateBrand}
        />
      </div>
      {/* Logo preview */}
      <div>
        <div className="font-bold mb-3 text-sm">{t("branding.preview")}</div>
        {/* eslint-disable @next/next/no-img-element  */}
        {logo ? (
          <img alt={altText} src={logo} width={300} />
        ) : (
          <Image src={defaultLogo} width="360" height="33" />
        )}
      </div>
    </div>
  );
};
