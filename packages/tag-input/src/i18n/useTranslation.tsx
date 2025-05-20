import { useCallback } from "react";
import type { Translations } from "../i18n";
import type { TranslationKey } from "../i18n";
import translations, { Language } from "../i18n";

export const useTranslation = (initialLocale: string) => {
  let locale = initialLocale as Language;

  if (!translations[initialLocale as Language]) {
    // eslint-disable-next-line no-console
    console.warn(`The locale "${initialLocale}" is not supported. Defaulting to "en".`);
    locale = "en";
  }

  const t = useCallback(
    (key: TranslationKey, placeholders?: Record<string, string>): string => {
      const langTranslations = translations[locale] as Translations;
      let translation = langTranslations[key] || key;

      if (placeholders) {
        Object.entries(placeholders).forEach(([placeholder, value]) => {
          translation = translation.replace(new RegExp(`{${placeholder}}`, "g"), value);
        });
      }

      return translation;
    },
    [locale]
  );

  return { t, locale };
};
