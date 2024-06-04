"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { EssentialIcon } from "@serverComponents/icons/EssentialIcon";

export const EssentialBadge = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="inline-block !bg-[#E9ECEF] leading-[24px]">
      <label data-testid="locked-item">
        <EssentialIcon className="mr-2 inline-block" />
        <span className="inline-block pr-2 text-slate-800">{t("lockedBlock")}</span>
      </label>
    </div>
  );
};
