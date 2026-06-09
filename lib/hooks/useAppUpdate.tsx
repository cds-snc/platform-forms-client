"use client";
import { useState, useEffect, createContext, useContext } from "react";
import { logMessage } from "../logger";
import { AppUpdater } from "@clientComponents/globals/Update";

const AppUpdateContext = createContext({
  updateTriggered: false,
  updateRequired: false,
});

export const AppUpdateProvider = ({ children }: { children: React.ReactNode }) => {
  const [updateRequired, setUpdateRequired] = useState(true);

  const updateTriggered =
    typeof window !== "undefined" ? Boolean(sessionStorage?.getItem("gcFormsUpdate")) : false;

  if (updateTriggered) {
    logMessage.debug("useAppUpdate flagging update was triggered");
  }

  const handleMessage = (event: MessageEvent) => {
    logMessage.info("Message to Update Recieved");
    if (event.data.type === "GCFORMS_UPDATE") {
      sessionStorage.setItem("gcFormsUpdate", "inProgress");
      setUpdateRequired(true);
    }
  };
  // Register listeners on component load
  useEffect(() => {
    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);

  // After an update clean up and remove the update flag from session storage
  useEffect(() => {
    logMessage.debug("Removing session storage update flag");
    sessionStorage.removeItem("gcFormsUpdate");
  }, []);

  return (
    <AppUpdateContext.Provider value={{ updateRequired, updateTriggered }}>
      {updateRequired && <AppUpdater />}
      {children}
    </AppUpdateContext.Provider>
  );
};

export const useAppUpdate = () => {
  const context = useContext(AppUpdateContext);
  if (context === undefined) {
    throw new Error("useAppUpdate must be used within the AppUpdateProvider");
  }
  return context;
};
