import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { isFormId } from "@lib/validation";
import { Button, useDialogRef, Dialog, LineItemEntries } from "@components/form-builder/app/shared";
import { randomId } from "@lib/uiUtils";

export const DialogReportProblems = ({
  isShowDialog,
  setIsShowDialog,
}: {
  isShowDialog: boolean;
  setIsShowDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation("form-builder");
  const [formNumbers, setFormNumbers] = useState<string[]>([]);
  const dialogRef = useDialogRef();
  const maxEntries = 20;
  const problemsInstructionId = `dialog-report-problems-instruction-${randomId()}`;

  const handleClose = () => {
    setIsShowDialog(false);
    dialogRef.current?.close();
  };

  const handleSubmit = () => {
    //TODO
  };

  return (
    <>
      {isShowDialog && (
        <Dialog
          title={t("responses.reportProblemsDialog.title")}
          dialogRef={dialogRef}
          handleClose={handleClose}
          headerStyle="inline-block ml-12 mt-12"
        >
          <div className="px-10 py-4">
            <p className="mb-8">{t("responses.reportProblemsDialog.findForm")}</p>
            <p id={problemsInstructionId} className="mt-20 mb-2 font-bold">
              {t("responses.reportProblemsDialog.enterFormNumbers", { max: maxEntries })}
            </p>
            <LineItemEntries
              inputs={formNumbers}
              setInputs={setFormNumbers}
              validateInput={isFormId}
              spellCheck={false}
              inputLabelId={problemsInstructionId}
              maxEntries={maxEntries}
            ></LineItemEntries>
            <p className="mt-8">{t("responses.reportProblemsDialog.problemReported")}</p>
            <div className="flex mt-8 mb-8">
              <Button className="mr-4" onClick={handleSubmit}>
                {t("responses.reportProblemsDialog.reportProblems")}
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
