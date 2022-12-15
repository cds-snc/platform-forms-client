import React, { useCallback, useState } from "react";
import { useTranslation } from "next-i18next";
import Image from "next/image";

import { Button } from "./Button";
import { useTemplateStore } from "../../store";
import { useDialogRef, Dialog } from "../shared";
import { InfoIcon } from "../../icons";

const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getDate = () => {
  let date = new Date();
  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() - offset * 60 * 1000);
  return date.toISOString().split("T")[0];
};

const FormDownloadDialog = ({ handleClose }: { handleClose: () => void }) => {
  const { t } = useTranslation("form-builder");
  const dialog = useDialogRef();

  return (
    <Dialog
      dialogRef={dialog}
      handleClose={handleClose}
      actions={
        <DownloadFileButton
          showInfo={false}
          buttonText={t("formDownload.dialog.downloadButtonText")}
        />
      }
    >
      <div className="p-5">
        <div className="px-10">
          <Image
            layout="responsive"
            width={"597"}
            height={"480"}
            alt=""
            className="block w-full"
            src="/img/form-builder-download.svg"
          />
        </div>
        <div className="mt-10">
          <h2>{t("formDownload.dialog.title")}</h2>
          <h3 className="mb-1">{t("formDownload.dialog.subtitle1")}</h3>
          <p className="mb-10">{t("formDownload.dialog.message1")}</p>
          <h3 className="mt-6 mb-1">{t("formDownload.dialog.subtitle2")}</h3>
          <p className="mb-2">{t("formDownload.dialog.message2")}</p>
        </div>
      </div>
    </Dialog>
  );
};

export const DownloadFileButton = ({
  className,
  onClick,
  showInfo = true,
  buttonText,
  autoShowDialog = false,
}: {
  className?: string;
  onClick?: any; // eslint-disable-line  @typescript-eslint/no-explicit-any
  showInfo?: boolean;
  buttonText?: string;
  autoShowDialog?: boolean;
}) => {
  const { t } = useTranslation("form-builder");
  const { getSchema, form } = useTemplateStore((s) => ({
    getSchema: s.getSchema,
    form: s.form,
  }));

  const [downloadDialog, showDownloadDialog] = useState(autoShowDialog);

  const downloadfile = useCallback(async () => {
    async function retrieveFileBlob() {
      try {
        const blob = new Blob([getSchema()], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = slugify(`${form.titleEn}-${getDate()}`);
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        alert("error creating file download");
      }
    }

    retrieveFileBlob();
  }, [getSchema]);

  const handleOpenDialog = useCallback(() => {
    showDownloadDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    showDownloadDialog(false);
  }, []);

  return (
    <div>
      <Button
        className={className}
        theme="secondary"
        onClick={() => {
          downloadfile();
          onClick && onClick();
        }}
      >
        {buttonText ? buttonText : t("formDownload.downloadBtnText")}
      </Button>
      {showInfo && (
        <>
          <InfoIcon className="ml-4 inline-block" />
          <div className="ml-2 inline-block">
            <Button onClick={handleOpenDialog} theme="link">
              {t("formDownload.btnText")}
            </Button>
            {downloadDialog && <FormDownloadDialog handleClose={handleCloseDialog} />}
          </div>
        </>
      )}
    </div>
  );
};
