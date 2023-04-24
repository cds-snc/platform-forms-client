import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { Button, useDialogRef, Dialog, LineItemEntries } from "@components/form-builder/app/shared";
import { randomId } from "@lib/clientHelpers";
import axios from "axios";
import { useRouter } from "next/router";
import { logMessage } from "@lib/logger";
import { Attention, AttentionTypes } from "@components/globals/Attention/Attention";
import Link from "next/link";

// TODO: Tech-Debt separate into separate dialogs for Confirm and report
// https://github.com/cds-snc/platform-forms-client/issues/1941

export interface DialogErrors {
  unknown: boolean;
  minEntries: boolean;
  maxEntries: boolean;
  errorEntries: boolean;
  invalidEntry: boolean;
}

// Note: Confirm and Report Problem Dialogs are very coupled, only the content changes. If the
// behavior of one ever changes then this will need to be separated into separate dialogs.
export const DownloadTableDialog = ({
  isShowDialog,
  setIsShowDialog,
  apiUrl,
  inputRegex,
  maxEntries,
  title,
  description,
  inputHelp,
  nextSteps,
  submitButtonText,
  minEntriesErrorTitle,
  minEntriesErrorDescription,
  maxEntriesErrorTitle,
  maxEntriesErrorDescription,
  errorEntriesErrorTitle,
  errorEntriesErrorDescription,
  invalidEntryErrorTitle,
  invalidEntryErrorDescription,
  unknownErrorTitle,
  unknownErrorDescription,
  unknownErrorDescriptionLink,
}: {
  isShowDialog: boolean;
  setIsShowDialog: React.Dispatch<React.SetStateAction<boolean>>;
  apiUrl: string;
  inputRegex: (field: string) => boolean;
  maxEntries: number;
  title: string;
  description: string;
  inputHelp: string;
  nextSteps: string;
  submitButtonText: string;
  minEntriesErrorTitle: string;
  minEntriesErrorDescription: string;
  maxEntriesErrorTitle: string;
  maxEntriesErrorDescription: string;
  errorEntriesErrorTitle: string;
  errorEntriesErrorDescription: string;
  invalidEntryErrorTitle: string;
  invalidEntryErrorDescription: string;
  unknownErrorTitle: string;
  unknownErrorDescription: string;
  unknownErrorDescriptionLink: string;
}) => {
  const { t } = useTranslation("form-builder-responses");
  const router = useRouter();
  const [entries, setEntries] = useState<string[]>([]);
  const [errors, setErrors] = useState({
    minEntries: false,
    maxEntries: false,
    errorEntries: false,
    invalidEntry: false,
    unknown: false,
  });
  const [errorEntriesList, setErrorEntriesList] = useState<string[]>([]);
  const dialogRef = useDialogRef();
  const confirmInstructionId = `dialog-confirm-receipt-instruction-${randomId()}`;

  // Cleanup any un-needed errors from the last render
  if (errors.minEntries && entries.length > 0) {
    setErrors({ ...errors, minEntries: false });
  }

  const handleClose = () => {
    setIsShowDialog(false);
    setEntries([]);
    setErrors({
      minEntries: false,
      maxEntries: false,
      errorEntries: false,
      invalidEntry: false,
      unknown: false,
    });
    setErrorEntriesList([]);
    dialogRef.current?.close();
  };

  const handleSubmit = () => {
    setErrors({
      minEntries: false,
      maxEntries: false,
      errorEntries: false,
      invalidEntry: false,
      unknown: false,
    });
    setErrorEntriesList([]);

    if (entries.length <= 0) {
      setErrors({ ...errors, minEntries: true });
      return;
    }

    const url = apiUrl;
    return axios({
      url,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      data: entries,
    })
      .then(({ data }) => {
        // Refreshes data. Needed for error cases as well since may be a mix of valid/invalid codes
        router.replace(router.asPath);

        // Confirmation API returns success with an error and 1 or more invalid codes
        if (data?.invalidConfirmationCodes && data.invalidConfirmationCodes?.length > 0) {
          // Note: why a list of entries and another list for invalid entries? This makes showing
          // only the invalid entries a lot easier in the LineItems component
          setErrorEntriesList(data.invalidConfirmationCodes);
          setEntries(data.invalidConfirmationCodes);

          setErrors({ ...errors, errorEntries: true });
          return;
        }
        // Report API returns success with an error and 1 or more invalid codes
        else if (data?.invalidSubmissionNames && data.invalidSubmissionNames?.length > 0) {
          setErrorEntriesList(data.invalidSubmissionNames);
          setEntries(data.invalidSubmissionNames);

          setErrors({ ...errors, errorEntries: true });
          return;
        }

        // Success, close the dialog
        handleClose();
      })
      .catch((err) => {
        logMessage.error(err as Error);
        setErrors({ ...errors, unknown: true });
      });
  };

  return (
    <>
      {isShowDialog && (
        <Dialog
          title={title}
          dialogRef={dialogRef}
          handleClose={handleClose}
          headerStyle="inline-block ml-12 mt-12"
        >
          <div className="px-10">
            <div>
              {errors.minEntries && (
                <Attention
                  type={AttentionTypes.ERROR}
                  isAlert={true}
                  heading={minEntriesErrorTitle}
                  classes="mb-2"
                >
                  <p className="text-[#26374a] text-sm mb-2">{minEntriesErrorDescription}</p>
                </Attention>
              )}
              {errors.maxEntries && (
                <Attention
                  type={AttentionTypes.ERROR}
                  isAlert={true}
                  heading={maxEntriesErrorTitle}
                  classes="mb-2"
                >
                  <p className="text-[#26374a] text-sm mb-2">{maxEntriesErrorDescription}</p>
                </Attention>
              )}
              {errors.errorEntries && (
                <Attention
                  type={AttentionTypes.ERROR}
                  isAlert={true}
                  heading={errorEntriesErrorTitle}
                  classes="mb-2"
                >
                  <p className="text-[#26374a] text-sm mb-2">{errorEntriesErrorDescription}</p>
                </Attention>
              )}
              {errors.invalidEntry && (
                <Attention
                  type={AttentionTypes.ERROR}
                  isAlert={true}
                  heading={invalidEntryErrorTitle}
                  classes="mb-2"
                >
                  <p className="text-[#26374a] text-sm mb-2">{invalidEntryErrorDescription}</p>
                </Attention>
              )}
              {errors.unknown && (
                <Attention
                  type={AttentionTypes.ERROR}
                  isAlert={true}
                  heading={unknownErrorTitle}
                  classes="mb-2"
                >
                  <p className="text-[#26374a] text-sm mb-2">
                    {unknownErrorDescription}
                    <Link href={"/form-builder/support"}>{unknownErrorDescriptionLink}</Link>.
                  </p>
                </Attention>
              )}
            </div>
            <div className="py-4">
              <p className="mt-2">{description}</p>
              <p className="mt-10 mb-2 font-bold" id={confirmInstructionId}>
                {inputHelp}
              </p>

              <LineItemEntries
                inputs={entries}
                setInputs={setEntries}
                validateInput={inputRegex}
                spellCheck={false}
                inputLabelId={confirmInstructionId}
                maxEntries={maxEntries}
                errors={errors}
                setErrors={setErrors}
                errorEntriesList={errorEntriesList}
              ></LineItemEntries>

              <p className="mt-8">{nextSteps}</p>
              <div className="flex mt-8 mb-8">
                <Button className="mr-4" onClick={handleSubmit}>
                  {submitButtonText}
                </Button>
                <Button theme="secondary" onClick={handleClose}>
                  {t("downloadResponsesModals.cancel")}
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};
