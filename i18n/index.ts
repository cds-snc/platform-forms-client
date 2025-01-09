"use server";

import { createInstance } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next/initReactI18next";
import { getOptions, languages } from "./settings";
import { headers, cookies } from "next/headers";
import { pathLanguageDetection } from "./utils";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export async function serverTranslation(
  ns?: string | string[],
  options?: { keyPrefix?: string; lang?: string }
) {
  const path = (await headers()).get("x-path") ?? "";
  const pathLang = pathLanguageDetection(path, languages);
  const cookieLang = (await cookies()).get("i18next")?.value;

  const i18nLang = options?.lang || pathLang || cookieLang || languages[0];

  const i18nextInstance = await initI18next(i18nLang, ns ?? ["common"]);
  return {
    t: i18nextInstance.getFixedT(i18nLang, ns, options?.keyPrefix),
    i18n: i18nextInstance,
  };
}

export async function getCurrentLanguage() {
  const path = (await headers()).get("x-path") ?? "";
  const pathLang = pathLanguageDetection(path, languages);
  const cookieLang = (await cookies()).get("i18next")?.value;
  return pathLang || cookieLang || languages[0];
}

// Internal and private functions - won't be converted into server actions

const initI18next = async (lang: string, ns: string | string[]) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        (language: string, namespace: string) =>
          import(`./translations/${language}/${namespace}.json`)
      )
    )
    .init(getOptions(lang, ns));
  return i18nInstance;
};
