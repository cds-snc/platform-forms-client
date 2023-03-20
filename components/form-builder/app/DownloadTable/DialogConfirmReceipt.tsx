import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { isUUID } from "@lib/validation";
import { Button, useDialogRef, Dialog, LineItemEntries } from "@components/form-builder/app/shared";
import { randomId } from "@lib/uiUtils";
import axios from "axios";

export const DialogConfirmReceipt = ({
  formId,
  isShowDialog,
  setIsShowDialog,
}: {
  formId?: string;
  isShowDialog: boolean;
  setIsShowDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation("form-builder");
  const [codes, setCodes] = useState<string[]>([]);
  const dialogRef = useDialogRef();
  const maxEntries = 20;
  const confirmInstructionId = `dialog-confirm-receipt-instruction-${randomId()}`;

  const handleClose = () => {
    setIsShowDialog(false);
    dialogRef.current?.close();
    setCodes([]);
  };

  const handleSubmit = () => {
    const url = `/api/id/${formId}/submission/confirm`;
    return axios({
      url,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      data: codes,
    }).then((response) => {
      //todo
    });
    //TODO error responses see other axios examples
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
          <div className="px-10 py-4">
            <p className="mt-2">{t("downloadResponsesModals.confirmReceiptDialog.findCode")}</p>
            <p className="mt-10 mb-2 font-bold" id={confirmInstructionId}>
              {t("downloadResponsesModals.confirmReceiptDialog.copyCode", { max: maxEntries })}
            </p>
            <LineItemEntries
              inputs={codes}
              setInputs={setCodes}
              validateInput={isUUID}
              spellCheck={false}
              inputLabelId={confirmInstructionId}
              maxEntries={maxEntries}
            ></LineItemEntries>
            <p className="mt-8">
              {t("downloadResponsesModals.confirmReceiptDialog.responsesAvailableFor")}
            </p>
            <div className="flex mt-8 mb-8">
              <Button className="mr-4" onClick={handleSubmit}>
                {t("downloadResponsesModals.confirmReceiptDialog.confirmReceipt")}
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
