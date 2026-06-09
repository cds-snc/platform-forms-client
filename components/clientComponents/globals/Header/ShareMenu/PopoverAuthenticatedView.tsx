"use client";

import React from "react";
import { cn } from "@lib/utils";
import { menuItemClass } from "./styles";

type Props = {
  t: (key: string) => string;
  manageAccessEnabled?: boolean;
  formId?: string;
  name?: string;
  onOpenManageAccess: () => void;
  onRequestShare: () => void;
};

export const PopoverAuthenticatedView = ({
  t,
  manageAccessEnabled,
  formId,
  name,
  onOpenManageAccess,
  onRequestShare,
}: Props) => {
  return (
    <div className="flex flex-col gap-2">
      {manageAccessEnabled && formId !== "0000" && (
        <button type="button" onClick={onOpenManageAccess} className={cn(menuItemClass)}>
          {t("share.manageAccess")}
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          if (!name) {
            onRequestShare();
            return;
          }
          onRequestShare();
        }}
        className={cn(menuItemClass)}
      >
        {t("share.file")}
      </button>
    </div>
  );
};

export default PopoverAuthenticatedView;
