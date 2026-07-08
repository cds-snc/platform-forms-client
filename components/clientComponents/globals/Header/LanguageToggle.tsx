"use client";

/*--------------------------------------------*
 * Framework and Third-Party
 *--------------------------------------------*/
import { useEffect } from "react";

/*--------------------------------------------*
 * Internal Aliases
 *--------------------------------------------*/
import { useTranslation } from "@i18n";
const toggledLang = (language: string) => {
  return language === "en" ? "fr" : "en";
};

const LanguageToggle = () => {
  const {
    t,
    i18n: { language: currentLang, changeLanguage },
  } = useTranslation("header");

  const lang = {
    en: { text: "English", abbr: "en" },
    fr: { text: "Français", abbr: "fr" },
  };

  const displayLang = lang[toggledLang(currentLang)];

  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  return (
    <div className="gcds-lang-toggle inline-block">
      <h2 className="sr-only" lang={currentLang}>
        {t("lang-toggle")}
      </h2>
      <button
        id="lang-toggle-link"
        className="gcds-lang-toggle cursor-pointer border-none bg-transparent p-0 text-inherit underline hover:no-underline"
        lang={displayLang.abbr}
        onClick={() => {
          const requestedLang = currentLang === "en" ? "fr" : "en";
          changeLanguage(requestedLang);
        }}
      >
        <span>{displayLang.text}</span>
        <abbr title={displayLang.text}>{displayLang.abbr}</abbr>
      </button>
    </div>
  );
};

export default LanguageToggle;
