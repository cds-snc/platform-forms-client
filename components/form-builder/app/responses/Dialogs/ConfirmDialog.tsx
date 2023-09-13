import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { useDialogRef, Dialog } from "@components/form-builder/app/shared";
import { LineItemEntries } from "./line-item-entries";
import { Button, Alert } from "@components/globals";
import { randomId } from "@lib/clientHelpers";
import axios from "axios";
import { useRouter } from "next/router";
import { logMessage } from "@lib/logger";
import Link from "next/link";
import { isUUID } from "@lib/validation";
import { DialogStates } from "./DialogStates";

export const ConfirmDialog = ({
  isShow,
  setIsShow,
  apiUrl,
  inputRegex = isUUID,
  maxEntries = 20,
}: {
  isShow: boolean;
  setIsShow: React.Dispatch<React.SetStateAction<boolean>>;
  apiUrl: string;
  inputRegex?: (field: string) => boolean;
  maxEntries?: number;
}) => {
  const { t } = useTranslation("form-builder-responses");
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
    setIsShow(false);
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
      data: entries,
    })
      .then(({ data }) => {
        // Refreshes data. Needed for error cases as well since may be a mix of valid/invalid codes
        router.replace(router.asPath);

        // Confirmation error
        if (data?.invalidConfirmationCodes && data.invalidConfirmationCodes?.length > 0) {
          setStatus(DialogStates.FAILED_ERROR);
          // Note: why a list of entries and another list for invalid entries? This makes showing
          // only the invalid entries a lot easier in the LineItems component
          setErrorEntriesList(data.invalidConfirmationCodes);
          setEntries(data.invalidConfirmationCodes);
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
      {isShow && (
        <Dialog
          title={t("downloadResponsesModals.confirmReceiptDialog.title")}
          dialogRef={dialogRef}
          handleClose={handleClose}
          headerStyle="inline-block ml-12 mt-12"
        >
          <div className="px-10">
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
                    {t(
                      "downloadResponsesModals.confirmReceiptDialog.errors.invalidEntry.description"
                    )}
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
              <p className="mt-2">{t("downloadResponsesModals.confirmReceiptDialog.findCode")}</p>
              <p className="mb-2 mt-10 font-bold" id={confirmInstructionId}>
                {t("downloadResponsesModals.confirmReceiptDialog.copyCode", {
                  max: maxEntries,
                })}
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

              <p className="mt-8">
                {t("downloadResponsesModals.confirmReceiptDialog.responsesAvailableFor")}
              </p>
              <div className="my-8 flex">
                <Button
                  className="mr-4"
                  onClick={handleSubmit}
                  disabled={status === DialogStates.SENDING}
                >
                  {status === DialogStates.SENDING
                    ? t("downloadResponsesModals.sending")
                    : t("downloadResponsesModals.confirmReceiptDialog.confirmReceipt")}
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
