"use client";
import { useEffect } from "react";

export async function registerServiceWorker() {
  return navigator.serviceWorker.register("/service-worker.js", {
    scope: "/",
    updateViaCache: "none",
  });
}

export default function ServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      registerServiceWorker();
    }
  }, []);

  return null;
}
