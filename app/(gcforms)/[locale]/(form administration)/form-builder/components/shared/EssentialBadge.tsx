"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { EssentialIcon } from "@serverComponents/icons/EssentialIcon";

export const EssentialBadge = ({ className }: { className?: string }) => {
  const { t } = useTranslation("form-builder");
  const badgeClass = className
    ? className
    : "laptop:absolute laptop:right-[-10px] laptop:top-[-10px]";
  return (
    <div className="relative">
      <div className={`${badgeClass} inline-block rounded-sm   bg-gray-200`}>
        <label className="flex text-sm" data-testid="locked-item">
          <EssentialIcon className="inline-block " />
          <span className="inline-block  text-slate-800">{t("lockedBlock")}</span>
        </label>
      </div>
    </div>
  );
};
