import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { Button, useDialogRef, Dialog, LineItemEntries } from "@components/form-builder/app/shared";
import { randomId } from "@lib/clientHelpers";
import axios from "axios";
import { useRouter } from "next/router";
import { logMessage } from "@lib/logger";
import { Attention, AttentionTypes } from "@components/globals/Attention/Attention";
import Link from "next/link";

export interface DialogErrors {
  client: boolean;
  unknown: boolean;
  minEntries: boolean;
  maxEntries: boolean;
  invalidEntries: boolean; //TODO
}

export const DownloadTableDialog = ({
  isShowDialog,
  setIsShowDialog,
  apiUrl,
  inputRegex,
  maxEntries,
  minEntriesErrorTitle,
  minEntriesErrorDescription,
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
  minEntriesErrorTitle: string;
  minEntriesErrorDescription: string;
  title: string;
  description: string;
  inputHelp: string;
  nextSteps: string;
  submitButtonText: string;
}) => {
  const { t } = useTranslation("form-builder-responses");
  const router = useRouter();
  const [entries, setEntries] = useState<string[]>([]);
  const [errors, setErrors] = useState({
    client: false,
    unknown: false,
    minEntries: false,
    maxEntries: false,
    invalidEntries: false, //TODO
  });
  const dialogRef = useDialogRef();
  const confirmInstructionId = `dialog-confirm-receipt-instruction-${randomId()}`;

  useEffect(() => {
    if (errors.minEntries && entries.length > 0) {
      setErrors({ ...errors, minEntries: false });
    }
  }, [errors, entries]);

  const handleClose = () => {
    setIsShowDialog(false);
    setEntries([]);
    setErrors({
      client: false,
      unknown: false,
      minEntries: false,
      maxEntries: false,
      invalidEntries: false,
    });
    dialogRef.current?.close();
  };

  const handleSubmit = () => {
    setErrors({
      client: false,
      unknown: false,
      minEntries: false,
      maxEntries: false,
      invalidEntries: false,
    });

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
      .then(() => {
        // Refreshes getServerSideProps data without a full page reload
        router.replace(router.asPath);
        handleClose();
      })
      .catch((err) => {
        logMessage.error(err as Error);
        if (err?.response?.status === 400) {
          setErrors({ ...errors, client: true });
        } else {
          setErrors({ ...errors, unknown: true });
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
          <div className="px-10">
            <div>
              {errors.minEntries && (
                <Attention
                  type={AttentionTypes.ERROR}
                  isAlert={true}
                  heading={minEntriesErrorTitle}
                >
                  <p className="text-[#26374a] text-sm mb-2">{minEntriesErrorDescription}</p>
                </Attention>
              )}
              {errors.maxEntries && (
                <Attention
                  type={AttentionTypes.ERROR}
                  isAlert={true}
                  heading={t("lineItemEntries.notifications.maxEntriesTitle", {
                    max: maxEntries,
                  })}
                >
                  <p className="text-[#26374a] text-sm mb-2">
                    {t("lineItemEntries.notifications.maxEntriesDescription")}
                  </p>
                </Attention>
              )}
              {errors.client && (
                <Attention
                  type={AttentionTypes.ERROR}
                  isAlert={true}
                  heading={t("downloadResponsesModals.notifications.clientEntryHeader")}
                >
                  <p className="text-[#26374a] text-sm mb-2">
                    {t("downloadResponsesModals.notifications.clientEntryDescription")}
                  </p>
                </Attention>
              )}
              {errors.unknown && (
                <Attention
                  type={AttentionTypes.ERROR}
                  isAlert={true}
                  heading={t("downloadResponsesModals.notifications.unknownErrorHeader")}
                >
                  <p className="text-[#26374a] text-sm mb-2">
                    {t("downloadResponsesModals.notifications.unknownErrorDescription")}
                    <Link href={"/form-builder/support"}>
                      {t("downloadResponsesModals.notifications.unknownErrorDescriptionLink")}
                    </Link>
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
