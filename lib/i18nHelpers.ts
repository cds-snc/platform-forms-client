import i18next from "i18next";
import myFormsEn from "@i18n/locales/en/my-forms.json";
import myFormsFr from "@i18n/locales/fr/my-forms.json";
import commonEn from "@i18n/locales/en/common.json";
import commonFr from "@i18n/locales/fr/common.json";
import reviewEn from "@i18n/locales/en/review.json";
import reviewFr from "@i18n/locales/fr/review.json";

/**
 * This custom translation function works like useTranslation() from react-i18next which was not working in this context.
 * The language resources are hard coded to avoid having to async load them from the file system.
 * @param translationFile
 */

// BRYAN - TODO remove this and fix translation
export const customTranslate = (translationFile: "my-forms" | "common" | "review") => {
  if (!i18next.isInitialized) {
    i18next.init({
      fallbackLng: "en",
      supportedLngs: ["en", "fr"],
      preload: ["en", "fr"],
      debug: true,
      ns: ["my-forms", "common", "review"],
      resources: {
        en: {
          "my-forms": myFormsEn,
          common: commonEn,
          review: reviewEn,
        },
        fr: {
          "my-forms": myFormsFr,
          common: commonFr,
          review: reviewFr,
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
export function orderLanguageStrings({
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
