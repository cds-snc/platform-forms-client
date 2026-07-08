"use client";

import { useTranslation } from "@root/i18n";

export const GCGranding = () => {
  const { t } = useTranslation("common");
  return (
    <div className="min-w-[168px]">
      <picture>
        <img className="h-10 lg:h-8" alt={t("fip.text")} src="/img/wmms-blk.svg" />
      </picture>
    </div>
  );
};
