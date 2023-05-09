import React from "react";
import { useTranslation } from "next-i18next";
import { LockIcon } from "../../icons";

export const LockedBadge = ({ className }: { className?: string }) => {
  const { t } = useTranslation("form-builder");
  const badgeClass = className ? className : "laptop:absolute laptop:right-0 laptop:top-[-10px]";
  return (
    <div className="relative">
      <div className={`${badgeClass} px-2 py-2 inline-block bg-gray-200 border-1 border-gray-500`}>
        <label className="flex text-sm line-height-[38px]" data-testid="locked-item">
          <LockIcon className="inline-block mr-1 !w-7" />
          <span className="inline-block pt-[3px] ">{t("lockedBlock")}</span>
        </label>
      </div>
    </div>
  );
};
