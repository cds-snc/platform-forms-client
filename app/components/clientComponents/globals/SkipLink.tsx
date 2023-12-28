import React from "react";
import { useTranslation } from "@i18n/client";

export const SkipLink = () => {
  const { t } = useTranslation("common");
  return (
    <div id="skip-link-container">
      <a href="#content" id="skip-link">
        {t("skip-link")}
      </a>
    </div>
  );
};
