import React from "react";
import { serverTranslation } from "@i18n";

export const SkipLink = async () => {
  const { t } = await serverTranslation("common");
  return (
    <div id="skip-link-container">
      <a href="#content" id="skip-link">
        {t("skip-link")}
      </a>
    </div>
  );
};
