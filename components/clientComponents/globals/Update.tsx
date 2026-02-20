import { useState, useEffect } from "react";
import { logMessage } from "@lib/logger";
import Markdown from "markdown-to-jsx";
import { Button } from "./Buttons";

export const Update = () => {
  const [updateNeeded, setUpdateNeeded] = useState(true);

  const handleMessage = (event: MessageEvent) => {
    logMessage.info(event.data);
    if (event.data.type === "GCFORMS_UPDATE") {
      setUpdateNeeded(true);
    }
  };

  useEffect(() => {
    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);

  // short circuit when no update needed
  if (!updateNeeded) return null;

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
          >
            {"Update"}
          </Button>
          <Button
            onClick={() => {
              setUpdateNeeded(false);
            }}
            type="button"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
