import React from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { StyledLink } from "./StyledLink/StyledLink";

const LanguageToggle = () => {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language;
  const { pathname } = useRouter();

  return (
    <StyledLink
      href={pathname}
      className="text-base text-right"
      locale={locale === "en" ? "fr" : "en"}
      ariaLabel={`${t("lang-toggle")}: ${locale == "en" ? "Français" : "English"}`}
      lang={locale === "en" ? "fr" : "en"}
    >
      {locale === "en" ? "Français" : "English"}
    </StyledLink>
  );
};

export default LanguageToggle;
