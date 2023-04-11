import React from "react";
import { BrandProperties } from "@lib/types/form-types";
import { getProperty } from "@lib/formBuilder";
import { useTranslation } from "next-i18next";
import { Language } from "@components/form-builder/types";

const Brand = ({
  brand,
  className,
}: {
  brand: BrandProperties | undefined | null;
  className?: string;
}) => {
  const { t, i18n } = useTranslation("common");

  const lang = i18n.language as Language;
  const themeLogo = brand?.[getProperty("logo", lang)] as string | undefined;

  // Check if custom branding was provided, otherwise show the Government of Canada branding
  const logo = themeLogo ?? "/img/sig-blk-" + i18n.language + ".svg";

  // Custom title or default
  const logoTitle =
    (brand?.[getProperty("logoTitle", lang)] as string | undefined) ?? t("fip.text");

  // Custom link or default
  const linkUrl =
    (brand?.[getProperty("url", i18n.language)] as string | undefined) ?? t("fip.link");

  // This default height seems to work for most custom brand logos so far.
  let logoStyles = `max-h-[90px] max-w-[600px] ${className || ""} lg:mt-10 mt-0`;

  // This customization applies to the default logo only. We may need to add more custom sizes in future.
  if (!themeLogo) {
    logoStyles = `max-h-[40px] ${className || ""} lg:mt-10 mt-0`;
  }

  return (
    <a href={linkUrl} aria-label={logoTitle} className="!inline-block">
      <picture className="inline-block">
        <img src={logo} alt={logoTitle} className={logoStyles} />
      </picture>
    </a>
  );
};

export default Brand;
