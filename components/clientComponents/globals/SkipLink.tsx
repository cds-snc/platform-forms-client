"use client";
import { useTranslation } from "@i18n/client";
import Link from "next/link";

export const SkipLink = () => {
  const { t } = useTranslation("common");
  const isBannerEnabled = t("campaignBanner.enabled");
  const bannerCSS = isBannerEnabled ? "bg-white max-w-[260px]" : "";

  return (
    <div id="skip-link-container">
      <Link href="#content" id="skip-link" prefetch={false} className={bannerCSS}>
        {t("skip-link")}
      </Link>
    </div>
  );
};
