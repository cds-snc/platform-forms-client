import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { isUUID } from "@lib/validation";
import { Button, useDialogRef, Dialog, LineItemEntries } from "@components/form-builder/app/shared";

export const DialogConfirmReceipt = ({
  isShowDialog,
  setIsShowDialog,
}: {
  isShowDialog: boolean;
  setIsShowDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation("form-builder");
  const [codes, setCodes] = useState<string[]>([]);
  const validateCodes = (code: string) => {
    return isUUID(code);
  };
  const dialogConfirmReceipt = useDialogRef();
  const dialogConfirmReceiptInstructionId =
    "dialog-confirm-receipt-instruction-" + Math.random().toString(36).substr(2, 9);
  const dialogConfirmReceiptHandleClose = () => {
    setIsShowDialog(false);
    dialogConfirmReceipt.current?.close();
  };
  const handleConfirmReceiptSubmit = () => {
    //TODO
  };

  return (
    <>
      {isShowDialog && (
        <Dialog
          title={t("responses.confirmReceiptDialog.title")}
          dialogRef={dialogConfirmReceipt}
          handleClose={dialogConfirmReceiptHandleClose}
          headerStyle="inline-block ml-12 mt-12"
        >
          <div className="px-10 py-4">
            <p className="mb-8">{t("responses.confirmReceiptDialog.findCode")}</p>
            <p className="mt-20 mb-2 font-bold" id={dialogConfirmReceiptInstructionId}>
              {t("responses.confirmReceiptDialog.copyCode")}
            </p>
            <LineItemEntries
              inputs={codes}
              setInputs={setCodes}
              validateInput={validateCodes}
              spellCheck={false}
              inputLabelId={dialogConfirmReceiptInstructionId}
            ></LineItemEntries>
            <p className="mt-8">{t("responses.confirmReceiptDialog.responsesAvailableFor")}</p>
            <div className="flex mt-8 mb-8">
              <Button className="mr-4" onClick={handleConfirmReceiptSubmit}>
                {t("responses.confirmReceipt")}
              </Button>
              <Button theme="secondary" onClick={dialogConfirmReceiptHandleClose}>
                {t("cancel")}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
};
