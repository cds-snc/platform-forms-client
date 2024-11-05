"use client";

import { createContext, useContext, useState } from "react";

// TEMP - lots more to do here, probably rename
const AppConfigContext = createContext({
  config: {},
  setConfig: (config) => {},
});

export const AppConfigProvider = ({
  children,
  appConfig,
}: {
  children: React.ReactNode;
  appConfig: Record<string, any>; 
}) => {
  const [config, setConfig] = useState(appConfig);
  return (
    <AppConfigContext.Provider value={{ config, setConfig}}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => {
  const { config, setConfig } = useContext(AppConfigContext);
  return {
    getConfig: (key: string) => {
      return config[key as keyof typeof config];
    },
    updateConfig: (key: string, value: any) => {
      setConfig({
        ...config,
        ...{key, value}
      });
    }
  };
};
