import React from "react";
import { serverTranslation } from "@i18n";

const SkipLink = async ({ locale }: { locale: string }) => {
  const { t } = await serverTranslation(locale, ["common"]);
  return (
    <div id="skip-link-container">
      <a href="#content" id="skip-link">
        {t("skip-link")}
      </a>
    </div>
  );
};

export default SkipLink;
