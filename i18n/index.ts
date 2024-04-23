"use server";
import { createInstance } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next/initReactI18next";
import { getOptions, languages } from "./settings";
import { headers } from "next/headers";
import { pathLanguageDetection } from "./utils";

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

export async function serverTranslation(
  ns?: string | string[],
  options?: { keyPrefix?: string; lang?: string }
) {
  let path = headers().get("x-path") ?? "";

  const refererPath = headers().get("referer") ?? "";
  // remove domain from referer
  const refererPathWithoutDomain = refererPath.replace(/https?:\/\/[^/]+/, "");
  if (!path && refererPathWithoutDomain) {
    path = refererPathWithoutDomain;
  }

  const pathLang = pathLanguageDetection(path, languages);

  const i18nLang = options?.lang || pathLang || languages[0];

  const i18nextInstance = await initI18next(i18nLang, ns ?? ["common"]);
  return {
    t: i18nextInstance.getFixedT(i18nLang, ns, options?.keyPrefix),
    i18n: i18nextInstance,
  };
}
