"use client";
import { useState, useEffect } from "react";
import i18next from "i18next";
import { initReactI18next, useTranslation as useClientTranslation } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { getOptions, languages } from "./settings";
import { useParams } from "next/navigation";

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
  const ret = useClientTranslation(ns, options);
  const locale = (useParams()?.locale as string) ?? languages[0];
  const { i18n } = ret;

  const [activeLng, setActiveLng] = useState(i18n.resolvedLanguage);

  useEffect(() => {
    if (activeLng === i18n.resolvedLanguage) return;
    setActiveLng(i18n.resolvedLanguage);
  }, [activeLng, i18n.resolvedLanguage]);

  useEffect(() => {
    if (i18n.resolvedLanguage === locale) return;
    i18n.changeLanguage(locale);
  }, [locale, i18n]);

  // If we're rendering on the server and the language is different from the resolved language,
  if (runsOnServerSide && i18n.resolvedLanguage !== locale) {
    i18n.changeLanguage(locale);
  }
  return ret;
}
