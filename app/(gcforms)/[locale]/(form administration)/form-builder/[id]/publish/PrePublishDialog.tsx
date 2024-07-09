import { useTranslation } from "@i18n/client";
import { Button, Alert } from "@clientComponents/globals";
import { Dialog, useDialogRef, Radio, TextArea } from "@formBuilder/components/shared";
import React, { useState } from "react";
import { cn } from "@lib/utils";

export const PrePublishDialog = ({
  handleClose,
  handleConfirm,
  setFormType,
  setDescription,
  setReasonForPublish,
  reasonForPublish,
  formType,
  description,
}: {
  handleClose: () => void;
  handleConfirm: () => void;
  setFormType: (formType: string) => void;
  setDescription: (description: string) => void;
  setReasonForPublish: (reasonForPublish: string) => void;
  reasonForPublish: string;
  formType: string;
  description: string;
}) => {
  const { t } = useTranslation("form-builder");
  const dialog = useDialogRef();

  const [prePublishStep, setPrePublishStep] = useState(0);
  enum PrePublishSteps {
    ReasonForPublish = 0,
    FormTypeAndDescription = 1,
  }

  async function ContinuePublishSteps() {
    setError(false);
    if (prePublishStep == PrePublishSteps.ReasonForPublish) {
      if (reasonForPublish == "") {
        setError(true);
      } else {
        setPrePublishStep(PrePublishSteps.FormTypeAndDescription);
      }
    } else {
      if (formType == "" || description == "") {
        setError(true);
      } else {
        handleConfirm();
      }
    }
  }

  async function onDescriptionChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setDescription(event.target.value);
  }

  async function onFormTypeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    if (event != null) {
      setFormType(event.target.value);
    }
  }

  async function onReasonForPublishChange(event: React.ChangeEvent<HTMLInputElement>) {
    setReasonForPublish(event.target.value);
  }

  const elementOptions = [
    {
      label: t("prePublishFormDialog.formtypes.Collect"),
      value: "Collection of Feedback or Stats",
    },
    { label: t("prePublishFormDialog.formtypes.Administer"), value: "Benefit Administration" },
    { label: t("prePublishFormDialog.formtypes.Grants"), value: "Grants and Contributions" },
    { label: t("prePublishFormDialog.formtypes.Regulatory"), value: "Regulatory Compliance" },
    { label: t("prePublishFormDialog.formtypes.Operations"), value: "Organizational Operations" },
    { label: t("prePublishFormDialog.formtypes.Other"), value: "Other" },
  ];

  const [error, setError] = useState(false);

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
      {prePublishStep == PrePublishSteps.ReasonForPublish && (
        <Dialog
          title={t("prePublishFormDialog.title")}
          dialogRef={dialog}
          actions={actions}
          className="max-h-[80%] overflow-y-scroll"
          handleClose={handleClose}
        >
          <div className="my-8 mx-5 flex flex-col gap-4">
            <h3 className="gc-h4 mb-1 pb-0 text-lg">{t("prePublishFormDialog.text1")}</h3>
            {error && (
              <Alert.Danger focussable={true} className="mb-5">
                <Alert.Title headingTag="h3">{t("prePublishFormDialog.error.title")}</Alert.Title>
                <p className="mb-2">{t("prePublishFormDialog.error.message")} </p>
              </Alert.Danger>
            )}
            <p className="text-sm">{t("prePublishFormDialog.helpsUnderstand")}</p>
            <span>
              <Radio
                onChange={onReasonForPublishChange}
                id="public-use"
                name="reason-for-publish"
                value="public-use"
                label={t("prePublishFormDialog.readyForPublicUse")}
              />
              <Radio
                onChange={onReasonForPublishChange}
                id="internal-use"
                name="reason-for-publish"
                value="internal-use"
                label={t("prePublishFormDialog.readyForInternalUse")}
              />
              <Radio
                onChange={onReasonForPublishChange}
                id="feedback-use"
                name="reason-for-publish"
                value="feedback-use"
                label={t("prePublishFormDialog.sharingForFeedback")}
              />
              <Radio
                onChange={onReasonForPublishChange}
                id="other-use"
                name="reason-for-publish"
                value="other-use"
                label={t("prePublishFormDialog.other")}
              />
            </span>
          </div>
        </Dialog>
      )}
      {prePublishStep == PrePublishSteps.FormTypeAndDescription && (
        <Dialog
          title={t("prePublishFormDialog.title")}
          dialogRef={dialog}
          actions={actions}
          className="max-h-[80%] overflow-y-scroll"
          handleClose={handleClose}
        >
          <div className="my-8 mx-5 flex flex-col gap-4">
            <h3 className="gc-h4 mb-1 pb-0 text-lg">{t("prePublishFormDialog.text2")}</h3>
            {error && (
              <Alert.Danger focussable={true} className="mb-5">
                <Alert.Title headingTag="h3">{t("prePublishFormDialog.error.title")}</Alert.Title>
                <p className="mb-2">{t("prePublishFormDialog.error.message")} </p>
              </Alert.Danger>
            )}
            <p className="text-sm mb-4">{t("prePublishFormDialog.thisInformation")}</p>
            <label>{t("prePublishFormDialog.whatType")}</label>
            <div className="mb-1">
              <select
                className={cn(
                  "center-right-15px p-2 form-builder-dropdown my-0 inline-block min-w-[400px] text-black-default border-1 border-black"
                )}
                onChange={(e) => onFormTypeChange(e)}
              >
                <option value="" selected disabled hidden>
                  {t("logic.choiceSelect.selectOption")}
                </option>
                {elementOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
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
