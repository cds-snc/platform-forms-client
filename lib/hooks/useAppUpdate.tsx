"use client";
import { useState, useEffect, createContext, useContext } from "react";
import { logMessage } from "../logger";
import Markdown from "markdown-to-jsx";
import { Button } from "@clientComponents/globals/Buttons";

const AppUpdateContext = createContext({
  updateTriggered: false,
  updateRequired: false,
});

export const AppUpdateProvider = ({ children }: { children: React.ReactNode }) => {
  const [updateRequired, setUpdateRequired] = useState(false);
  const [updateTriggered, setUpdateTriggered] = useState(false);

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

  // Only run on initial page load
  useEffect(() => {
    const localUpdate = Boolean(sessionStorage?.getItem("gcFormsUpdate"));
    if (localUpdate) {
      sessionStorage.removeItem("gcFormsUpdate");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUpdateTriggered(true);
    }
  }, []);

  return (
    <AppUpdateContext.Provider value={{ updateRequired, updateTriggered }}>
      {updateRequired && <Update />}
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

export const Update = () => {
  return (
    <div
      id="modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="m-4 w-full max-w-lg rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{"GCForms needs to update"}</h2>
        </div>

        <Markdown options={{ forceBlock: true }}>
          {"To continue use GCForms you must update to the lastest version."}
        </Markdown>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => {
              window.location.reload();
            }}
            type="submit"
            theme="primary"
          >
            {"Update"}
          </Button>
        </div>
      </div>
    </div>
  );
};
