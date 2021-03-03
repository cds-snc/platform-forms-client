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
      <h2 className="sr-only visually-hidden">{t("lang-toggle")}</h2>
      <div className="gc-language-toggle">
        {locale == "en" ? (
          <button
            onClick={() => {
              changeLang("fr");
            }}
            lang="fr"
          >
            Français
          </button>
        ) : (
          <button
            onClick={() => {
              changeLang("en");
            }}
            lang="en"
          >
            English
          </button>
        )}
      </div>
    </>
  );
};

export default LanguageToggle;
