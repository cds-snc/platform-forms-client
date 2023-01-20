import React from "react";
import { useTranslation } from "next-i18next";
import { LockIcon } from "../../icons";
import { AddElement } from "../shared";

export const PanelActionsLocked = ({ addElement }: { addElement: boolean }) => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="z-index-[999] pl-8 pt-2 pb-2 relative flex items-center a bg-gray-200 h-[62px] last-of-type:rounded-b-md">
      <label className="flex  text-sm line-height-[38px]" data-testid="locked-item">
        <LockIcon className="inline-block mr-2 !w-7" /> {t("lockedElement")}
      </label>
      {addElement && (
        <div className="absolute top-[35px] right-[30px]">
          <AddElement position={-1} />
        </div>
      )}
    </div>
  );
};
