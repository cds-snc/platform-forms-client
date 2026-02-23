"use client";
import { useState, useEffect } from "react";
import { logMessage } from "../logger";

export const useUpdateRequired = (save: () => void) => {
  const [updateRequired, setUpdateRequired] = useState(false);
  const handleMessage = (event: MessageEvent) => {
    logMessage.info("Message to Update Recieved");
    if (event.data.type === "GCFORMS_UPDATE") {
      setUpdateRequired(true);
    }
  };
  useEffect(() => {
    if (updateRequired) {
      save();
    }
  }, [updateRequired, save]);

  useEffect(() => {
    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);
  return updateRequired;
};
