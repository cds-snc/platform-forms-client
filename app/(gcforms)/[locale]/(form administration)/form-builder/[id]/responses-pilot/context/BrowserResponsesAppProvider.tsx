"use client";

import { createContext, useContext, ReactNode } from "react";
import { showOpenFilePicker } from "native-file-system-adapter";
import { getAccessTokenFromApiKey } from "../lib/utils";
import i18next from "i18next";
// Import to trigger i18next initialization
import "@root/i18n/client";

interface ResponsesAppContextType {
  // Navigation
  router: {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
    forward: () => void;
    refresh: () => void;
    prefetch: (href: string) => Promise<void>;
  };
  searchParams: URLSearchParams;

  // i18n
  t: (key: string, options?: Record<string, unknown>) => string;
  i18n: {
    language: string;
    changeLanguage: (lang: string) => Promise<void>;
  };

  // File system
  showOpenFilePicker: typeof showOpenFilePicker;

  // API utilities
  getAccessTokenFromApiKey: typeof getAccessTokenFromApiKey;

  // Environment
  apiUrl: string;
  isDevelopment: boolean;
}

const BrowserResponsesAppContext = createContext<ResponsesAppContextType | null>(null);

interface BrowserResponsesAppProviderProps {
  children: ReactNode;
  overrides?: Partial<ResponsesAppContextType>;
}

/**
 * Browser-only version of ResponsesAppProvider that uses real i18n.
 * Use this for Vitest browser mode testing.
 */
export const BrowserResponsesAppProvider = ({
  children,
  overrides = {},
}: BrowserResponsesAppProviderProps) => {
  // Create a translation function that uses response-api namespace
  const t = (key: string, options?: Record<string, unknown>) => {
    return i18next.t(key, { ...options, ns: "response-api" });
  };

  // Default mock implementations for browser testing
  const defaultRouter = {
    push: () => {},
    replace: () => {},
    back: () => {},
    forward: () => {},
    refresh: () => {},
    prefetch: () => Promise.resolve(),
  };

  const defaultSearchParams = new URLSearchParams();

  // Create i18n object
  const wrappedI18n = {
    language: i18next.language || "en",
    changeLanguage: async (lang: string) => {
      await i18next.changeLanguage(lang);
    },
  };

  const value: ResponsesAppContextType = {
    router: defaultRouter,
    searchParams: defaultSearchParams,
    t,
    i18n: wrappedI18n,
    showOpenFilePicker,
    getAccessTokenFromApiKey,
    apiUrl: "http://localhost:3000/api",
    isDevelopment: true,
    ...overrides, // Allow custom overrides for specific test needs
  };

  return (
    <BrowserResponsesAppContext.Provider value={value}>
      {children}
    </BrowserResponsesAppContext.Provider>
  );
};

/**
 * Hook to access the browser responses app context.
 * Must be used within BrowserResponsesAppProvider.
 */
export const useBrowserResponsesApp = () => {
  const context = useContext(BrowserResponsesAppContext);
  if (!context) {
    throw new Error("useBrowserResponsesApp must be used within BrowserResponsesAppProvider");
  }
  return context;
};

// Also export as useResponsesApp for compatibility with components expecting that name
export const useResponsesApp = useBrowserResponsesApp;
