"use client";
import i18next from "i18next";
import { initReactI18next, useTranslation as useClientTranslation } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { getOptions, languages } from "./settings";

const runsOnServerSide = typeof window === "undefined";

//
i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`)
    )
  )
  .init({
    ...getOptions(),
    lng: undefined, // detect the language on client side
    detection: {
      order: ["path", "htmlTag", "cookie", "navigator"],
    },
    // Important on server-side to assert translations are loaded before rendering views.
    preload: runsOnServerSide ? languages : [],
  });

export function useTranslation(ns?: string | string[], options?: Record<string, unknown>) {
  return useClientTranslation(ns, options);
}
