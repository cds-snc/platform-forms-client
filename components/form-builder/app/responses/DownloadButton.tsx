import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "../shared";
import axios from "axios";
import { logMessage } from "@lib/logger";

export const DownloadButton = ({
  formId,
  onSuccessfulDownload,
  canDownload,
  downloadError,
  setDownloadError,
  setNoSelectedItemsError,
  checkedItems,
}: {
  formId: string;
  onSuccessfulDownload: () => void;
  canDownload: boolean;
  downloadError: boolean;
  setDownloadError: React.Dispatch<React.SetStateAction<boolean>>;
  setNoSelectedItemsError: React.Dispatch<React.SetStateAction<boolean>>;
  checkedItems: Map<string, boolean>;
}) => {
  const { t } = useTranslation("form-builder-responses");

  const handleDownload = async () => {
    // Reset any errors
    if (downloadError) {
      setDownloadError(false);
    }

    // Can't download if none selected
    if (checkedItems.size === 0) {
      setNoSelectedItemsError(true);
      return;
    }

    // Don't download if too many selected
    if (!canDownload) {
      return;
    }

    toast.info(
      t("downloadResponsesTable.notifications.downloadingXFiles", {
        fileCount: checkedItems.size,
      })
    );

    const url = `/api/id/${formId}/submission/download?format=html`;
    const ids = Array.from(checkedItems.keys());

    axios({
      url,
      method: "POST",
      data: {
        ids: ids.join(","),
      },
    })
      .then((response) => {
        const interval = 200;
        response.data.forEach((submission: { id: string; html: string }, i: number) => {
          setTimeout(() => {
            const fileName = `${submission.id}.html`;
            const href = window.URL.createObjectURL(new Blob([submission.html]));
            const anchorElement = document.createElement("a");
            anchorElement.href = href;
            anchorElement.download = fileName;
            document.body.appendChild(anchorElement);
            anchorElement.click();
            document.body.removeChild(anchorElement);
            window.URL.revokeObjectURL(href);
          }, interval * i);
        });
        setTimeout(() => {
          onSuccessfulDownload();
        }, interval * response.data.length);
      })
      .catch((err) => {
        logMessage.error(err as Error);
        setDownloadError(true);
      });
  };

  return (
    <button
      id="downloadTableButtonId"
      className="gc-button--blue m-0 w-auto whitespace-nowrap"
      aria-live="polite"
      onClick={handleDownload}
    >
      {t("downloadResponsesTable.downloadSelectedResponses")}
    </button>
  );
};
