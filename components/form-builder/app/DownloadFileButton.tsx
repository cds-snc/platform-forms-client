import React, { useCallback } from "react";
import { useTranslation } from "next-i18next";

import { useTemplateStore } from "../store/useTemplateStore";
import { Button } from "./shared/Button";

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

  return (
    <Button
      className={className}
      onClick={() => {
        downloadfile();
        onClick && onClick();
      }}
    >
      {t("saveButton")}
    </Button>
  );
};
