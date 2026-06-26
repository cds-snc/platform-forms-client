"use server";
/*--------------------------------------------*
 * Framework and Third-Party
 *--------------------------------------------*/
import { cache } from "react";
import { createInstance } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next/initReactI18next";

/*--------------------------------------------*
 * Local Relative
 *--------------------------------------------*/
import { getOptions } from "./settings";
import { getCurrentLanguage } from "./utils";
export const serverTranslation = cache(
  async (ns?: string | string[], options?: { keyPrefix?: string; lang?: string }) => {
    const i18nLang = options?.lang ?? (await getCurrentLanguage());

    const i18nextInstance = await initI18next(i18nLang, ns ?? [""]);
    return {
      t: i18nextInstance.getFixedT(i18nLang, ns, options?.keyPrefix),
      i18n: i18nextInstance,
    };
  }
);

const initI18next = async (lang: string, ns: string | string[]) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend((language: string, namespace: string) =>
        import(`./locales/${language}.json`).then((mod) => mod[namespace])
      )
    )
    .init(getOptions(lang, ns));
  return i18nInstance;
};
