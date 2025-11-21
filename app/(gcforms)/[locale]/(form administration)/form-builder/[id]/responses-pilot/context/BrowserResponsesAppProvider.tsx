"use client";

import { createContext, useContext, ReactNode } from "react";
import { showOpenFilePicker } from "native-file-system-adapter";
import { getAccessTokenFromApiKey } from "../lib/utils";

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

  // Basic translation function with common strings
  const defaultT = (key: string, options?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      // Step indicator
      stepOf: `Step ${options?.current || 1} of ${options?.total || 3}`,

      // Load Key Page
      "loadKeyPage.title": "Load your API key",
      "loadKeyPage.detail": "Select the API key file you downloaded when you created your API key.",

      // Buttons
      back: "Back",
      next: "Next",
      loadKey: "Load key",
      checkForResponses: "Check for responses",
      backToStart: "Back to start",
      continueButton: "Continue",

      // Lost Key
      "lostKey.link": "Lost your key?",
      "lostKey.title": "Lost your API key?",
      "lostKey.description": "If you've lost your API key, you'll need to generate a new one.",

      // ContentWrapper
      "responsesPilot.responsesSwitchLink": "Switch back to standard responses view",

      // Common
      "common.back": "Back",
      "common.next": "Next",
      "common.cancel": "Cancel",
      "common.continue": "Continue",
    };

    return translations[key] || key;
  };

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
