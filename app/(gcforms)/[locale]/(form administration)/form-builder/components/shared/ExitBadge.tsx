"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { ExitBadgeIcon } from "@serverComponents/icons/ExitBadgeIcon";

export const ExitBadge = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="mb-4 inline-block w-auto !bg-[#E9ECEF] leading-[24px]">
      <label data-testid="locked-item">
        <ExitBadgeIcon className="mr-2 inline-block" />
        <span className="inline-block pr-2 text-slate-800">{t("logic.exitBadge")}</span>
      </label>
    </div>
  );
};
