import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { Button, useDialogRef, Dialog, LineItemEntries } from "@components/form-builder/app/shared";
import { randomId } from "@lib/clientHelpers";
import axios from "axios";
import { useRouter } from "next/router";
import { logMessage } from "@lib/logger";
import { Attention, AttentionTypes } from "@components/globals/Attention/Attention";
import Link from "next/link";
import { isFormId } from "@lib/validation";

export interface DialogErrors {
  unknown: boolean;
  minEntries: boolean;
  maxEntries: boolean;
  errorEntries: boolean;
  invalidEntry: boolean;
}

// TODO: move to an app setting variable
const MAX_REPORT_COUNT = 2; //20;

export const ReportDialog = ({
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
  const reportInstructionId = `dialog-report-instruction-${randomId()}`;

  // Server may respond with no formId, then any submissions would pointless so let the user know
  if (!formId) {
    logMessage.error(Error("Form ID missing."));
    setErrors({ ...errors, unknown: true });
  }
  const apiUrl = `/api/id/${formId}/submission/report`;

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
      .then(() => {
        // Refreshes getServerSideProps data without a full page reload
        router.replace(router.asPath);
        handleClose();
      })
      .catch((err) => {
        logMessage.error(err as Error);
        if (err?.response?.status === 400) {
          // Report API returns an error for 1 or more invalid Responses but not the failed codes
          setErrors({ ...errors, errorEntries: true });
        } else {
          setErrors({ ...errors, unknown: true });
        }
      });
  };

  return (
    <>
      {isShowDialog && (
        <Dialog
          title={t("downloadResponsesModals.reportProblemsDialog.title")}
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
                    "downloadResponsesModals.reportProblemsDialog.errors.minEntries.title"
                  )}
                  classes="mb-2"
                >
                  <p className="text-[#26374a] text-sm mb-2">
                    {t(
                      "downloadResponsesModals.reportProblemsDialog.errors.minEntries.description"
                    )}
                  </p>
                </Attention>
              )}
              {errors.maxEntries && (
                <Attention
                  type={AttentionTypes.ERROR}
                  isAlert={true}
                  heading={t(
                    "downloadResponsesModals.reportProblemsDialog.errors.maxEntries.title",
                    { max: MAX_REPORT_COUNT }
                  )}
                  classes="mb-2"
                >
                  <p className="text-[#26374a] text-sm mb-2">
                    {t(
                      "downloadResponsesModals.reportProblemsDialog.errors.maxEntries.description"
                    )}
                  </p>
                </Attention>
              )}
              {errors.errorEntries && (
                <Attention
                  type={AttentionTypes.ERROR}
                  isAlert={true}
                  heading={t(
                    "downloadResponsesModals.reportProblemsDialog.errors.errorEntries.title"
                  )}
                  classes="mb-2"
                >
                  <p className="text-[#26374a] text-sm mb-2">
                    {t(
                      "downloadResponsesModals.reportProblemsDialog.errors.errorEntries.description"
                    )}
                  </p>
                </Attention>
              )}
              {errors.invalidEntry && (
                <Attention
                  type={AttentionTypes.ERROR}
                  isAlert={true}
                  heading={t(
                    "downloadResponsesModals.reportProblemsDialog.errors.invalidEntry.title"
                  )}
                  classes="mb-2"
                >
                  <p className="text-[#26374a] text-sm mb-2">
                    {t(
                      "downloadResponsesModals.reportProblemsDialog.errors.invalidEntry.description"
                    )}
                  </p>
                </Attention>
              )}
              {errors.unknown && (
                <Attention
                  type={AttentionTypes.ERROR}
                  isAlert={true}
                  heading={t("downloadResponsesModals.reportProblemsDialog.errors.unknown.title")}
                  classes="mb-2"
                >
                  <p className="text-[#26374a] text-sm mb-2">
                    {t("downloadResponsesModals.reportProblemsDialog.errors.unknown.description")}
                    <Link href={"/form-builder/support"}>
                      {t(
                        "downloadResponsesModals.reportProblemsDialog.errors.unknown.descriptionLink"
                      )}
                    </Link>
                    .
                  </p>
                </Attention>
              )}
            </div>
            <div className="py-4">
              <p className="mt-2">{t("downloadResponsesModals.reportProblemsDialog.findForm")}</p>
              <p className="mt-10 mb-2 font-bold" id={reportInstructionId}>
                {t("downloadResponsesModals.reportProblemsDialog.enterFormNumbers", {
                  max: MAX_REPORT_COUNT,
                })}
              </p>

              <LineItemEntries
                inputs={entries}
                setInputs={setEntries}
                validateInput={isFormId}
                spellCheck={false}
                inputLabelId={reportInstructionId}
                maxEntries={MAX_REPORT_COUNT}
                errors={errors}
                setErrors={setErrors}
                errorEntriesList={errorEntriesList}
              ></LineItemEntries>

              <p className="mt-8">
                {t("downloadResponsesModals.reportProblemsDialog.problemReported")}
              </p>
              <div className="flex mt-8 mb-8">
                <Button className="mr-4" onClick={handleSubmit}>
                  {t("downloadResponsesModals.reportProblemsDialog.reportProblems")}
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
