import React, { createContext, useContext } from "react";
import translations, { Language } from "../i18n";

interface LocaleContextProps {
  locale: Language;
}

const LocaleContext = createContext<LocaleContextProps | undefined>(undefined);

export const LocaleProvider: React.FC<{
  initialLocale: Language;
  children: React.ReactNode;
}> = ({ initialLocale, children }) => {
  let locale = initialLocale;

  if (!translations[initialLocale as Language]) {
    // eslint-disable-next-line no-console
    console.warn(`The locale "${initialLocale}" is not supported. Defaulting to "en".`);
    locale = "en";
  }

  return <LocaleContext.Provider value={{ locale }}>{children}</LocaleContext.Provider>;
};

export const useLocale = (): LocaleContextProps => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
};
