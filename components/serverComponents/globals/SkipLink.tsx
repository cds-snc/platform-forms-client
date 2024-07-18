import React from "react";
import { serverTranslation } from "@i18n";

export const SkipLink = async () => {
  const { t } = await serverTranslation("common");

  const isBannerEnabled = t("campaignBanner.enabled");
  const bannerCSS = isBannerEnabled ? "bg-white max-w-[260px]" : "";

  return (
    <div id="skip-link-container">
      <a href="#content" id="skip-link" className={bannerCSS}>
        {t("skip-link")}
      </a>
    </div>
  );
};
