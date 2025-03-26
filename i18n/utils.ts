import { languages } from "./settings";
import { headers, cookies } from "next/headers";

const pathLanguageDetection = (path: string, languages: string[]) => {
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

export async function getCurrentLanguage() {
  const path = (await headers()).get("x-path") ?? "";
  const pathLang = pathLanguageDetection(path, languages);
  const cookieLang = (await cookies()).get("i18next")?.value;
  return pathLang || cookieLang || languages[0];
}
