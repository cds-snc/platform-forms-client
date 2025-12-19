"use client";
import React, { useCallback } from "react";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { ga, getDate, slugify } from "@lib/client/clientHelpers";

export const DownloadFileButton = ({
  className,
  onClick,
  buttonText,
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
    </div>
  );
};
