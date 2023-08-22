"use client";
import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";

import { usePathname, useParams } from "next/navigation";
import { StyledLink } from "./StyledLink/StyledLink";

const LanguageToggle = () => {
  const { t } = useTranslation("common");
  const pathname = usePathname();
  const [href, setHref] = useState(pathname ?? "/");

  const currentLang = useParams()?.locale;

  useEffect(() => {
    if (pathname !== null && href === pathname) {
      setHref(pathname.replace(`/${currentLang}`, `/${currentLang === "en" ? "fr" : "en"}`));
    }
  }, [pathname, currentLang, href]);

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
