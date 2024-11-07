"use client";
import { createContext, useContext, useState } from "react";

export type FormBuilderConfig = {
  apiKey?: string;
};

export const formBuilderConfigDefault: FormBuilderConfig = {
  apiKey: "",
};

const FormBuilderConfigContext = createContext({
  config: {},
  setConfig: () => {},
} as { config: FormBuilderConfig; setConfig: React.Dispatch<React.SetStateAction<FormBuilderConfig>> });

export const FormBuilderConfigProvider = ({
  children,
  formBuilderConfig,
}: {
  children: React.ReactNode;
  formBuilderConfig: FormBuilderConfig;
}) => {
  const [config, setConfig] = useState(formBuilderConfig);
  return (
    <FormBuilderConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </FormBuilderConfigContext.Provider>
  );
};

export const useFormBuilderConfig = () => {
  const { config, setConfig } = useContext(FormBuilderConfigContext);

  const getConfig = (key: string) => {
    return config[key as keyof typeof config];
  };

  const updateConfig = (key: string, value: string) => {
    setConfig({
      ...config,
      ...{ [key]: value },
    });
  };

  return {
    // TODO: disable anything for testing? if (process.env.APP_ENV !== "test") {...
    apiKey: getConfig("apiKey"),
    hasApiKey: Boolean(getConfig("apiKey")),
    updateApiKey: (value: string) => updateConfig("apiKey", value),
  };
};
