"use client";
import { createContext, useContext, useState } from "react";

//
// TEMP - lots more to do here, probably rename
//

export type AppConfig = {
  apiKey?: string;
};

const AppConfigContext = createContext({
  config: {},
  setConfig: () => {},
} as { config: AppConfig; setConfig: React.Dispatch<React.SetStateAction<AppConfig>> });

export const AppConfigProvider = ({
  children,
  appConfig,
}: {
  children: React.ReactNode;
  appConfig: AppConfig;
}) => {
  const [config, setConfig] = useState(appConfig);
  return (
    <AppConfigContext.Provider value={{ config, setConfig }}>{children}</AppConfigContext.Provider>
  );
};

export const useAppConfig = () => {
  const { config, setConfig } = useContext(AppConfigContext);
  return {
    getConfig: (key: string) => {
      return config[key as keyof typeof config];
    },
    updateConfig: (key: string, value: string) => {
      setConfig({
        ...config,
        ...{ key, value },
      });
    },
  };
};
