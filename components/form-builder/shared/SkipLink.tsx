import React from "react";
import { useTranslation } from "next-i18next";

export const SkipLink = () => {
  const { i18n } = useTranslation("form-builder");
  const lang = i18n.language as string;

  const onClick = (event: React.SyntheticEvent) => {
    event.preventDefault();

    const container: HTMLElement | null = document.querySelector("#content");
    if (container) {
      container.tabIndex = -1;
      container.focus();
      setTimeout(() => container.removeAttribute("tabindex"), 1000);
    }
  };

  const getText = (lang: string) =>
    lang === "fr" ? "Passer au contenu principal" : "Skip to main content";

  return (
    <nav className="absolute top-0 mt-4 w-full text-center">
      <a className="!p-2 sr-only focus:not-sr-only" href="#content" onClick={onClick}>
        {getText(lang)}
      </a>
    </nav>
  );
};
