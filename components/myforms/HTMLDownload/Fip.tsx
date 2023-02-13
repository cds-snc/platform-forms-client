import React from "react";
import { useTranslation } from "next-i18next";
import { getProperty } from "@lib/formBuilder";

// Base64 Images to simplify creating portable HTML files
const logoBase64En =
  "data:image/png;charset=utf-8;base64,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";
const logoBase64Fr =
  "data:image/png;charset=utf-8;base64,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";

const Fip = ({ language }: { language: string }) => {
  const { t, i18n } = useTranslation("common");

  // ToDo in the future, Custom branding otherwise show the Government of Canada branding
  const formTheme = null;

  const logo =
    (formTheme?.[getProperty("logo", i18n.language)] as string | undefined) ?? language === "en"
      ? logoBase64En
      : logoBase64Fr;

  const linkUrl =
    (formTheme?.[getProperty("url", i18n.language)] as string | undefined) ?? t("fip.link");

  const logoTitle =
    (formTheme?.[getProperty("logoTitle", i18n.language)] as string | undefined) ?? t("fip.text");

  return (
    <div data-testid="fip" className="gc-fip">
      <div className="canada-flag">
        <a
          href={linkUrl}
          aria-label={
            language === "fr"
              ? "Gouvernement du Canada page d'accueil"
              : "Government of Canada Home page"
          }
        >
          <picture>
            <img src={logo} alt={logoTitle} />
          </picture>
        </a>
      </div>
      <div className="inline-flex gap-4">
        <a
          href={language === "en" ? "#navTitleFr" : "#navTitleEn"}
          className="gc-language-toggle"
          aria-label={`${t("lang-toggle")}: ${language == "en" ? "Français" : "English"}`}
          lang={language === "en" ? "fr" : "en"}
        >
          {language === "en" ? "Français" : "English"}
        </a>
      </div>
    </div>
  );
};

export default Fip;
