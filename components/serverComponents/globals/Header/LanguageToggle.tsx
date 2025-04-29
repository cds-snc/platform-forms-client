import { type Language } from "@lib/types/form-builder-types";

const toggledLang = (language: Language) => {
  return language === "en" ? "fr" : "en";
};

export const LanguageToggle = ({ language }: { language: Language }) => {
  const lang = {
    en: { text: "English", abbr: "en", link: "" },
    fr: { text: "Français", abbr: "fr", link: "" },
  };
  const displayLang = lang[toggledLang(language)];

  return (
    <div className="brand__toggle">
      <div className="gcds-lang-toggle">
        <h2 id="lang-toggle__heading" className="sr-only">
          Language selection
        </h2>
        <a href={displayLang.link} lang={displayLang.abbr}>
          <span>{displayLang.text}</span>
          <abbr title={displayLang.text}>{displayLang.abbr}</abbr>
        </a>
      </div>
    </div>
  );
};
