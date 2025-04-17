import React, { createContext, useContext } from "react";
import translations, { Language } from "../i18n";

interface LocaleContextProps {
  locale: Language;
}

const Context = createContext<LocaleContextProps | undefined>(undefined);

export const LocaleContext: React.FC<{
  initialLocale: Language;
  children: React.ReactNode;
}> = ({ initialLocale, children }) => {
  let locale = initialLocale;

  if (!translations[initialLocale as Language]) {
    // eslint-disable-next-line no-console
    console.warn(`The locale "${initialLocale}" is not supported. Defaulting to "en".`);
    locale = "en";
  }

  return <Context.Provider value={{ locale }}>{children}</Context.Provider>;
};

export const useLocale = (): LocaleContextProps => {
  const context = useContext(Context);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
};
