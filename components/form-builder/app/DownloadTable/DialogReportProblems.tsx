import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { isFormId } from "@lib/validation";
import { Button, useDialogRef, Dialog, LineItemEntries } from "@components/form-builder/app/shared";
import { randomId } from "@lib/uiUtils";
import axios from "axios";
import { useRouter } from "next/router";
import { logMessage } from "@lib/logger";

export const DialogReportProblems = ({
  formId,
  isShowDialog,
  setIsShowDialog,
}: {
  formId?: string;
  isShowDialog: boolean;
  setIsShowDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation("form-builder-responses");
  const router = useRouter();
  const [formNumbers, setFormNumbers] = useState<string[]>([]);
  const dialogRef = useDialogRef();
  const maxEntries = 20;
  const problemsInstructionId = `dialog-report-problems-instruction-${randomId()}`;

  const handleClose = () => {
    setIsShowDialog(false);
    dialogRef.current?.close();
    setFormNumbers([]);
  };

  const handleSubmit = () => {
    const url = `/api/id/${formId}/submission/report`;
    return axios({
      url,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      data: formNumbers,
    })
      .then(() => {
        // Refreshes getServerSideProps data without a full page reload
        router.replace(router.asPath);
        handleClose();
      })
      .catch((err) => {
        logMessage.error(err as Error);
        // TODO: show error in dialog?
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
          <div className="px-10 py-4">
            <p className="mt-2">{t("downloadResponsesModals.reportProblemsDialog.findForm")}</p>
            <p id={problemsInstructionId} className="mt-10 mb-2 font-bold">
              {t("downloadResponsesModals.reportProblemsDialog.enterFormNumbers", {
                max: maxEntries,
              })}
            </p>
            <LineItemEntries
              inputs={formNumbers}
              setInputs={setFormNumbers}
              validateInput={isFormId}
              spellCheck={false}
              inputLabelId={problemsInstructionId}
              maxEntries={maxEntries}
            ></LineItemEntries>
            <p className="mt-8">
              {t("downloadResponsesModals.reportProblemsDialog.problemReported")}
            </p>
            <div className="flex mt-8 mb-8">
              <Button className="mr-4" onClick={handleSubmit}>
                {t("downloadResponsesModals.reportProblemsDialog.reportProblems")}
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
