import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { Button, useDialogRef, Dialog, LineItemEntries } from "@components/form-builder/app/shared";
import { randomId } from "@lib/clientHelpers";
import axios from "axios";
import { useRouter } from "next/router";
import { logMessage } from "@lib/logger";
import { Attention, AttentionTypes } from "@components/globals/Attention/Attention";

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
}) => {
  const { t } = useTranslation("form-builder-responses");
  const router = useRouter();
  const [entries, setEntries] = useState<string[]>([]);
  const [clientError, setClientError] = useState(false);
  const [unknownError, setUnknownError] = useState(false);
  const [entriesLengthError, setEntriesLengthError] = useState(false);
  const dialogRef = useDialogRef();
  const confirmInstructionId = `dialog-confirm-receipt-instruction-${randomId()}`;

  useEffect(() => {
    if (entriesLengthError && entries.length > 0) {
      setEntriesLengthError(false);
    }
  }, [entries, entriesLengthError]);

  const handleClose = () => {
    setIsShowDialog(false);
    setEntries([]);
    setClientError(false);
    setUnknownError(false);
    setEntriesLengthError(false);
    dialogRef.current?.close();
  };

  const handleSubmit = () => {
    setClientError(false);
    setUnknownError(false);
    setEntriesLengthError(false);

    if (entries.length <= 0) {
      setEntriesLengthError(true);
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
      .then(() => {
        // Refreshes getServerSideProps data without a full page reload
        router.replace(router.asPath);
        handleClose();
      })
      .catch((err) => {
        logMessage.error(err as Error);
        if (err?.response?.status === 400) {
          setClientError(true);
        } else {
          setUnknownError(true);
        }
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
          <div className="px-10 py-4">
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
              maxEntriesTitle={t("lineItemEntries.notifications.maxEntriesTitle", {
                max: maxEntries,
              })}
              maxEntriesDescription={t("lineItemEntries.notifications.maxEntriesDescription")}
            ></LineItemEntries>
            <p className="mt-8">{nextSteps}</p>
            {entriesLengthError && (
              <Attention
                type={AttentionTypes.ERROR}
                isAlert={true}
                classes="mt-8"
                heading={t("downloadResponsesModals.notifications.entriesLengthHeader")}
              >
                <p className="text-[#26374a] text-sm mb-2">
                  {t("downloadResponsesModals.notifications.entriesLengthDescription")}
                </p>
              </Attention>
            )}
            {clientError && (
              <Attention
                type={AttentionTypes.ERROR}
                isAlert={true}
                classes="mt-8"
                heading={t("downloadResponsesModals.notifications.clientEntryHeader")}
              >
                <p className="text-[#26374a] text-sm mb-2">
                  {t("downloadResponsesModals.notifications.clientEntryDescription")}
                </p>
              </Attention>
            )}
            {unknownError && (
              <Attention
                type={AttentionTypes.ERROR}
                isAlert={true}
                classes="mt-8"
                heading={t("downloadResponsesModals.notifications.unknownErrorHeader")}
              >
                <p className="text-[#26374a] text-sm mb-2">
                  {t("downloadResponsesModals.notifications.unknownErrorDescription")}
                </p>
              </Attention>
            )}
            <div className="flex mt-8 mb-8">
              <Button className="mr-4" onClick={handleSubmit}>
                {submitButtonText}
              </Button>
              <Button theme="secondary" onClick={handleClose}>
                {t("cancel")}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};
