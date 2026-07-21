"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { usePathname } from "next/navigation";
import { FormSavingEvent } from "@root/lib/client/formDataSavingEvent";

const LanguageToggle = () => {
  const {
    t,
    i18n: { language: currentLang },
  } = useTranslation("common");
  const pathname = usePathname();
  const href =
    pathname?.replace(`/${currentLang}`, `/${currentLang === "en" ? "fr" : "en"}`) ??
    `/${currentLang}`;

  const handleClick = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    const isFormPage = document.querySelector('div[id="form-filler"]');

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

  return (
    <div className="gc-lang-toggle-link text-right text-base">
      <h2 className="sr-only" lang={currentLang}>
        {t("lang-toggle")}:{" "}
      </h2>
      <a
        href={href}
        className="text-right text-base"
        lang={currentLang === "en" ? "fr" : "en"}
        onClick={handleClick}
      >
        {currentLang === "en" ? "Français" : "English"}
      </a>
    </div>
  );
};

export default LanguageToggle;
