"use client";
import { useState, useEffect } from "react";
import i18next from "i18next";
import { initReactI18next, useTranslation as useClientTranslation } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { getOptions, languages } from "./settings";
import { useParams } from "next/navigation";
import { logMessage } from "@lib/logger";

const runsOnServerSide = typeof window === "undefined";
const pathname = runsOnServerSide ? "" : window.location.pathname;

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`../../public/static/locales/${language}/${namespace}.json`)
    )
  )
  .init({
    ...getOptions(),
    lng: undefined, // detect the language on client side
    detection: {
      order: ["path", "localstorage", "cookie", "navigator"],
      lookupCookie: "i18next",
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage", "cookie"],
    },
    // Important on server-side to assert translations are loaded before rendering views.
    // Important to ensure that both languages are available for the / path simultaneously
    preload: runsOnServerSide || pathname === "/" ? languages : [],
    debug: process.env.NODE_ENV === "development" && !runsOnServerSide,
  });

export function useTranslation(ns?: string | string[], options?: Record<string, unknown>) {
  const ret = useClientTranslation(ns, options);
  /*
  const locale = (useParams()?.locale as string) ?? localStorage.getItem("i18nextLng");

  const { i18n } = ret;

  useEffect(() => {
    if (i18n.resolvedLanguage === locale) return;
    i18n.changeLanguage(locale);
  }, [locale, i18n]);
*/
  return ret;
}
