"use client";
import React, { useCallback, useState } from "react";
import { useTranslation } from "@i18n/client";
import Image from "next/image";

import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { InfoIcon } from "@serverComponents/icons";
import { ga, getDate, slugify } from "@lib/client/clientHelpers";
import { Dialog, useDialogRef } from "./Dialog";

const FormDownloadDialog = ({ handleClose }: { handleClose: () => void }) => {
  const { t } = useTranslation("form-builder");
  const dialog = useDialogRef();

  return (
    <Dialog
      dialogRef={dialog}
      handleClose={handleClose}
      title={t("formDownload.dialog.title")}
      className="max-h-[80%] overflow-y-scroll"
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
          <h3 className="mb-1">{t("formDownload.dialog.subtitle1")}</h3>
          <p className="mb-10">{t("formDownload.dialog.message1")}</p>
          <h3 className="mb-1 mt-6">{t("formDownload.dialog.subtitle2")}</h3>
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
  theme = "secondary",
}: {
  className?: string;
  onClick?: any; // eslint-disable-line  @typescript-eslint/no-explicit-any
  showInfo?: boolean;
  buttonText?: string;
  autoShowDialog?: boolean;
  theme?: "primary" | "secondary";
}) => {
  const { t, i18n } = useTranslation("form-builder");
  const { getSchema, form, name } = useTemplateStore((s) => ({
    getSchema: s.getSchema,
    form: s.form,
    name: s.name,
  }));

  const [downloadDialog, showDownloadDialog] = useState(autoShowDialog);

  const downloadfile = useCallback(async () => {
    async function retrieveFileBlob() {
      try {
        const blob = new Blob([getSchema()], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const fileName = name ? name : i18n.language === "fr" ? form.titleFr : form.titleEn;

        a.href = url;
        a.download = slugify(`${fileName}-${getDate()}`) + ".json";
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        alert("error creating file download");
      }
    }

    retrieveFileBlob();
  }, [getSchema, name, i18n.language, form.titleFr, form.titleEn]);

  const handleOpenDialog = useCallback(() => {
    showDownloadDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    showDownloadDialog(false);
  }, []);

  const downloadFileEvent = () => {
    const formTitle = slugify(name ? name : i18n.language === "fr" ? form.titleFr : form.titleEn);
    const formId = form.id;

    ga("form_download", {
      formTitle,
      formId,
      submitTime: getDate(true),
    });
  };

  return (
    <div>
      <Button
        className={className}
        theme={theme}
        onClick={() => {
          downloadfile();
          downloadFileEvent();
          onClick && onClick();
        }}
        dataTestId="download-file-button"
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
