import { TypeOmit, VaultSubmission } from "@lib/types";
import { NextRouter } from "next/router";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "../shared";
import axios from "axios";
import { logMessage } from "@lib/logger";

export const DownloadButton = ({
  formId,
  router,
  errors,
  setErrors,
  tableItems,
  responseDownloadLimit,
}: {
  formId: string;
  router: NextRouter;
  errors: {
    downloadError: boolean;
    maxItemsError: boolean;
    noItemsError: boolean;
  };
  setErrors: React.Dispatch<
    React.SetStateAction<{
      downloadError: boolean;
      maxItemsError: boolean;
      noItemsError: boolean;
    }>
  >;
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
    if (errors.downloadError) {
      setErrors({ ...errors, downloadError: false });
    }

    // Handle any errors and show them
    if (tableItems.checkedItems.size === 0) {
      if (!errors.noItemsError) {
        setErrors({ ...errors, noItemsError: true });
      }
      return;
    }
    if (tableItems.checkedItems.size > MAX_FILE_DOWNLOADS) {
      if (!errors.maxItemsError) {
        setErrors({ ...errors, maxItemsError: true });
      }
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
          router.replace(router.asPath, undefined, { scroll: false });
          toast.success(t("downloadResponsesTable.notifications.downloadComplete"));
        }, interval * response.data.length);
      })
      .catch((err) => {
        logMessage.error(err as Error);
        setErrors({ ...errors, downloadError: true });
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
