import { cache } from "react";
import { cookies } from "next/headers";

import { LANGUAGE_COOKIE_NAME } from "./client";
import { languages } from "./settings";

const normalizeLocaleToSupportedLanguage = (locale: string) => {
  if (languages.includes(locale)) {
    return locale;
  }

  const baseLocale = locale.split("-")[0]?.toLowerCase();

  if (baseLocale && languages.includes(baseLocale)) {
    return baseLocale;
  }

  return languages[0];
};

export const getCurrentLanguage = cache(async () => {
  const cookieLang = (await cookies()).get(LANGUAGE_COOKIE_NAME)?.value;
  if (!cookieLang) {
    return languages[0];
  }

  return normalizeLocaleToSupportedLanguage(cookieLang);
});
