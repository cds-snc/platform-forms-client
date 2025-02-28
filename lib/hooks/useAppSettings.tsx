"use client";
import { AllAppSettings } from "@lib/cache/types";
import { logMessage } from "@lib/logger";
import { createContext, useContext, useState } from "react";

const AppSettingsContext = createContext({
  settings: {} as AllAppSettings,
  getAppSetting: () => {},
});

export const AppSettingsProvider = ({
  children,
  appSettings,
}: {
  children: React.ReactNode;
  appSettings: AllAppSettings;
}) => {
  const [settings] = useState(appSettings);
  return (
    <AppSettingsContext.Provider value={{ settings, getAppSetting: () => {} }}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const { settings } = useContext(AppSettingsContext);
  return {
    getAppSetting: (internalId: string) => {
      if (!Array.isArray(settings)) {
        logMessage.warn("Client tried to access an app setting but there were no settings loaded.");
        return;
      }
      const setting = settings.filter((setting) => setting.internalId === internalId).pop();
      return setting?.value;
    },
  };
};
