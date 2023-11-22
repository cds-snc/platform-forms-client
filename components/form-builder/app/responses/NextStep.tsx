import React from "react";
import { useTranslation } from "react-i18next";
import { VaultStatus, VaultSubmissionList } from "@lib/types";
import { NewStatus } from "./NewStatus";
import { DownloadStatus } from "./DownloadStatus";
import { DeleteStatus } from "./DeleteStatus";
import { StatusMessage, StatusMessageLevel } from "./StatusMessage";

export const NextStep = ({
  submission,
  overdueAfterDownload,
  overdueAfterDelete,
  escalatedAfter,
}: {
  submission: VaultSubmissionList;
  overdueAfterDownload: string | undefined;
  overdueAfterDelete: string | undefined;
  escalatedAfter: string | undefined;
}) => {
  const { t } = useTranslation("form-builder-responses");

  // New "tab"
  if (submission.status === VaultStatus.NEW) {
    return (
      <NewStatus
        createdAt={submission.createdAt}
        overdueAfter={overdueAfterDownload}
        escalatedAfter={escalatedAfter}
      />
    );
  }

  // Downloaded "tab"
  if (submission.status === VaultStatus.DOWNLOADED) {
    return (
      <DownloadStatus
        downloadedAt={submission.downloadedAt}
        overdueAfter={overdueAfterDelete}
        escalatedAfter={escalatedAfter}
      />
    );
  }

  // Deleted "tab"
  if (submission.status === VaultStatus.CONFIRMED) {
    return <DeleteStatus removedAt={submission.removedAt} />;
  }

  // ALL "tabs"
  if (submission.status === VaultStatus.PROBLEM) {
    return (
      <StatusMessage
        primaryMessage={t("downloadResponsesTable.problem.supportWill")}
        secondaryMessage={t("downloadResponsesTable.problem.responseReported")}
        level={StatusMessageLevel.ERROR}
      />
    );
  }

  return <StatusMessage primaryMessage={t("downloadResponsesTable.unknown")} />;
};
