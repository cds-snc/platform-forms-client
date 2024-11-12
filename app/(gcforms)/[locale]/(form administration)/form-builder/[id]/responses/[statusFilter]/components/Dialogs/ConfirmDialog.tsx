import React, { useState } from "react";
import { useTranslation } from "@i18n/client";
import { Trans } from "react-i18next";
import { useDialogRef, Dialog } from "@formBuilder/components/shared/Dialog";
import { LineItemEntries } from "./line-item-entries";
import { Button, Alert } from "@clientComponents/globals";
import { randomId } from "@lib/client/clientHelpers";
import Link from "next/link";
import { isUUID } from "@lib/validation/validation";
import { DialogStates } from "./DialogStates";
import { confirmSubmissionCodes } from "../../actions";

export const ConfirmDialog = ({
  formId,
  inputRegex = isUUID,
  maxEntries = 20,
  onSuccessfulConfirm,
}: {
  formId: string;
  inputRegex?: (field: string) => boolean;
  maxEntries?: number;
  onSuccessfulConfirm: () => void;
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("form-builder-responses");
  const [entries, setEntries] = useState<string[]>([]);
  const [status, setStatus] = useState<DialogStates>(DialogStates.EDITING);
  const [errorEntriesList, setErrorEntriesList] = useState<string[]>([]);
  const dialogRef = useDialogRef();
  const confirmInstructionId = `dialog-confirm-receipt-instruction-${randomId()}`;
  const [showConfirmReceiptDialog, setShowConfirmReceiptDialog] = useState(false);

  // Cleanup any un-needed errors from the last render
  if (status === DialogStates.MIN_ERROR && entries.length > 0) {
    setStatus(DialogStates.EDITING);
  }

  const handleClose = () => {
    setShowConfirmReceiptDialog(false);
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
    try {
      const result = await confirmSubmissionCodes(entries, formId);

      const invalidEntries: string[] = [
        ...(result.invalidConfirmationCodes ?? []),
        ...(result.unprocessedConfirmationCodes ?? []),
      ];

      // If there are invalid entries, show them in the dialog
      if (invalidEntries.length > 0) {
        setStatus(
          result.unprocessedConfirmationCodes && result.unprocessedConfirmationCodes.length > 0
            ? DialogStates.UNKNOWN_ERROR
            : DialogStates.FAILED_ERROR
        );
        setEntries(invalidEntries);
        setErrorEntriesList(invalidEntries);
        return;
      }

      // Success, close the dialog
      setStatus(DialogStates.SENT);
      onSuccessfulConfirm();
      handleClose();
    } catch (e) {
      setStatus(DialogStates.UNKNOWN_ERROR);
      return;
    }
  };

  return (
    <>
      <Button onClick={() => setShowConfirmReceiptDialog(true)} theme="secondary">
        {t("responses.confirmReceipt")}
      </Button>
      {showConfirmReceiptDialog && (
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
                      defaults="<italic></italic>" // indicate to translator: text with italic HTML element
                      components={{ italic: <i /> }}
                    ></Trans>
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
                    <Link href={`${language}/support`}>
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
              <p className="font-bold" id={confirmInstructionId}>
                <Trans
                  ns="form-builder-responses"
                  i18nKey="downloadResponsesModals.confirmReceiptDialog.copyCode"
                  defaults="<italic></italic>" // indicate to translator: text with italic HTML element
                  components={{ italic: <i /> }}
                ></Trans>
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

              <p className="mb-2 mt-10 font-bold">
                {t("downloadResponsesModals.confirmReceiptDialog.contentHeading")}
              </p>
              <p>{t("downloadResponsesModals.confirmReceiptDialog.contentBody")}</p>

              <div className="mt-4 flex gap-4">
                <Button theme="secondary" onClick={handleClose}>
                  {t("downloadResponsesModals.cancel")}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    status === DialogStates.SENDING || DialogStates[status].includes("ERROR")
                  }
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
