"use client";

import { useEffect } from "react";
import { FormSavingEvent } from "@lib/client/formDataSavingEvent";

// Note that this is the langugage toggle on form filler

export const LanguageToggleScript = () => {
  useEffect(() => {
    const langToggleLink = document.getElementById("lang-toggle-link");
    const isFormPage = document.querySelector('meta[name="form-filler"]');
    if (langToggleLink) {
      langToggleLink.onclick = async (ev) => {
        if (isFormPage) {
          ev.preventDefault();

          const targetLink = (ev.currentTarget as HTMLAnchorElement)?.href;

          // This will trigger a save to session when a user changes the language
          const saveEvent = new FormSavingEvent(targetLink);
          window.dispatchEvent(saveEvent);
        } else {
          // Dispatch beforeunload event using a custom event
          const event = new Event("beforeunload", { bubbles: true, cancelable: true });
          window.dispatchEvent(event);
        }
      };
    }
  });

  return null; // This component does not render anything
};
