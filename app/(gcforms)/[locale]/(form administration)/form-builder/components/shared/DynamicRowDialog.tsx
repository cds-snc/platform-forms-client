"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { useDialogRef, Dialog } from "./Dialog";

export const TextInput = ({ label }: { label: string }) => {
  return (
    <div className="mb-4 flex rounded-md border-1 border-black">
      <label className="block rounded-l-md border-r-1 border-black bg-slate-50 p-4 text-sm">
        {label}
      </label>
      <input className="block w-full rounded-r-md p-2 outline-offset-[-5px]"></input>
    </div>
  );
};

export const DynamicRowDialog = ({
  handleConfirm,
  handleClose,
}: {
  handleClose: () => void;
  handleConfirm: () => void;
}) => {
  const dialog = useDialogRef();
  const { t } = useTranslation("form-builder");

  const actions = (
    <>
      <Button
        theme="secondary"
        onClick={() => {
          dialog.current?.close();
          handleClose && handleClose();
        }}
      >
        {t("dynamicRow.dialog.cancel")}
      </Button>
      <Button
        className="ml-5"
        theme="primary"
        onClick={() => {
          dialog.current?.close();
          handleClose && handleClose();
          handleConfirm();
        }}
        dataTestId="confirm-delete"
      >
        {t("dynamicRow.dialog.save")}
      </Button>
    </>
  );

  return (
    <Dialog
      handleClose={handleClose}
      dialogRef={dialog}
      actions={actions}
      title={t("dynamicRow.dialog.title")}
    >
      <div className="p-5">
        {/* Add button */}
        <div className="mb-8">
          <h4 className="mb-4 block font-bold">{t("dynamicRow.dialog.addButton.title")}</h4>
          <p className="mb-4 text-sm">{t("dynamicRow.dialog.addButton.description")}</p>
          <TextInput label={t("dynamicRow.dialog.english")} />
          <TextInput label={t("dynamicRow.dialog.french")} />
        </div>

        {/* Remove button */}
        <div>
          <label className="mb-4 block font-bold">
            {t("dynamicRow.dialog.removeButton.title")}
          </label>
          <p className="mb-4 text-sm">{t("dynamicRow.dialog.removeButton.description")}</p>
          <TextInput label={t("dynamicRow.dialog.english")} />
          <TextInput label={t("dynamicRow.dialog.french")} />
        </div>
      </div>
    </Dialog>
  );
};
