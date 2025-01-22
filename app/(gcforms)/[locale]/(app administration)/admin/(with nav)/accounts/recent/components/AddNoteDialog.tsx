"use client";
import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { TextArea } from "@formBuilder/components/shared/TextArea";
import { useTranslation } from "@i18n/client";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { useEffect, useState } from "react";

export const AddNoteDialog = () => {
  const dialogRef = useDialogRef();
  const { Event } = useCustomEvent();
  const [isOpen, setIsOpen] = useState(false);

  const { t } = useTranslation("admin-recent-signups");

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
        handleClose={handleClose}
        title={t("addNote")}
        actions={
          <div className="flex gap-4">
            <Button
              theme="secondary"
              onClick={() => {
                dialogRef.current?.close();
                handleClose && handleClose();
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              theme="primary"
              onClick={() => {
                dialogRef.current?.close();
              }}
            >
              {t("save")}
            </Button>
          </div>
        }
      >
        <div className="p-5">
          <h2>Provide context</h2>
          <p>Add a note to the account to reference at a later date.</p>

          <label htmlFor="" className="mb-2 block font-[700]">
            Add note (optional)
          </label>
          <TextArea
            className="h-40 w-full"
            id={""}
            onChange={() => {
              //
            }}
          />
        </div>
      </Dialog>
    )
  );
};
