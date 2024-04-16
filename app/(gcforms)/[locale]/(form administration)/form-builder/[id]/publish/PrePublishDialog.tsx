import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef, Radio, TextArea } from "@formBuilder/components/shared";
import React, { useState } from "react";
import { UpdateSalesforceRecords } from "./PrePublishActions";
import Select from "react-select";

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

  async function onDescriptionChange() {
    //TODO : store the value so it updates on the final dialog state
  }

  async function onFormTypeChange() {
    //TODO : store the value so it updates on the final dialog state
  }

  const elementOptions = [
    { label: t("prePublishFormDialog.formtypes.Application"), value: "Application" },
    { label: t("prePublishFormDialog.formtypes.Consent"), value: "Consent" },
    { label: t("prePublishFormDialog.formtypes.Declaration"), value: "Declaration" },
    { label: t("prePublishFormDialog.formtypes.Feedback"), value: "Feedback" },
    { label: t("prePublishFormDialog.formtypes.Registration"), value: "Registration" },
    { label: t("prePublishFormDialog.formtypes.Request"), value: "Request" },
    { label: t("prePublishFormDialog.formtypes.Survey"), value: "Survey" },
    { label: t("prePublishFormDialog.formtypes.Other"), value: "Other" },
  ];

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
            <h3 className="gc-h4 mb-1 pb-0 text-lg">{t("prePublishFormDialog.text1")}</h3>
            <p className="text-sm">{t("prePublishFormDialog.helpsUnderstand")}</p>
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
            <h3 className="gc-h4 mb-1 pb-0 text-lg">{t("prePublishFormDialog.text2")}</h3>
            <p className="text-sm">{t("prePublishFormDialog.thisInformation")}</p>
            <label>{t("prePublishFormDialog.whatType")}</label>
            <p>
              <Select options={elementOptions} onChange={onFormTypeChange} />
            </p>
            <label>{t("prePublishFormDialog.briefDesc")}</label>
            <p>
              <TextArea id="txtDescription" className="w-11/12" onChange={onDescriptionChange} />
            </p>
          </div>
        </Dialog>
      )}
    </div>
  );
};
