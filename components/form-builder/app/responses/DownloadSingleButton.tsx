import { DownloadIcon } from "@components/form-builder/icons";
import { logMessage } from "@lib/logger";
import axios from "axios";
import React from "react";
import { useTranslation } from "react-i18next";

export const DownloadSingleButton = ({
  id,
  formId,
  responseId,
  setDownloadError,
  onDownloadSuccess,
  ariaLabelledBy,
}: {
  id: string;
  formId: string;
  responseId: string;
  setDownloadError: (downloadError: boolean) => void;
  onDownloadSuccess: () => void;
  ariaLabelledBy: string;
}) => {
  const { t } = useTranslation("form-builder-responses");

  const handleDownload = () => {
    const url = `/api/id/${formId}/submission/download?format=html`;

    axios({
      url,
      method: "POST",
      data: {
        ids: responseId,
      },
    })
      .then((response) => {
        const interval = 200;
        const submission = response.data[0];
        const fileName = `${submission.id}.html`;
        const href = window.URL.createObjectURL(new Blob([submission.html]));
        const anchorElement = document.createElement("a");
        anchorElement.href = href;
        anchorElement.download = fileName;
        document.body.appendChild(anchorElement);
        anchorElement.click();
        document.body.removeChild(anchorElement);
        window.URL.revokeObjectURL(href);

        setTimeout(() => {
          onDownloadSuccess();
        }, interval);
      })
      .catch((err) => {
        logMessage.error(err as Error);
        setDownloadError(true);
      });
  };

  return (
    <button
      id={id}
      onClick={handleDownload}
      className="rounded border-2 border-white active:border-blue-focus"
      aria-labelledby={`${id} ${ariaLabelledBy}`}
    >
      <DownloadIcon className="inline-block scale-50" />
      <span className="sr-only">{t("downloadResponsesTable.header.download")}</span>
    </button>
  );
};
