import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { isFormId } from "@lib/validation";
import { Button, useDialogRef, Dialog, LineItemEntries } from "@components/form-builder/app/shared";

export const DialogReportProblems = ({
  isShowDialog,
  setIsShowDialog,
}: {
  isShowDialog: boolean;
  setIsShowDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation("form-builder");
  const [formNumbers, setFormNumbers] = useState<string[]>([]);
  const validateFormNumber = (formId: string) => {
    return isFormId(formId);
  };
  const dialogReportProblems = useDialogRef();
  const dialogReportProblemsInstructionId =
    "dialog-report-problems-instruction-" + Math.random().toString(36).substr(2, 9);
  const dialogReportProblemsHandleClose = () => {
    setIsShowDialog(false);
    dialogReportProblems.current?.close();
  };
  const handleReportProblemSubmit = () => {
    //TODO
  };

  return (
    <>
      {isShowDialog && (
        <Dialog
          title={t("responses.reportProblemsDialog.title")}
          dialogRef={dialogReportProblems}
          handleClose={dialogReportProblemsHandleClose}
          headerStyle="inline-block ml-12 mt-12"
        >
          <div className="px-10 py-4">
            <p className="mb-8">{t("responses.reportProblemsDialog.findForm")}</p>
            <p id={dialogReportProblemsInstructionId} className="mt-20 mb-2 font-bold">
              {t("responses.reportProblemsDialog.enterFormNumbers")}
            </p>
            <LineItemEntries
              inputs={formNumbers}
              setInputs={setFormNumbers}
              validateInput={validateFormNumber}
              spellCheck={false}
              inputLabelId={dialogReportProblemsInstructionId}
            ></LineItemEntries>
            <p className="mt-8">{t("responses.reportProblemsDialog.problemReported")}</p>
            <div className="flex mt-8 mb-8">
              <Button className="mr-4" onClick={handleReportProblemSubmit}>
                {t("responses.reportProblemsDialog.reportProblems")}
              </Button>
              <Button theme="secondary" onClick={dialogReportProblemsHandleClose}>
                {t("cancel")}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};
