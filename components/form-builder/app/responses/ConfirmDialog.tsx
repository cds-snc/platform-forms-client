import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { Button, useDialogRef, Dialog, LineItemEntries } from "@components/form-builder/app/shared";
import { randomId } from "@lib/clientHelpers";
import axios from "axios";
import { useRouter } from "next/router";
import { logMessage } from "@lib/logger";
import { Attention, AttentionTypes } from "@components/globals/Attention/Attention";
import Link from "next/link";
import { isUUID } from "@lib/validation";

export interface DialogErrors {
  unknown: boolean;
  minEntries: boolean;
  maxEntries: boolean;
  errorEntries: boolean;
  invalidEntry: boolean;
}

// TODO: move to an app setting variable
const MAX_CONFIRMATION_COUNT = 20;

export const ConfirmDialog = ({
  isShowDialog,
  setIsShowDialog,
  formId,
}: {
  isShowDialog: boolean;
  setIsShowDialog: React.Dispatch<React.SetStateAction<boolean>>;
  formId: string | undefined;
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

  // Server may respond with no formId, then any submissions would pointless so let the user know
  if (!formId) {
    logMessage.error(Error("Form ID missing."));
    setErrors({ ...errors, unknown: true });
  }
  const apiUrl = `/api/id/${formId}/submission/confirm`;

  useEffect(() => {
    if (errors.minEntries && entries.length > 0) {
      setErrors({ ...errors, minEntries: false });
    }
  }, [errors, entries]);

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
        // Confirmation API returns success with an error and 1 or more invalid codes
        if (data?.invalidConfirmationCodes && data.invalidConfirmationCodes?.length > 0) {
          // Note: why a list of entries and another list for invalid entries? This makes showing
          // only the invalid entries a lot easier in the LineItems component
          setErrorEntriesList(data.invalidConfirmationCodes);
          setEntries(data.invalidConfirmationCodes);

          setErrors({ ...errors, errorEntries: true });
          return;
        }

        // Refreshes getServerSideProps data without a full page reload
        router.replace(router.asPath);
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
          title={t("downloadResponsesModals.confirmReceiptDialog.title")}
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
                  heading={t(
                    "downloadResponsesModals.confirmReceiptDialog.errors.minEntries.title"
                  )}
                  classes="mb-2"
                >
                  <p className="text-[#26374a] text-sm mb-2">
                    {t(
                      "downloadResponsesModals.confirmReceiptDialog.errors.minEntries.description"
                    )}
                  </p>
                </Attention>
              )}
              {errors.maxEntries && (
                <Attention
                  type={AttentionTypes.ERROR}
                  isAlert={true}
                  heading={t(
                    "downloadResponsesModals.confirmReceiptDialog.errors.maxEntries.title",
                    { max: MAX_CONFIRMATION_COUNT }
                  )}
                  classes="mb-2"
                >
                  <p className="text-[#26374a] text-sm mb-2">
                    {t(
                      "downloadResponsesModals.confirmReceiptDialog.errors.maxEntries.description"
                    )}
                  </p>
                </Attention>
              )}
              {errors.errorEntries && (
                <Attention
                  type={AttentionTypes.ERROR}
                  isAlert={true}
                  heading={t(
                    "downloadResponsesModals.confirmReceiptDialog.errors.errorEntries.title",
                    { max: MAX_CONFIRMATION_COUNT }
                  )}
                  classes="mb-2"
                >
                  <p className="text-[#26374a] text-sm mb-2">
                    {t(
                      "downloadResponsesModals.confirmReceiptDialog.errors.errorEntries.description"
                    )}
                  </p>
                </Attention>
              )}
              {errors.invalidEntry && (
                <Attention
                  type={AttentionTypes.ERROR}
                  isAlert={true}
                  heading={t(
                    "downloadResponsesModals.confirmReceiptDialog.errors.invalidEntry.title"
                  )}
                  classes="mb-2"
                >
                  <p className="text-[#26374a] text-sm mb-2">
                    {t(
                      "downloadResponsesModals.confirmReceiptDialog.errors.invalidEntry.description"
                    )}
                  </p>
                </Attention>
              )}
              {errors.unknown && (
                <Attention
                  type={AttentionTypes.ERROR}
                  isAlert={true}
                  heading={t("downloadResponsesModals.confirmReceiptDialog.errors.unknown.title")}
                  classes="mb-2"
                >
                  <p className="text-[#26374a] text-sm mb-2">
                    {t("downloadResponsesModals.confirmReceiptDialog.errors.unknown.description")}
                    <Link href={"/form-builder/support"}>
                      {t(
                        "downloadResponsesModals.confirmReceiptDialog.errors.unknown.descriptionLink"
                      )}
                    </Link>
                    .
                  </p>
                </Attention>
              )}
            </div>
            <div className="py-4">
              <p className="mt-2">{t("downloadResponsesModals.confirmReceiptDialog.findCode")}</p>
              <p className="mt-10 mb-2 font-bold" id={confirmInstructionId}>
                {t("downloadResponsesModals.confirmReceiptDialog.copyCode", {
                  max: MAX_CONFIRMATION_COUNT,
                })}
              </p>

              <LineItemEntries
                inputs={entries}
                setInputs={setEntries}
                validateInput={isUUID}
                spellCheck={false}
                inputLabelId={confirmInstructionId}
                maxEntries={MAX_CONFIRMATION_COUNT}
                errors={errors}
                setErrors={setErrors}
                errorEntriesList={errorEntriesList}
              ></LineItemEntries>

              <p className="mt-8">
                {t("downloadResponsesModals.confirmReceiptDialog.responsesAvailableFor")}
              </p>
              <div className="flex mt-8 mb-8">
                <Button className="mr-4" onClick={handleSubmit}>
                  {t("downloadResponsesModals.confirmReceiptDialog.confirmReceipt")}
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
