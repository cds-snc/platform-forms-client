"use client";
import React, { useCallback } from "react";
import { useTranslation } from "@i18n/client";
import { usePathname } from "next/navigation";
import { Language } from "@lib/types/form-builder-types";

const toggledLang = (language: Language) => {
  return language === "en" ? "fr" : "en";
};

const LanguageToggle = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation("common");
  const pathname = usePathname();

  const handleClick = useCallback(() => {
    // Dispatch beforeunload event using a custom event
    // This will trigger a save to session when a user changes the language
    const event = new Event("beforeunload", { bubbles: true, cancelable: true });
    window.dispatchEvent(event);
  }, []);

  const lang = {
    en: { text: "English", abbr: "en", link: pathname.replace(`/${language}`, `/en`) },
    fr: { text: "Français", abbr: "fr", link: pathname.replace(`/${language}`, `/fr`) },
  };

  const displayLang = lang[toggledLang(language as Language)];

  return (
    <div className="brand__toggle">
      <div className="gcds-lang-toggle">
        <h2 id="lang-toggle__heading" className="sr-only" lang={language}>
          {t("lang-toggle")}:{" "}
        </h2>

        <a
          id="lang-toggle-link"
          href={displayLang.link}
          lang={displayLang.abbr}
          onClick={handleClick}
        >
          <span>{displayLang.text}</span>
          <abbr title={displayLang.text}>{displayLang.abbr}</abbr>
        </a>
      </div>
    </div>
  );
};

export default LanguageToggle;
