"use client";
import { createContext, useContext, useState } from "react";

export type FormBuilderConfig = {
  apiKeyId?: string | false;
};

export const formBuilderConfigDefault: FormBuilderConfig = {
  apiKeyId: false,
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

  const updateConfig = (key: string, value: string | false | null) => {
    setConfig({
      ...config,
      ...{ [key]: value },
    });
  };

  return {
    // TODO: disable anything for testing? if (process.env.APP_ENV !== "test") {...
    apiKeyId: getConfig("apiKeyId"),
    hasApiKeyId: Boolean(getConfig("apiKeyId")),
    updateApiKeyId: (value: string | false) => updateConfig("apiKeyId", value),
  };
};
