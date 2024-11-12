import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import React from "react";
import Markdown from "markdown-to-jsx";

export const ResetFlowDialog = ({
  handleClose,
  handleConfirm,
}: {
  handleClose: () => void;
  handleConfirm: () => void;
}) => {
  const { t } = useTranslation("form-builder");
  const dialog = useDialogRef();

  const actions = (
    <div className="flex gap-4">
      <Button
        theme="secondary"
        onClick={() => {
          handleClose();
        }}
      >
        {t("cancel")}
      </Button>

      <Button theme="destructive" onClick={handleConfirm}>
        {t("logic.resetRulesDialog.reset")}
      </Button>
    </div>
  );

  return (
    <div className="form-builder">
      <Dialog
        title={t("logic.resetRulesDialog.title")}
        dialogRef={dialog}
        actions={actions}
        className="max-h-[80%] overflow-y-scroll"
        handleClose={handleClose}
      >
        <div className="my-4 mx-5 flex flex-col gap-4">
          <h3 className="gc-h4 mb-1 pb-0 text-lg">{t("logic.resetRulesDialog.areYouSure")}</h3>
          <p className="text-sm">
            <Markdown options={{ forceBlock: true }}>{t("logic.resetRulesDialog.text")}</Markdown>
          </p>

          <span></span>
        </div>
      </Dialog>
    </div>
  );
};
