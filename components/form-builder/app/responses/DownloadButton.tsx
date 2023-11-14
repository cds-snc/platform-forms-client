import { TypeOmit, VaultSubmission } from "@lib/types";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "../shared";
import axios from "axios";
import { logMessage } from "@lib/logger";

export const DownloadButton = ({
  formId,
  onSuccessfulDownload,
  downloadError,
  setDownloadError,
  noSelectedItemsError,
  setNoSelectedItemsError,
  tableItems,
  responseDownloadLimit,
}: {
  formId: string;
  onSuccessfulDownload: () => void;
  downloadError: boolean;
  setDownloadError: React.Dispatch<React.SetStateAction<boolean>>;
  noSelectedItemsError: boolean;
  setNoSelectedItemsError: React.Dispatch<React.SetStateAction<boolean>>;
  tableItems: {
    checkedItems: Map<string, boolean>;
    statusItems: Map<string, boolean>;
    sortedItems: TypeOmit<
      VaultSubmission,
      "formSubmission" | "submissionID" | "confirmationCode"
    >[];
    numberOfOverdueResponses: number;
  };
  responseDownloadLimit: number;
}) => {
  const { t } = useTranslation("form-builder-responses");
  const MAX_FILE_DOWNLOADS = responseDownloadLimit;

  // NOTE: browsers have different limits for simultaneous downloads. May need to look into
  // batching file downloads (e.g. 4 at a time) if edge cases/* come up.
  const handleDownload = async () => {
    // Reset any errors
    if (downloadError) {
      setDownloadError(false);
    }

    // Can't download if none selected
    if (tableItems.checkedItems.size === 0) {
      if (!noSelectedItemsError) {
        setNoSelectedItemsError(true);
      }
      return;
    }

    // Don't download if too many selected
    if (tableItems.checkedItems.size > MAX_FILE_DOWNLOADS) {
      return;
    }

    toast.info(
      t("downloadResponsesTable.notifications.downloadingXFiles", {
        fileCount: tableItems.checkedItems.size,
      })
    );

    const url = `/api/id/${formId}/submissions/download?format=html`;
    const ids = Array.from(tableItems.checkedItems.keys());

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
      className="gc-button--blue m-0 w-auto whitespace-nowrap"
      aria-live="polite"
      onClick={handleDownload}
    >
      {t("downloadResponsesTable.downloadXSelectedResponses", {
        size: tableItems.checkedItems.size,
      })}
    </button>
  );
};
