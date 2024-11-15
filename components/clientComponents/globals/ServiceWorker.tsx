"use client";
import { logMessage } from "@lib/logger";
import { useEffect } from "react";

export const RegisterServiceWorker = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/serviceWorker.js", { scope: "/" })
        .then((registration) => logMessage.info("Registration Succees ", registration))
        .catch((error) => logMessage.error(error));
    }
  }, []);
  return <></>;
};
