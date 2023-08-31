import { createInstance } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next/initReactI18next";
import { getOptions, languages } from "./settings";
import { cookies } from "next/headers";
import { logMessage } from "@lib/logger";

const initI18next = async (lang: string) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        (language: string, namespace: string) =>
          import(`../../public/static/locales/${language}/${namespace}.json`)
      )
    )
    .init(getOptions(lang));
  return i18nInstance;
};

export async function serverTranslation(
  ns: string | string[],
  options?: { keyPrefix?: string; lang?: string }
) {
  const detectedLang = cookies().get("i18next")?.value;
  const i18nLang = options?.lang ?? detectedLang ?? languages[0];
  const i18nextInstance = await initI18next(i18nLang);
  return {
    t: i18nextInstance.getFixedT(i18nLang, ns, options?.keyPrefix),
    i18n: i18nextInstance,
  };
}
