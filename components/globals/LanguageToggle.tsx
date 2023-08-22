import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { StyledLink } from "./StyledLink/StyledLink";

const LanguageToggle = () => {
  const { t } = useTranslation("common");

  const { asPath, isReady, query } = useRouter();
  const [href, setHref] = useState(asPath);
  const [currentLang, setCurrentLang] = useState(query.locale);

  useEffect(() => {
    if (isReady && href === asPath) {
      setHref(asPath.replace(`/${currentLang}`, `/${currentLang === "en" ? "fr" : "en"}`));
    }
  }, [asPath, currentLang, href, isReady]);

  useEffect(() => {
    if (currentLang !== query.locale) {
      setCurrentLang(query.locale);
    }
  }, [query.locale, currentLang]);

  return (
    <StyledLink
      href={href}
      className="text-base text-right"
      locale={currentLang === "en" ? "fr" : "en"}
      ariaLabel={`${t("lang-toggle")}: ${currentLang == "en" ? "Français" : "English"}`}
      lang={currentLang === "en" ? "fr" : "en"}
    >
      {currentLang === "en" ? "Français" : "English"}
    </StyledLink>
  );
};

export default LanguageToggle;
