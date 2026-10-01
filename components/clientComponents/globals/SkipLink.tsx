"use client";
import { useTranslation } from "@i18n/client";

export const SkipLink = () => {
  const { t } = useTranslation("common");
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
