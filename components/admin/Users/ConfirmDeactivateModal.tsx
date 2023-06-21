import React from "react";
import { useTranslation } from "next-i18next";
import { FormElementTypes } from "@lib/types";
import { Button } from "@components/globals";
import { Dialog, useDialogRef } from "@components/form-builder/app/shared";

export const ConfirmDeactivateModal = ({
  handleClose,
  handleDeactivate,
}: {
  handleAddType?: (type?: FormElementTypes) => void;
  handleClose: () => void;
  handleDeactivate: () => void;
}) => {
  const { t } = useTranslation("admin-users");

  const dialog = useDialogRef();

  const actions = (
    <>
      <Button
        className=""
        theme="primary"
        onClick={async () => {
          handleDeactivate();
          dialog.current?.close();
          handleClose();
        }}
      >
        {t("deactivateAccount")}
      </Button>
      <Button
        className="ml-5"
        theme="secondary"
        onClick={() => {
          dialog.current?.close();
          handleClose();
        }}
      >
        {t("cancel")}
      </Button>
    </>
  );

  return (
    <div className="form-builder">
      <Dialog
        title={t("share.title")}
        dialogRef={dialog}
        handleClose={handleClose}
        actions={actions}
        className="max-h-[80%] overflow-y-scroll"
      >
        <div className="my-8">Huzzah</div>
      </Dialog>
    </div>
  );
};
