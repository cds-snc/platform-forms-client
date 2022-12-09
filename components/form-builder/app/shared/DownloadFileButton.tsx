import React, { useCallback, useState } from "react";
import { useTranslation } from "next-i18next";
import Markdown from "markdown-to-jsx";
import Image from "next/image";

import { useTemplateStore } from "../../store/useTemplateStore";
import { Button } from "./Button";
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
    <Dialog dialogRef={dialog} handleClose={handleClose}>
      <>
        <Image
          layout="responsive"
          width={"690"}
          height={"382"}
          alt=""
          className="inline-block mb-10 w-full"
          src="/img/form-builder-file-import.png"
        />
        <Markdown options={{ forceBlock: true }}>{t("formDownload.dialogMessage")}</Markdown>
      </>
    </Dialog>
  );
};

export const DownloadFileButton = ({
  className,
  onClick,
}: {
  className?: string;
  onClick?: any; // eslint-disable-line  @typescript-eslint/no-explicit-any
}) => {
  const { t } = useTranslation("form-builder");
  const { getSchema, form } = useTemplateStore((s) => ({
    getSchema: s.getSchema,
    form: s.form,
  }));

  const [downloadDialog, showDownloadDialog] = useState(false);

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
        onClick={() => {
          downloadfile();
          onClick && onClick();
        }}
      >
        {t("formDownload.downloadBtnText")}
      </Button>
      <InfoIcon className="ml-4 inline-block" />
      <div className="ml-2 inline-block">
        <Button onClick={handleOpenDialog} theme="link">
          {t("formDownload.btnText")}
        </Button>
        {downloadDialog && <FormDownloadDialog handleClose={handleCloseDialog} />}
      </div>
    </div>
  );
};
