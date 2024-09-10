"use client";
import React, { useState } from "react";
import { DynamicRowDialog } from "@formBuilder/components/shared/DynamicRowDialog";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { MoreIcon } from "@serverComponents/icons/MoreIcon";

export const CustomizeSetButton = ({
  itemId,
  itemIndex,
}: {
  itemId: number;
  itemIndex: number;
}) => {
  const { t } = useTranslation("form-builder");
  const [showCustomizeSetDialog, setShowCustomizeSetDialog] = useState(false);
  return (
    <>
      <div className="mb-4">
        <Button
          onClick={() => {
            setShowCustomizeSetDialog(true);
          }}
          theme="link"
          className="group/button mb-2 !px-4 !py-2 text-sm leading-6"
        >
          <>
            <MoreIcon className="mr-2 size-[24px] rounded-sm border-1 border-black group-focus/button:border-white group-focus/button:fill-white" />
            {t("dynamicRow.dialog.customizeElement")}
          </>
        </Button>
      </div>
      {showCustomizeSetDialog && (
        <DynamicRowDialog
          itemId={itemId}
          itemIndex={itemIndex}
          handleClose={() => setShowCustomizeSetDialog(false)}
        />
      )}
    </>
  );
};
