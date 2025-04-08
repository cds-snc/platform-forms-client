import { useCallback } from "react";
import translations from "../i18n";
import type { Translations } from "../i18n";
import type { TranslationKey } from "../i18n";
import { useLocale } from "./useLocale";

export const useTranslation = () => {
  const { locale } = useLocale();

  const t = useCallback(
    (key: TranslationKey): string => {
      const langTranslations = translations[locale] as Translations;
      return langTranslations[key] || key;
    },
    [locale]
  );

  return { t, locale };
};
