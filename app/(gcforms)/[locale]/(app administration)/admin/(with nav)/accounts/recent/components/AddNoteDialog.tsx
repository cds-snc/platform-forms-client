"use client";
import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { TextArea } from "@formBuilder/components/shared/TextArea";
import { useTranslation } from "@i18n/client";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { useEffect, useState } from "react";
import { addNote } from "../actions";

type AddNoteDialogEventDetails = {
  userId: string;
};

export const AddNoteDialog = () => {
  const dialogRef = useDialogRef();
  const { Event } = useCustomEvent();
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const { t } = useTranslation("admin-recent-signups");

  const handleClose = () => {
    dialogRef.current?.close();
    setIsOpen(false);
  };

  const handleOpenDialog = (detail: AddNoteDialogEventDetails) => {
    if (detail) {
      setUserId(detail.userId);
      setIsOpen(true);
    }
  };

  useEffect(() => {
    Event.on(EventKeys.openAddUserNoteDialog, handleOpenDialog);

    return () => {
      Event.off(EventKeys.openAddUserNoteDialog, handleOpenDialog);
    };
  });

  return (
    isOpen &&
    userId && (
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
                handleClose();
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              theme="primary"
              onClick={() => {
                addNote(userId, note || "");
                dialogRef.current?.close();
                handleClose();
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
            value={note || ""}
            onChange={(e) => {
              setNote(e.target.value);
            }}
          />
        </div>
      </Dialog>
    )
  );
};
