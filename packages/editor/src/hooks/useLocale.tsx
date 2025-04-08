import React, { createContext, useContext } from "react";
import { Language } from "../i18n";

interface LocaleContextProps {
  locale: Language;
  setLocale: (locale: Language) => void;
}

const LocaleContext = createContext<LocaleContextProps | undefined>(undefined);

export const LocaleProvider: React.FC<{
  initialLocale: Language;
  children: React.ReactNode;
}> = ({ initialLocale, children }) => {
  const [locale, setLocale] = React.useState<Language>(initialLocale);

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
};

export const useLocale = (): LocaleContextProps => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
};
