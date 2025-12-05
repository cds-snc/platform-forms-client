"use client";

import { createContext, useContext, ReactNode } from "react";
import i18next from "i18next";
// Import to trigger i18next initialization
import "@root/i18n/client";

interface FormBuilderContextType {
  // i18n
  t: (key: string, options?: Record<string, unknown>) => string;
  i18n: {
    language: string;
    changeLanguage: (lang: string) => Promise<void>;
  };
}

const BrowserFormBuilderContext = createContext<FormBuilderContextType | null>(null);

interface BrowserFormBuilderProviderProps {
  children: ReactNode;
  overrides?: Partial<FormBuilderContextType>;
}

/**
 * Browser-only version of FormBuilderProvider that uses real i18n.
 * Use this for Vitest browser mode testing.
 */
export const BrowserFormBuilderProvider = ({
  children,
  overrides = {},
}: BrowserFormBuilderProviderProps) => {
  // Create a translation function that uses form-builder namespace
  const t = (key: string, options?: Record<string, unknown>) => {
    return i18next.t(key, { ...options, ns: "form-builder" });
  };

  // Create i18n object
  const wrappedI18n = {
    language: i18next.language || "en",
    changeLanguage: async (lang: string) => {
      await i18next.changeLanguage(lang);
    },
  };

  const value: FormBuilderContextType = {
    t,
    i18n: wrappedI18n,
    ...overrides, // Allow custom overrides for specific test needs
  };

  return (
    <BrowserFormBuilderContext.Provider value={value}>
      {children}
    </BrowserFormBuilderContext.Provider>
  );
};

/**
 * Hook to access the browser form builder context.
 * Must be used within BrowserFormBuilderProvider.
 */
export const useBrowserFormBuilder = () => {
  const context = useContext(BrowserFormBuilderContext);
  if (!context) {
    throw new Error("useBrowserFormBuilder must be used within BrowserFormBuilderProvider");
  }
  return context;
};
