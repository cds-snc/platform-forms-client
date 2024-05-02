import React from "react";
import { useTranslation } from "next-i18next";

const SkipLink = () => {
  const { t } = useTranslation("common");
  return (
    <div id="skip-link-container">
      <a href="#content" id="skip-link">
        {t("skip-link")}
      </a>
    </div>
  );
};

export default SkipLink;
