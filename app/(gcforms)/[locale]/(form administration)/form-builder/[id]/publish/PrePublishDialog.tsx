import { useTranslation } from "@i18n/client";
import { Button, Alert } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { Radio } from "@formBuilder/components/shared/MultipleChoice";
import { TextArea } from "@formBuilder/components/shared/TextArea";
import React, { useState } from "react";
import { cn } from "@lib/utils";
import ConfirmationAgreement from "../components/dialogs/CreateDraftConfirmDialog/ConfirmationAgreement";

import { Label } from "@clientComponents/forms";

const PrePublishSteps = {
  ReasonForPublish: 0,
  FormTypeAndDescription: 1,
} as const;

type PrePublishSteps = (typeof PrePublishSteps)[keyof typeof PrePublishSteps];

export const PrePublishDialog = ({
  handleClose,
  handleConfirm,
  setFormType,
  setDescription,
  setReasonForPublish,
  reasonForPublish,
  formType,
  description,
  hasCurrentlyPublishedVersion,
}: {
  handleClose: () => void;
  handleConfirm: () => void;
  setFormType: (formType: string) => void;
  setDescription: (description: string) => void;
  setReasonForPublish: (reasonForPublish: string) => void;
  reasonForPublish: string;
  formType: string;
  description: string;
  hasCurrentlyPublishedVersion?: boolean;
}) => {
  const { t } = useTranslation("form-builder");
  const dialog = useDialogRef();

  const [prePublishStep, setPrePublishStep] = useState<PrePublishSteps>(
    PrePublishSteps.ReasonForPublish
  );
  const [agreed, setAgreed] = useState(false);

  const isPublishReasonStep = prePublishStep === PrePublishSteps.ReasonForPublish;
  const republishBlocked = Boolean(hasCurrentlyPublishedVersion && isPublishReasonStep && !agreed);
  const actionLabel = hasCurrentlyPublishedVersion
    ? t("republish")
    : isPublishReasonStep
      ? t("continue")
      : t("publish");

  async function ContinuePublishSteps() {
    setError(false);
    if (prePublishStep == PrePublishSteps.ReasonForPublish) {
      if (reasonForPublish == "" || (hasCurrentlyPublishedVersion && !agreed)) {
        setError(true);
      } else {
        if (hasCurrentlyPublishedVersion) {
          handleConfirm();
          return;
        }

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

  function handleAgreement(value: string) {
    setAgreed(value === "AGREE" || value === "ACCEPTE");
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
      <Button theme="primary" onClick={ContinuePublishSteps} disabled={republishBlocked}>
        {actionLabel}
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
          title={
            hasCurrentlyPublishedVersion
              ? t("prePublishFormDialog.republishTitle")
              : t("prePublishFormDialog.title")
          }
          dialogRef={dialog}
          actions={actions}
          className="max-h-[80%] overflow-y-scroll"
          handleClose={handleClose}
        >
          <div className="mx-5 my-8 flex flex-col gap-4">
            <h3 className="gc-h4 mb-1 pb-0 text-lg">
              <div className="flex-col">
                {hasCurrentlyPublishedVersion ? (
                  <div className="flex">
                    <span className="mr-2 inline-block">
                      {t("prePublishFormDialog.republish.categoryLabel")}
                    </span>
                    <legend className="required text-normal! inline-block!">
                      <span data-testid="required" aria-hidden>
                        ({t("required")})
                      </span>
                    </legend>
                  </div>
                ) : (
                  <div className="flex">
                    <span className="mr-2 inline-block">{t("prePublishFormDialog.text1")}</span>
                    <legend className="required text-normal! inline-block!">
                      <span data-testid="required" aria-hidden>
                        ({t("required")})
                      </span>
                    </legend>
                  </div>
                )}
              </div>
            </h3>
            {error && (
              <Alert.Danger focussable={true} className="mb-5">
                <Alert.Title headingTag="h3">{t("prePublishFormDialog.error.title")}</Alert.Title>
                <p className="mb-2">{t("prePublishFormDialog.error.message")} </p>
              </Alert.Danger>
            )}
            {hasCurrentlyPublishedVersion ? (
              <p className="text-sm">{t("prePublishFormDialog.republish.helpsUnderstand")}</p>
            ) : (
              <p className="text-sm">{t("prePublishFormDialog.helpsUnderstand")}</p>
            )}
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

            {hasCurrentlyPublishedVersion && (
              <p className="text-sm">{t("prePublishFormDialog.republish.text1")}</p>
            )}

            {hasCurrentlyPublishedVersion && (
              <p className="text-sm">{t("prePublishFormDialog.republish.text2")}</p>
            )}

            {hasCurrentlyPublishedVersion && (
              <div>
                <p className="mb-4 font-semibold">{t("confirm.createDraft.prompt")}</p>
                <ConfirmationAgreement handleAgreement={handleAgreement} />
              </div>
            )}
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
          <div className="mx-5 my-8 flex flex-col gap-4">
            <h3 className="gc-h4 mb-1 pb-0 text-lg">{t("prePublishFormDialog.text2")}</h3>
            {error && (
              <Alert.Danger focussable={true} className="mb-5">
                <Alert.Title headingTag="h3">{t("prePublishFormDialog.error.title")}</Alert.Title>
                <p className="mb-2">{t("prePublishFormDialog.error.message")} </p>
              </Alert.Danger>
            )}
            <p className="mb-4 text-sm">{t("prePublishFormDialog.thisInformation")}</p>
            <Label className="gcds-label required" required={true}>
              {t("prePublishFormDialog.whatType")}
            </Label>
            <div className="mb-1">
              <select
                className={cn(
                  "center-right-15px form-builder-dropdown text-black-default my-0 inline-block min-w-[400px] border-1 border-black p-2"
                )}
                value={formType}
                onChange={(e) => onFormTypeChange(e)}
              >
                <option value="" disabled hidden>
                  {t("logic.choiceSelect.selectOption")}
                </option>
                {elementOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <Label className="gcds-label required" required={true}>
              {t("prePublishFormDialog.briefDesc")}
            </Label>
            <p>
              <TextArea id="txtDescription" className="w-11/12" onChange={onDescriptionChange} />
            </p>
          </div>
        </Dialog>
      )}
    </div>
  );
};
