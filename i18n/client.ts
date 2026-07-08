"use client";
import i18next from "i18next";
import { initReactI18next, useTranslation as reactUseTranslation } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { getOptions } from "./settings";

export const LANGUAGE_COOKIE_NAME = "i18next";

const languageDetector = new LanguageDetector();

i18next
  .use(initReactI18next)
  .use(languageDetector)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`)
    )
  )
  .init({
    ...getOptions(),
    lng: undefined, // detect the language on client side
    detection: {
      order: ["localstorage", "cookie"],
      lookupCookie: LANGUAGE_COOKIE_NAME,
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage", "cookie"],
    },
    debug: process.env.I18N_DEBUG === "true",
  });

export function useTranslation(ns?: string | string[], options?: Record<string, unknown>) {
  const clientHook = reactUseTranslation(ns, options);

  return clientHook;
}
