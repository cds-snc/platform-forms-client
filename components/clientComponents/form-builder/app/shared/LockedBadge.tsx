"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { LockIcon } from "../../../../serverComponents/icons";

export const LockedBadge = ({ className }: { className?: string }) => {
  const { t } = useTranslation("form-builder");
  const badgeClass = className
    ? className
    : "laptop:absolute laptop:right-[-10px] laptop:top-[-10px]";
  return (
    <div className="relative">
      <div
        className={`${badgeClass} inline-block rounded-md border-1 border-gray-500 bg-gray-200 p-2`}
      >
        <label className="flex text-sm" data-testid="locked-item">
          <LockIcon className="mr-1 inline-block !w-7" />
          <span className="inline-block pt-[3px] text-slate-800">{t("lockedBlock")}</span>
        </label>
      </div>
    </div>
  );
};
