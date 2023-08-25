import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { StyledLink } from "./StyledLink/StyledLink";

const LanguageToggle = () => {
  const {
    t,
    i18n: { language: currentLang },
  } = useTranslation("common");

  const { asPath, isReady } = useRouter();
  const [href, setHref] = useState(
    asPath.replace(`/${currentLang}`, `/${currentLang === "en" ? "fr" : "en"}`)
  );

  useEffect(() => {
    if (isReady)
      setHref(asPath.replace(`/${currentLang}`, `/${currentLang === "en" ? "fr" : "en"}`));
  }, [asPath, currentLang, isReady]);

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
