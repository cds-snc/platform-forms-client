import React, { useState } from "react";
import { useTranslation, Trans } from "next-i18next";
import { useDialogRef, Dialog } from "@components/form-builder/app/shared";
import { LineItemEntries } from "./line-item-entries";
import { Button, Alert } from "@components/globals";
import { randomId, runPromisesSynchronously } from "@lib/clientHelpers";
import axios from "axios";
import Link from "next/link";
import { isUUID } from "@lib/validation";
import { DialogStates } from "./DialogStates";
import { chunkArray } from "@lib/utils";

export const ConfirmDialog = ({
  isShow,
  setIsShow,
  apiUrl,
  inputRegex = isUUID,
  maxEntries = 20,
  onSuccessfulConfirm,
}: {
  isShow: boolean;
  setIsShow: React.Dispatch<React.SetStateAction<boolean>>;
  apiUrl: string;
  inputRegex?: (field: string) => boolean;
  maxEntries?: number;
  onSuccessfulConfirm: () => void;
}) => {
  const { t } = useTranslation("form-builder-responses");
  const [entries, setEntries] = useState<string[]>([]);
  const [status, setStatus] = useState<DialogStates>(DialogStates.EDITING);
  const [errorEntriesList, setErrorEntriesList] = useState<string[]>([]);
  const dialogRef = useDialogRef();
  const confirmInstructionId = `dialog-confirm-receipt-instruction-${randomId()}`;

  // Cleanup any un-needed errors from the last render
  if (status === DialogStates.MIN_ERROR && entries.length > 0) {
    setStatus(DialogStates.EDITING);
  }

  const handleClose = () => {
    setIsShow(false);
    setEntries([]);
    setStatus(DialogStates.EDITING);
    setErrorEntriesList([]);
    dialogRef.current?.close();
  };

  const handleSubmit = async () => {
    setStatus(DialogStates.SENDING);
    setErrorEntriesList([]);

    if (entries.length <= 0) {
      setStatus(DialogStates.MIN_ERROR);
      return;
    }
    // API endpoint only accepts 50 entries at a time
    const batchedEntries = chunkArray(entries, 50);

    const batchQueries = batchedEntries.map((batch) => {
      return () =>
        axios({
          url: apiUrl,
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
          data: batch,
        });
    });

    const batchResults = await runPromisesSynchronously(batchQueries);

    // Check batched results for errors

    const invalidEntries: string[] = [];
    let criticalFailure = false;

    batchResults.forEach((result, index) => {
      if (result.status !== 200) {
        criticalFailure = true;
        // Report all entries as invalid for that batch
        invalidEntries.push(...batchedEntries[index]);
        return;
      }
      const data = result.data;
      if (data.invalidConfirmationCodes?.length > 0) {
        invalidEntries.push(...data.invalidConfirmationCodes);
      }
    });

    // If there are invalid entries, show them in the dialog
    if (invalidEntries.length > 0) {
      setStatus(criticalFailure ? DialogStates.UNKNOWN_ERROR : DialogStates.FAILED_ERROR);
      setEntries(invalidEntries);
      setErrorEntriesList(invalidEntries);
      return;
    }

    // Success, close the dialog
    setStatus(DialogStates.SENT);
    onSuccessfulConfirm();
    handleClose();
  };

  return (
    <>
      {isShow && (
        <Dialog
          title={t("downloadResponsesModals.confirmReceiptDialog.title")}
          dialogRef={dialogRef}
          handleClose={handleClose}
          className="max-w-[800px]"
        >
          <div className="px-8 py-4">
            <div>
              {status === DialogStates.MIN_ERROR && (
                <Alert.Danger className="mb-2">
                  <Alert.Title headingTag="h3">
                    {t("downloadResponsesModals.confirmReceiptDialog.errors.minEntries.title")}
                  </Alert.Title>
                  <p>
                    {t(
                      "downloadResponsesModals.confirmReceiptDialog.errors.minEntries.description"
                    )}
                  </p>
                </Alert.Danger>
              )}
              {status === DialogStates.MAX_ERROR && (
                <Alert.Danger className="mb-2">
                  <Alert.Title headingTag="h3">
                    {t("downloadResponsesModals.confirmReceiptDialog.errors.maxEntries.title", {
                      max: maxEntries,
                    })}
                  </Alert.Title>
                  <p>
                    {t(
                      "downloadResponsesModals.confirmReceiptDialog.errors.maxEntries.description",
                      {
                        max: maxEntries,
                      }
                    )}
                  </p>
                </Alert.Danger>
              )}
              {status === DialogStates.FORMAT_ERROR && (
                <Alert.Danger className="mb-2">
                  <Alert.Title headingTag="h3">
                    {t("downloadResponsesModals.confirmReceiptDialog.errors.invalidEntry.title")}
                  </Alert.Title>
                  <p>
                    <Trans
                      ns="form-builder-responses"
                      i18nKey="downloadResponsesModals.confirmReceiptDialog.errors.invalidEntry.description"
                    >
                      <i></i>
                    </Trans>
                  </p>
                </Alert.Danger>
              )}
              {status === DialogStates.FAILED_ERROR && (
                <Alert.Danger className="mb-2">
                  <Alert.Title headingTag="h3">
                    {t("downloadResponsesModals.confirmReceiptDialog.errors.errorEntries.title")}
                  </Alert.Title>
                  <p>
                    {t(
                      "downloadResponsesModals.confirmReceiptDialog.errors.errorEntries.description"
                    )}
                  </p>
                </Alert.Danger>
              )}

              {status === DialogStates.UNKNOWN_ERROR && (
                <Alert.Danger className="mb-2">
                  <Alert.Title headingTag="h3">
                    {t("downloadResponsesModals.confirmReceiptDialog.errors.unknown.title")}
                  </Alert.Title>
                  <p>
                    {t("downloadResponsesModals.confirmReceiptDialog.errors.unknown.description")}
                    <Link href={"/form-builder/support"}>
                      {t(
                        "downloadResponsesModals.confirmReceiptDialog.errors.unknown.descriptionLink"
                      )}
                    </Link>
                    .
                  </p>
                </Alert.Danger>
              )}
            </div>
            <div className="py-4">
              <h4>{t("downloadResponsesModals.confirmReceiptDialog.contentHeading")}</h4>
              <p>{t("downloadResponsesModals.confirmReceiptDialog.contentBody")}</p>
              <p className="mb-2 mt-10 font-bold" id={confirmInstructionId}>
                {t("downloadResponsesModals.confirmReceiptDialog.copyCode")}
              </p>
              <p className="mb-4">
                {t("downloadResponsesModals.confirmReceiptDialog.copyCodeNote")}
              </p>

              <LineItemEntries
                inputs={entries}
                setInputs={setEntries}
                validateInput={inputRegex}
                inputLabelId={confirmInstructionId}
                maxEntries={maxEntries}
                errorEntriesList={errorEntriesList}
                status={status}
                setStatus={setStatus}
              ></LineItemEntries>

              <div className="mt-4 flex gap-4">
                <Button theme="secondary" onClick={handleClose}>
                  {t("downloadResponsesModals.cancel")}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={status === DialogStates.SENDING || status === DialogStates.FORMAT_ERROR}
                >
                  {status === DialogStates.SENDING
                    ? t("downloadResponsesModals.sending")
                    : t("downloadResponsesModals.confirmReceiptDialog.confirmReceipt")}
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};
