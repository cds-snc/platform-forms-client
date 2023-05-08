import React, { useEffect, useRef } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { StyledLink } from "./StyledLink/StyledLink";

const LanguageToggle = () => {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language;
  const { pathname, asPath, isReady } = useRouter();
  const href = useRef(pathname);

  useEffect(() => {
    if (isReady && href.current !== asPath) {
      href.current = asPath;
    }
  }, [pathname, asPath, isReady]);

  return (
    <StyledLink
      href={href.current}
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
