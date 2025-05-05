import { type Language } from "@lib/types/form-builder-types";
import { customTranslate } from "@lib/i18nHelpers";
import { LanguageToggleScript } from "./LanguageToggleScript"; // Import the client component

const toggledLang = (language: Language) => {
  return language === "en" ? "fr" : "en";
};

export const LanguageToggle = ({
  pathname = "",
  language,
}: {
  pathname: string;
  language: Language;
}) => {
  const lang = {
    en: { text: "English", abbr: "en", link: pathname.replace(`/${language}`, `/en`) },
    fr: { text: "Français", abbr: "fr", link: pathname.replace(`/${language}`, `/fr`) },
  };

  const displayLang = lang[toggledLang(language)];
  const { t } = customTranslate("common");

  return (
    <div className="brand__toggle">
      <div className="gcds-lang-toggle">
        <h2 id="lang-toggle__heading" className="sr-only">
          {t("lang-toggle")}
        </h2>
        <a id="lang-toggle-link" href={displayLang.link} lang={displayLang.abbr}>
          <span>{displayLang.text}</span>
          <abbr title={displayLang.text}>{displayLang.abbr}</abbr>
        </a>
      </div>
      {/* Include client script */}
      <LanguageToggleScript />
    </div>
  );
};
