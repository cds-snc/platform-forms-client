"use client";

import { createContext, useContext, ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { showOpenFilePicker } from "native-file-system-adapter";
import { getAccessTokenFromApiKey } from "../lib/utils";

interface ResponsesAppContextType {
  // Navigation
  router: ReturnType<typeof useRouter>;
  searchParams: ReturnType<typeof useSearchParams>;

  // i18n
  t: ReturnType<typeof useTranslation>["t"];
  i18n: ReturnType<typeof useTranslation>["i18n"];

  // File system
  showOpenFilePicker: typeof showOpenFilePicker;

  // API utilities
  getAccessTokenFromApiKey: typeof getAccessTokenFromApiKey;

  // Environment
  apiUrl: string;
  isDevelopment: boolean;
  isProductionEnvironment?: boolean;
}

const ResponsesAppContext = createContext<ResponsesAppContextType | null>(null);

interface ResponsesAppProviderProps {
  children: ReactNode;
  _locale: string; // Passed for future use, currently unused
  namespace?: string;
  // Optional overrides for testing
  overrides?: Partial<ResponsesAppContextType>;
  isProductionEnvironment?: boolean;
}

export const ResponsesAppProvider = ({
  children,
  _locale,
  namespace = "response-api",
  overrides = {},
  isProductionEnvironment,
}: ResponsesAppProviderProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, i18n } = useTranslation(namespace);

  const value: ResponsesAppContextType = {
    router,
    searchParams,
    t,
    i18n,
    showOpenFilePicker,
    getAccessTokenFromApiKey,
    apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
    isDevelopment: process.env.NODE_ENV === "development",
    isProductionEnvironment: isProductionEnvironment ?? false,
    ...overrides, // Allow test overrides
  };

  return <ResponsesAppContext.Provider value={value}>{children}</ResponsesAppContext.Provider>;
};

export const useResponsesApp = () => {
  const context = useContext(ResponsesAppContext);
  if (!context) {
    throw new Error("useResponsesApp must be used within ResponsesAppProvider");
  }
  return context;
};
