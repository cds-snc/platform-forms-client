"use client";

import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";

export const InvalidNextActionDialog = ({
  source,
  target,
  handleClose,
}: {
  source: string;
  target: string;
  handleClose: () => void;
}) => {
  const { t } = useTranslation("form-builder");
  const dialog = useDialogRef();

  return (
    <Dialog
      dialogRef={dialog}
      handleClose={handleClose}
      title={t("logic.invalidNextAction.title", { source, target })}
      actions={
        <Button theme="primary" onClick={handleClose}>
          {t("logic.invalidNextAction.okay")}
        </Button>
      }
    >
      <div className="p-5">
        <p>{t("logic.invalidNextAction.message", { source, target })}</p>
      </div>
    </Dialog>
  );
};
