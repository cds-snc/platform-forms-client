"use client";
import { useEffect } from "react";
import i18next from "i18next";
import { initReactI18next, useTranslation as reactUseTranslation } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { getOptions, languages } from "./settings";
import ssrDetector from "./ssrDetector";
import { useParams } from "next/navigation";

const runsOnServerSide = typeof window === "undefined";
const pathname = runsOnServerSide ? "" : window.location.pathname;

const languageDetector = new LanguageDetector();
languageDetector.addDetector(ssrDetector);

i18next
  .use(initReactI18next)
  .use(languageDetector)
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
      order: ["path", "localstorage", "cookie", "ssrDetector"],
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
  const clientHook = reactUseTranslation(ns, options);
  const {
    i18n: { language },
  } = clientHook;
  const locale = (useParams()?.locale as string) ?? null;

  // If we're rendering on the client and the language is different from the resolved language,
  // change the language to match the locale in url
  useEffect(() => {
    if (language !== locale && locale !== null) {
      clientHook.i18n.changeLanguage(locale);
    }
  });

  // If we're rendering on the server and the language is different from the resolved language,
  // This prevents hydration mismatches
  if (runsOnServerSide && language !== locale && locale !== null) {
    clientHook.i18n.changeLanguage(locale);
  }

  return clientHook;
}
