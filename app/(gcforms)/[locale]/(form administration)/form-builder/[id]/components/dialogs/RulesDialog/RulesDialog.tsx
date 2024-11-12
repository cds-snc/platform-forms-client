"use client";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { useTranslation } from "@i18n/client";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";
import React, { useEffect } from "react";

export const RulesDialog = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { t } = useTranslation("form-builder");
  const { Event } = useCustomEvent();
  const dialog = useDialogRef();

  // @TODO:
  const hasRules = false;

  // const handleOpenDialog = (detail: { itemId: number }) => {
  //   setIsOpen(true);
  // };

  const handleOpenDialog = () => {
    setIsOpen(true);
  };

  useEffect(() => {
    Event.on("open-rules-dialog", handleOpenDialog);

    return () => {
      Event.off("open-rules-dialog", handleOpenDialog);
    };
  });

  const handleClose = () => {
    dialog.current?.close();
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <Dialog
          dialogRef={dialog}
          // actions={actions}
          handleClose={handleClose}
          title={
            hasRules ? t("addConditionalRules.modalTitleEdit") : t("addConditionalRules.modalTitle")
          }
        >
          <div className="p-5">This is the rules dialog</div>
        </Dialog>
      )}
    </>
  );
};
