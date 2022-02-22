import React from "react";
import { useTranslation } from "next-i18next";

const SkipLink = () => {
  const { t } = useTranslation("common");
  return (
    <nav aria-label={t("skip-link")}>
      <div id="skip-link-container">
        <a href="#content" id="skip-link">
          {t("skip-link")}
        </a>
      </div>
    </nav>
  );
};

export default SkipLink;
