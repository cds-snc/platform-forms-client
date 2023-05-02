import React, { useEffect, useRef } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { StyledLink } from "./StyledLink/StyledLink";

const LanguageToggle = () => {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language;
  const loading = useRef(true);
  const { isReady, asPath } = useRouter();

  useEffect(() => {
    if (isReady) {
      loading.current = false;
    }
  }, [isReady]);

  if (loading.current) return null;

  return (
    <StyledLink
      href={asPath}
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
