"use client";
import { useTranslation } from "@i18n/client";
import Link from "next/link";
import { checkFlag } from "@formBuilder/actions";
import React, { useState, useEffect } from "react";

export const SkipLink = () => {
  const { t } = useTranslation("common");

  const [isBannerEnabled, setBannerData] = useState(false);

  useEffect(() => {
    async function fetchBannerData() {
      const isEnabled = await checkFlag("campaign");
      setBannerData(isEnabled);
    }
    fetchBannerData();
  }, []);

  const bannerCSS = isBannerEnabled ? "bg-white max-w-[260px]" : "";

  return (
    <div id="skip-link-container">
      <Link href="#content" id="skip-link" prefetch={false} className={bannerCSS}>
        {t("skip-link")}
      </Link>
    </div>
  );
};
