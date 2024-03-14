import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef, Radio } from "@formBuilder/components/shared";
import { useState } from "react";
import { UpdateSalesforceRecords } from "./PrePublishActions";

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

  async function ContinuePublishSteps() {
    if (prePublishStep == 0) {
      setPrePublishStep(1);
    } else {
      UpdateSalesforceRecords();
      handleConfirm();
    }
  }

  const actions = (
    <div className="flex gap-4">
      <Button theme="primary" onClick={ContinuePublishSteps}>
        {t("continue")}
      </Button>

      <Button
        theme="secondary"
        onClick={() => {
          handleClose();
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
          title={t("prePublishFormDialog.title")}
          dialogRef={dialog}
          actions={actions}
          className="max-h-[80%] overflow-y-scroll"
          handleClose={handleClose}
        >
          <div className="my-8 mx-5 flex flex-col gap-4">
            <p>{t("prePublishFormDialog.text1")}</p>
            <span>
              <Radio
                id="public-use"
                name="reason-for-publish"
                value="public-use"
                label={t("prePublishFormDialog.readyForPublicUse")}
              />
              <Radio
                id="internal-use"
                name="reason-for-publish"
                value="internal-use"
                label={t("prePublishFormDialog.readyForInternalUse")}
              />
              <Radio
                id="feedback-use"
                name="reason-for-publish"
                value="feedback-use"
                label={t("prePublishFormDialog.sharingForFeedback")}
              />
              <Radio
                id="other-use"
                name="reason-for-publish"
                value="other-use"
                label={t("prePublishFormDialog.other")}
              />
            </span>
          </div>
        </Dialog>
      )}
      {prePublishStep == 1 && (
        <Dialog
          title={t("prePublishFormDialog.title")}
          dialogRef={dialog}
          actions={actions}
          className="max-h-[80%] overflow-y-scroll"
          handleClose={handleClose}
        >
          <div className="my-8 mx-5 flex flex-col gap-4">
            <p>{t("prePublishFormDialog.text2")}</p>
            <p></p>
          </div>
        </Dialog>
      )}
    </div>
  );
};
