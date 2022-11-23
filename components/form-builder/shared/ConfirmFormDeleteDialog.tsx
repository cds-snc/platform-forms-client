import React from "react";
import { useDialogRef, Dialog } from "./Dialog";
import { useTranslation } from "next-i18next";
import { Button } from "../shared/Button";
export const ConfirmFormDeleteDialog = ({
  handleConfirm,
  handleClose,
}: {
  handleConfirm: () => void;
  handleClose: () => void;
}) => {
  const dialog = useDialogRef();
  const { t } = useTranslation("form-builder");

  const actions = (
    <>
      <Button
        theme="secondary"
        onClick={() => {
          dialog.current?.close();
          handleClose();
        }}
      >
        {t("formDeleteConfirmCancel")}
      </Button>
      <Button
        className="ml-5"
        theme="destructive"
        onClick={() => {
          dialog.current?.close();
          handleClose();
          handleConfirm();
        }}
      >
        {t("formDeleteConfirmOkay")}
      </Button>
    </>
  );

  return (
    <Dialog
      title={t("formDeleteConfirmTitle")}
      handleClose={handleClose}
      dialogRef={dialog}
      actions={actions}
    >
      {t("formDeleteConfirmMessage")}
    </Dialog>
  );
};
