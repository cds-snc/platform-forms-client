import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared";
import { useState } from "react";

export const PrePublishDialog = ({
  handleClose,
  handleConfirm,
}: {
  handleClose: () => void;
  handleConfirm: () => void;
}) => {
  const { t } = useTranslation("form-builder");
  const dialog = useDialogRef();

  const [prePublishStep, setPrePublishStep] = useState(0);

  const actions = (
    <div className="flex gap-4">
      <Button
        theme="primary"
        onClick={async () => {
          if (prePublishStep == 0) {
            setPrePublishStep(1);
          } else {
            handleConfirm();
          }
        }}
      >
        {t("continue")}
      </Button>

      <Button
        theme="secondary"
        onClick={() => {
          dialog.current?.close();
        }}
      >
        {t("cancel")}
      </Button>
    </div>
  );

  return (
    <div className="form-builder">
      {prePublishStep == 0 && (
        <Dialog
          title={t("prePublishFormDialog.title1")}
          dialogRef={dialog}
          actions={actions}
          className="max-h-[80%] overflow-y-scroll"
          handleClose={handleClose}
        >
          <div className="my-8 mx-5 flex flex-col gap-4">
            <p>{t("prePublishFormDialog.text1")}</p>
            <p></p>
          </div>
        </Dialog>
      )}
      {prePublishStep == 1 && (
        <Dialog
          title={t("prePublishFormDialog.title2")}
          dialogRef={dialog}
          actions={actions}
          className="max-h-[80%] overflow-y-scroll"
          handleClose={handleClose}
        >
          <div className="my-8 mx-5 flex flex-col gap-4">
            <p>{t("prePublishFormDialog.meow")}</p>
            <p></p>
          </div>
        </Dialog>
      )}
    </div>
  );
};
