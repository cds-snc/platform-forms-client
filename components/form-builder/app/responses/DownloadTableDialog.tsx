import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { useDialogRef, Dialog, LineItemEntries } from "@components/form-builder/app/shared";
import { Button, Alert } from "@components/globals";
import { randomId } from "@lib/clientHelpers";
import axios from "axios";
import { useRouter } from "next/router";
import { logMessage } from "@lib/logger";
import Link from "next/link";

export interface DialogErrors {
  unknown: boolean;
  minEntries: boolean;
  maxEntries: boolean;
  errorEntries: boolean;
  invalidEntry: boolean;
}

export enum DialogStates {
  EDITTING,
  SENDING,
  SENT,
  MIN_ERROR,
  MAX_ERROR,
  FORMAT_ERROR,
  FAILED_ERROR,
  UNKNOWN_ERROR,
}

// Note: Confirm and Report Problem Dialogs are very coupled, only the content changes. If the
// behavior of one ever changes then this will need to be separated into separate dialogs.
export const DownloadTableDialog = ({
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
  const { t, i18n } = useTranslation("form-builder-responses");
  const router = useRouter();
  const [entries, setEntries] = useState<string[]>([]);
  const [status, setStatus] = useState<DialogStates>(DialogStates.EDITTING);
  const [errorEntriesList, setErrorEntriesList] = useState<string[]>([]);
  const dialogRef = useDialogRef();
  const confirmInstructionId = `dialog-confirm-receipt-instruction-${randomId()}`;

  // Cleanup any un-needed errors from the last render
  if (status === DialogStates.MIN_ERROR && entries.length > 0) {
    setStatus(DialogStates.EDITTING);
  }

  const handleClose = () => {
    setIsShowDialog(false);
    setEntries([]);
    setStatus(DialogStates.EDITTING);
    setErrorEntriesList([]);
    dialogRef.current?.close();
  };

  const handleSubmit = () => {
    setStatus(DialogStates.SENDING);
    setErrorEntriesList([]);

    if (entries.length <= 0) {
      setStatus(DialogStates.MIN_ERROR);
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
      data: { entries, language: i18n.language },
    })
      .then(({ data }) => {
        // Refreshes data. Needed for error cases as well since may be a mix of valid/invalid codes
        router.replace(router.asPath);

        // Confirmation API returns success with an error and 1 or more invalid codes
        if (data?.invalidConfirmationCodes && data.invalidConfirmationCodes?.length > 0) {
          setStatus(DialogStates.FAILED_ERROR);
          // Note: why a list of entries and another list for invalid entries? This makes showing
          // only the invalid entries a lot easier in the LineItems component
          setErrorEntriesList(data.invalidConfirmationCodes);
          setEntries(data.invalidConfirmationCodes);
          return;
        }

        // Report API returns success with an error and 1 or more invalid codes
        if (data?.invalidSubmissionNames && data.invalidSubmissionNames?.length > 0) {
          setStatus(DialogStates.FAILED_ERROR);
          setErrorEntriesList(data.invalidSubmissionNames);
          setEntries(data.invalidSubmissionNames);
          return;
        }

        // Success, close the dialog
        setStatus(DialogStates.SENT);
        handleClose();
      })
      .catch((err) => {
        logMessage.error(err as Error);
        setStatus(DialogStates.UNKNOWN_ERROR);
      });
  };

  return (
    <>
      <Dialog
        title={title}
        dialogRef={dialogRef}
        handleClose={handleClose}
        headerStyle="inline-block ml-12 mt-12"
      >
        <div className="px-10">
          <div>
            {status === DialogStates.MIN_ERROR && (
              <Alert.Danger className="mb-2">
                <Alert.Title headingTag="h3">{minEntriesErrorTitle}</Alert.Title>
                <p>{minEntriesErrorDescription}</p>
              </Alert.Danger>
            )}
            {status === DialogStates.MAX_ERROR && (
              <Alert.Danger className="mb-2">
                <Alert.Title headingTag="h3">{maxEntriesErrorTitle}</Alert.Title>
                <p>{maxEntriesErrorDescription}</p>
              </Alert.Danger>
            )}
            {status === DialogStates.FORMAT_ERROR && (
              <Alert.Danger className="mb-2">
                <Alert.Title headingTag="h3">{invalidEntryErrorTitle}</Alert.Title>
                <p>{invalidEntryErrorDescription}</p>
              </Alert.Danger>
            )}
            {status === DialogStates.FAILED_ERROR && (
              <Alert.Danger className="mb-2">
                <Alert.Title headingTag="h3">{errorEntriesErrorTitle}</Alert.Title>
                <p>{errorEntriesErrorDescription}</p>
              </Alert.Danger>
            )}

            {status === DialogStates.UNKNOWN_ERROR && (
              <Alert.Danger className="mb-2">
                <Alert.Title headingTag="h3">{unknownErrorTitle}</Alert.Title>
                <p>
                  {unknownErrorDescription}
                  <Link href={"/form-builder/support"}>{unknownErrorDescriptionLink}</Link>.
                </p>
              </Alert.Danger>
            )}
          </div>
          <div className="py-4">
            <p className="mt-2">{description}</p>
            <p className="mb-2 mt-10 font-bold" id={confirmInstructionId}>
              {inputHelp}
            </p>

            <LineItemEntries
              inputs={entries}
              setInputs={setEntries}
              validateInput={inputRegex}
              spellCheck={false}
              inputLabelId={confirmInstructionId}
              maxEntries={maxEntries}
              errorEntriesList={errorEntriesList}
              status={status}
              setStatus={setStatus}
            ></LineItemEntries>

            <p className="mt-8">{nextSteps}</p>
            <div className="my-8 flex">
              <Button
                className="mr-4"
                onClick={handleSubmit}
                disabled={status === DialogStates.SENDING}
              >
                {status === DialogStates.SENDING
                  ? t("downloadResponsesModals.sending")
                  : submitButtonText}
              </Button>
              <Button theme="secondary" onClick={handleClose}>
                {t("downloadResponsesModals.cancel")}
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};
