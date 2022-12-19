import React, { createContext, useState, useContext } from "react";

interface TemplateApiType {
  error: string;
  setApiError: (title: string) => void;
}

const defaultTemplateApi: TemplateApiType = {
  error: "",
  setApiError: () => void 0,
};

const TemplateApiContext = createContext<TemplateApiType>(defaultTemplateApi);

export function TemplateApiProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string>("");

  const setApiError = (title: string) => {
    title && setError(title);
  };

  return (
    <TemplateApiContext.Provider value={{ error, setApiError }}>
      {children}
    </TemplateApiContext.Provider>
  );
}

export const useTemplateApi = () => useContext(TemplateApiContext);
