"use client";
import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { useTranslation } from "@i18n/client";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { useEffect, useState } from "react";

export const AddNoteDialog = () => {
  const dialogRef = useDialogRef();
  const { Event } = useCustomEvent();
  const [isOpen, setIsOpen] = useState(false);

  const { t } = useTranslation("admin-users");

  const handleClose = () => {
    dialogRef.current?.close();
    setIsOpen(false);
  };

  const handleOpenDialog = () => {
    setIsOpen(true);
  };

  useEffect(() => {
    Event.on(EventKeys.openAddUserNoteDialog, handleOpenDialog);

    return () => {
      Event.off(EventKeys.openAddUserNoteDialog, handleOpenDialog);
    };
  });

  return (
    isOpen && (
      <Dialog
        dialogRef={dialogRef}
        actions={
          <Button
            theme="secondary"
            onClick={() => {
              dialogRef.current?.close();
              handleClose && handleClose();
            }}
          >
            {t("cancel")}
          </Button>
        }
      >
        <>Huzzah</>
      </Dialog>
    )
  );
};
