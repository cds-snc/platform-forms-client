import React from "react";
import { useDialogRef, Dialog } from "./Dialog";
import { useTranslation } from "next-i18next";
import Image from "next/image";

import { Button } from "./Button";
import { DownloadFileButton } from "./DownloadFileButton";
export const ConfirmFormDeleteDialog = ({
  handleConfirm,
  handleClose,
  isPublished,
}: {
  handleConfirm: () => void;
  handleClose: () => void;
  isPublished?: boolean;
}) => {
  const dialog = useDialogRef();
  const { t } = useTranslation("form-builder");

  const actions = (
    <>
      <DownloadFileButton showInfo={false} buttonText={t("formDelete.downloadButtonText")} />
      <Button
        className="ml-5"
        theme="destructive"
        onClick={() => {
          dialog.current?.close();
          handleClose();
          handleConfirm();
        }}
      >
        {t("formDelete.okay")}
      </Button>
    </>
  );

  return (
    <Dialog handleClose={handleClose} dialogRef={dialog} actions={actions}>
      <div className="p-5">
        <div className="px-10 flex justify-center">
          <Image
            layout="fixed"
            width={"288"}
            height={"206"}
            alt=""
            className="block center"
            src="/img/form-builder-delete-dialog.svg"
          />
        </div>
        <div className="mt-10">
          <h2>{t("formDelete.title")}</h2>

          {isPublished ? (
            <>
              <p className="mb-6">{t("formDelete.published.message1")}</p>
              <p>
                {t("formDelete.published.message2")}{" "}
                <span className="font-bold">{t("formDelete.published.message3")}</span>
              </p>
            </>
          ) : (
            <>
              <p className="mb-6">{t("formDelete.draft.message1")}</p>
              <p>{t("formDelete.draft.message2")}</p>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
};
