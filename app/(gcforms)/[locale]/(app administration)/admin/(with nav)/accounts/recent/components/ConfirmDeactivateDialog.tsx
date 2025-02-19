"use client";
import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { useTranslation } from "@i18n/client";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { useEffect, useState } from "react";
import { updateActive } from "../../actions";
import { DeactivationReason } from "@lib/types";

type ConfirmDeactivateDialogEventDetails = {
  userId: string;
};

export const ConfirmDeactivateDialog = () => {
  const dialogRef = useDialogRef();
  const { Event } = useCustomEvent();
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const { t } = useTranslation("admin-recent-signups");

  const handleClose = () => {
    dialogRef.current?.close();
    setIsOpen(false);
  };

  const handleOpenDialog = (detail: ConfirmDeactivateDialogEventDetails) => {
    if (detail) {
      setUserId(detail.userId);
      setIsOpen(true);
    }
  };

  useEffect(() => {
    Event.on(EventKeys.openDeactivateUserDialog, handleOpenDialog);

    return () => {
      Event.off(EventKeys.openDeactivateUserDialog, handleOpenDialog);
    };
  });

  return (
    isOpen &&
    userId && (
      <Dialog
        dialogRef={dialogRef}
        handleClose={handleClose}
        title={t("confirmDeactivate")}
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
              theme="destructive"
              onClick={async () => {
                await updateActive(userId, false, DeactivationReason.GROUP_EMAIL);
                dialogRef.current?.close();
                handleClose();
              }}
            >
              {t("deactivate")}
            </Button>
          </div>
        }
      >
        <div className="p-5">
          <h2>Are you sure you would like to deactivate this account?</h2>
          <p>Deactivating this account will notify the user.</p>
        </div>
      </Dialog>
    )
  );
};
