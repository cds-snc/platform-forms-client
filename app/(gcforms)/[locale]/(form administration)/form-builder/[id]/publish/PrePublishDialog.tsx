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

  const [prePublishStep, setPrePublishStep] = useState<PrePublishSteps>(() =>
    hasCurrentlyPublishedVersion
      ? PrePublishSteps.FormTypeAndDescription
      : PrePublishSteps.ReasonForPublish
  );
  const [agreed, setAgreed] = useState(false);

  const isPublishReasonStep = prePublishStep === PrePublishSteps.ReasonForPublish;
  const republishBlocked = Boolean(hasCurrentlyPublishedVersion && isPublishReasonStep && !agreed);
  const actionLabel = hasCurrentlyPublishedVersion
    ? prePublishStep === PrePublishSteps.FormTypeAndDescription
      ? t("continue")
      : t("republish")
    : isPublishReasonStep
      ? t("continue")
      : t("publish");

  async function handleInitialPublishContinue() {
    // 1 => initial publish flow: Reason -> FormTypeAndDescription -> Confirm
    if (prePublishStep === PrePublishSteps.ReasonForPublish) {
      if (reasonForPublish === "") {
        setError(true);
        return;
      }
      setPrePublishStep(PrePublishSteps.FormTypeAndDescription);
      return;
    }

    // 2 => Form type (+ description required)
    if (formType === "" || description === "") {
      setError(true);
      return;
    }

    // 3 => finalise initial publish
    handleConfirm();
  }

  async function handleRepublishContinue() {
    // republish flow: reasonForPublish -> Reason(agreement) -> Confirm
    if (prePublishStep === PrePublishSteps.FormTypeAndDescription) {
      // 1 => require reason selection
      if (reasonForPublish === "") {
        setError(true);
        return;
      }
      // move to agreement/confirmation step
      setPrePublishStep(PrePublishSteps.ReasonForPublish);
      return;
    }

    // 2 => confirmation (agreement) step
    if (!agreed) {
      setError(true);
      return;
    }

    handleConfirm();
  }

  async function ContinuePublishSteps() {
    setError(false);
    if (hasCurrentlyPublishedVersion) {
      await handleRepublishContinue();
    } else {
      await handleInitialPublishContinue();
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

  const formTypeOptions = [
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

  const reasonForPublishOptions = [
    { label: t("prePublishFormDialog.readyForPublicUse"), value: "public-use" },
    { label: t("prePublishFormDialog.readyForInternalUse"), value: "internal-use" },
    { label: t("prePublishFormDialog.sharingForFeedback"), value: "feedback-use" },
    { label: t("prePublishFormDialog.other"), value: "other-use" },
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
          <div className="mx-4 my-4 flex flex-col gap-4">
            {!hasCurrentlyPublishedVersion && (
              <>
                <h3 className="gc-h4 mb-1 pb-0 text-lg">
                  <div className="flex-col">
                    <div className="flex">
                      <span className="mr-2 inline-block">{t("prePublishFormDialog.text1")}</span>
                      <legend className="required text-normal! inline-block!">
                        <span data-testid="required" aria-hidden>
                          ({t("required")})
                        </span>
                      </legend>
                    </div>
                  </div>
                </h3>

                {error && (
                  <Alert.Danger focussable={true} className="mb-5">
                    <Alert.Title headingTag="h3">
                      {t("prePublishFormDialog.error.title")}
                    </Alert.Title>
                    <p className="mb-2">{t("prePublishFormDialog.error.message")} </p>
                  </Alert.Danger>
                )}
                <p className="text-sm">{t("prePublishFormDialog.helpsUnderstand")}</p>
              </>
            )}

            <span>
              {/* For initial publish show reason radios; for republish this step is confirmation */}
              {!hasCurrentlyPublishedVersion && (
                <>
                  {reasonForPublishOptions.map((opt) => (
                    <Radio
                      key={opt.value}
                      onChange={onReasonForPublishChange}
                      id={`reason-${opt.value}`}
                      name="reason-for-publish"
                      value={opt.value}
                      label={opt.label}
                    />
                  ))}
                </>
              )}
            </span>

            {hasCurrentlyPublishedVersion && (
              <ConfirmationAgreement handleAgreement={handleAgreement} />
            )}
          </div>
        </Dialog>
      )}
      {prePublishStep == PrePublishSteps.FormTypeAndDescription && (
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
            {!hasCurrentlyPublishedVersion && (
              <h3 className="gc-h4 mb-1 pb-0 text-lg">{t("prePublishFormDialog.text2")}</h3>
            )}

            {error && (
              <Alert.Danger focussable={true} className="mb-5">
                <Alert.Title headingTag="h3">{t("prePublishFormDialog.error.title")}</Alert.Title>
                <p className="mb-2">{t("prePublishFormDialog.error.message")} </p>
              </Alert.Danger>
            )}

            {!hasCurrentlyPublishedVersion && (
              <p className="mb-4 text-sm">{t("prePublishFormDialog.thisInformation")}</p>
            )}

            {!hasCurrentlyPublishedVersion ? (
              <Label className="gcds-label required" required={true}>
                {t("prePublishFormDialog.whatType")}
              </Label>
            ) : (
              <Label className="gcds-label required" required={true}>
                {t("prePublishFormDialog.republish.categoryLabel")}
              </Label>
            )}

            <div className="mb-1">
              {hasCurrentlyPublishedVersion ? (
                <div className="flex flex-col gap-3">
                  {reasonForPublishOptions.map((option) => (
                    <Radio
                      key={option.value}
                      onChange={onReasonForPublishChange}
                      id={`formtype-${option.value}`}
                      name="template-category"
                      value={option.value}
                      label={option.label}
                    />
                  ))}
                </div>
              ) : (
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
                  {formTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Show description (brief description) only for initial publishes; republish only captures category */}
            {!hasCurrentlyPublishedVersion && (
              <>
                <Label className="gcds-label required" required={true}>
                  {t("prePublishFormDialog.briefDesc")}
                </Label>
                <p>
                  <TextArea
                    id="txtDescription"
                    className="w-11/12"
                    onChange={onDescriptionChange}
                  />
                </p>
              </>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
};
