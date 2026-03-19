"use client";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";

export const ClearOptionsDialog = ({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation("form-builder");
  const dialogRef = useDialogRef();

  return (
    <Dialog
      title={t("clearOptions.title")}
      dialogRef={dialogRef}
      handleClose={onClose}
      actions={
        <div className="flex gap-4">
          <Button
            theme="secondary"
            onClick={() => {
              dialogRef.current?.close();
              onClose();
            }}
          >
            {t("cancel")}
          </Button>
          <Button
            theme="destructive"
            onClick={() => {
              onConfirm();
              dialogRef.current?.close();
            }}
          >
            {t("clearOptions.confirm")}
          </Button>
        </div>
      }
    >
      <div className="p-5">
        <p>{t("clearOptions.description")}</p>
      </div>
    </Dialog>
  );
};
