"use client";

import { createContext, useContext, ReactNode } from "react";
import { showOpenFilePicker } from "native-file-system-adapter";
import { getAccessTokenFromApiKey } from "../lib/utils";
import responseApiEn from "@root/i18n/translations/en/response-api.json";
import commonEn from "@root/i18n/translations/en/common.json";

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

/**
 * Helper to get nested translation value from JSON
 */
const getNestedValue = (obj: unknown, path: string): string | undefined => {
  const keys = path.split(".");
  let result: unknown = obj;

  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return typeof result === "string" ? result : undefined;
};

/**
 * Create a translation function that loads from actual translation files
 */
const createTranslationFunction = (
  translationFiles: { namespace: string; data: Record<string, unknown> }[]
) => {
  return (key: string, options?: Record<string, unknown>): string => {
    // Try to find the translation in each namespace
    for (const { namespace, data } of translationFiles) {
      // Check if key starts with namespace prefix
      const prefixedKey = key.startsWith(`${namespace}.`)
        ? key.substring(namespace.length + 1)
        : key;

      const value = getNestedValue(data, prefixedKey);
      if (value) {
        // Simple interpolation for {{variable}} patterns
        if (options) {
          return value.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
            return options[varName]?.toString() || "";
          });
        }
        return value;
      }
    }

    // Fallback to key if not found
    return key;
  };
};

interface BrowserResponsesAppProviderProps {
  children: ReactNode;
  overrides?: Partial<ResponsesAppContextType>;
}

/**
 * Browser-only version of ResponsesAppProvider that doesn't use Next.js hooks.
 * Use this for Vitest browser mode testing.
 */
export const BrowserResponsesAppProvider = ({
  children,
  overrides = {},
}: BrowserResponsesAppProviderProps) => {
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

  // Translation function that uses actual translation files
  const defaultT = createTranslationFunction([
    { namespace: "response-api", data: responseApiEn as Record<string, unknown> },
    { namespace: "common", data: commonEn as Record<string, unknown> },
  ]);

  const defaultI18n = {
    language: "en",
    changeLanguage: () => Promise.resolve(),
  };

  const value: ResponsesAppContextType = {
    router: defaultRouter,
    searchParams: defaultSearchParams,
    t: defaultT,
    i18n: defaultI18n,
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
