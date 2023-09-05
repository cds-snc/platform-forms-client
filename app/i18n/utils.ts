import { languages } from "./settings";

export const pathLanguageDetection = (path: string, languages: string[]) => {
  const pathRegEx = new RegExp(`^/(${languages.join("|")})`);
  const match = path.match(pathRegEx);
  return match ? match[1] : null;
};

export const languageParamSanitization = (locale: string | string[] | undefined) => {
  // If provided with an array, return the first the default locale
  if (Array.isArray(locale) || locale === undefined) {
    return languages[0];
  }
  if (languages.includes(locale)) {
    return locale;
  }
  // If unknown locale, return default locale
  return languages[0];
};
