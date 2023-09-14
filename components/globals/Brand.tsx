import React from "react";
import { BrandProperties } from "@lib/types/form-types";
import { getLocalizedProperty } from "@lib/utils";
import { useTranslation } from "next-i18next";
import { Language } from "@components/form-builder/types";

const Brand = ({
  brand,
  className,
  lang,
}: {
  brand: BrandProperties | undefined | null;
  className?: string;
  lang?: Language;
}) => {
  const { t, i18n } = useTranslation("common");

  const language = lang ? lang : (i18n.language as Language);
  const themeLogo = brand?.[getLocalizedProperty("logo", language)] as string | undefined;

  // Check if custom branding was provided, otherwise show the Government of Canada branding
  const logo = themeLogo ?? "/img/sig-blk-" + language + ".svg";

  // Custom title or default
  const logoTitle =
    (brand?.[getLocalizedProperty("logoTitle", language)] as string | undefined) ?? t("fip.text");

  // Custom link or default
  const linkUrl =
    (brand?.[getLocalizedProperty("url", language)] as string | undefined) ?? t("fip.link");

  // This default height seems to work for most custom brand logos so far.
  let logoStyles = `max-h-[80px] max-w-[600px] ${className || ""}`;

  // This customization applies to the default logo only. We may need to add more custom sizes in future.
  if (!themeLogo) {
    logoStyles = `max-h-[40px] ${className || ""}`;
  }

  return (
    <a href={linkUrl} aria-label={logoTitle}>
      <picture>
        <img src={logo} alt={logoTitle} className={logoStyles} />
      </picture>
    </a>
  );
};

export default Brand;
