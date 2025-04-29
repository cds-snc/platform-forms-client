"use client";
import { useEffect } from "react";
import { logMessage } from "@lib/logger";

export default function ServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          logMessage.info(`Service worker registered: ${registration.scope}`);
          registration.pushManager.subscribe({
            userVisibleOnly: true,
          });
        })
        .catch((error) => {
          logMessage.info("Service worker registration failed:", error);
        });
    }
  }, []);

  return null;
}
