import React, { useEffect } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

const LanguageToggle = () => {
  const { t, i18n } = useTranslation("common");
  const locale = i18n.language;
  const router = useRouter();

  useEffect(() => {
    const html = document.querySelector("html");

    if (html) html.setAttribute("lang", locale);
  }, [locale]);

  function changeLang(lang) {
    router.push(router.asPath, router.asPath, { locale: lang });
  }

  return (
    <>
      <div className="gc-language-toggle">
        <label htmlFor="lang-switcher-button">
          {t("lang-toggle")}: {locale == "en" ? "Français" : "English"}
        </label>
        {locale == "en" ? (
          <button
            onClick={() => {
              changeLang("fr");
            }}
            lang="fr"
            id="lang-switcher-button"
          >
            Français
          </button>
        ) : (
          <button
            onClick={() => {
              changeLang("en");
            }}
            lang="en"
            id="lang-switcher-button"
          >
            English
          </button>
        )}
      </div>
    </>
  );
};

export default LanguageToggle;
