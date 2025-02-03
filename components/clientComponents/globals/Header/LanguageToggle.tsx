"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";
import { usePathname } from "next/navigation";

const LanguageToggle = () => {
  const {
    t,
    i18n: { language: currentLang },
  } = useTranslation("common");
  const pathname = usePathname();
  const [href, setHref] = useState(
    pathname?.replace(`/${currentLang}`, `/${currentLang === "en" ? "fr" : "en"}`) ??
      `/${currentLang}`
  );

  useEffect(() => {
    if (pathname !== null) {
      setHref(pathname.replace(`/${currentLang}`, `/${currentLang === "en" ? "fr" : "en"}`));
    }
  }, [pathname, currentLang]);

  const handleClick = useCallback(() => {
    // Dispatch beforeunload event using a custom event
    // This will trigger a save to session when a user changes the language
    const event = new Event("beforeunload", { bubbles: true, cancelable: true });
    window.dispatchEvent(event);
  }, []);

  return (
    <a
      href={href}
      className="text-right text-base"
      aria-label={`${t("lang-toggle")}: ${currentLang == "en" ? "Français" : "English"}`}
      lang={currentLang === "en" ? "fr" : "en"}
      onClick={handleClick}
    >
      {currentLang === "en" ? "Français" : "English"}
    </a>
  );
};

export default LanguageToggle;
