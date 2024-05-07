import i18next from "i18next";
import myFormsEn from "@i18n/translations/en/my-forms.json";
import myFormsFr from "@i18n/translations/fr/my-forms.json";
import commonEn from "@i18n/translations/en/common.json";
import commonFr from "@i18n/translations/fr/common.json";

/**
 * This custom translation function works like useTranslation() from react-i18next which was not working in this context.
 * The language resources are hard coded to avoid having to async load them from the file system.
 * @param translationFile
 */
export const customTranslate = (translationFile: "my-forms" | "common") => {
  if (!i18next.isInitialized) {
    i18next.init({
      fallbackLng: "en",
      supportedLngs: ["en", "fr"],
      preload: ["en", "fr"],
      debug: true,
      ns: ["my-forms", "common"],
      resources: {
        en: {
          "my-forms": myFormsEn,
          common: commonEn,
        },
        fr: {
          "my-forms": myFormsFr,
          common: commonFr,
        },
      },
    });
  }

  i18next.setDefaultNamespace(translationFile);
  return { t: i18next.t };
};

export const getProperty = (field: string, lang: string): string => {
  if (!field) {
    throw new Error("Field does not exist");
  }
  return field + lang.charAt(0).toUpperCase() + lang.slice(1);
};

// For bilingual content.
// Note: i18n t() was left out to keep this more portable
export function orderLangugeStrings({
  stringEn,
  stringFr,
  lang,
}: {
  stringEn: string | undefined;
  stringFr: string | undefined;
  lang: string | undefined;
}) {
  if (!stringFr && !stringEn) return "unknown";
  if (stringFr && !stringEn) return stringFr;
  if (stringEn && !stringFr) return stringEn;
  return lang === "fr" ? `${stringFr} / ${stringEn}` : `${stringEn} / ${stringFr}`;
}
