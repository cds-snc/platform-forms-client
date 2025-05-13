"use client";

import { useEffect } from "react";

export const LanguageToggleScript = () => {
  useEffect(() => {
    const langToggleLink = document.getElementById("lang-toggle-link");
    if (langToggleLink) {
      langToggleLink.onclick = () => {
        // Dispatch beforeunload event using a custom event
        // This will trigger a save to session when a user changes the language
        const event = new Event("beforeunload", { bubbles: true, cancelable: true });
        window.dispatchEvent(event);
      };
    }
  }, []);

  return null; // This component does not render anything
};
