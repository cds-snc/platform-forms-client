import React from "react";
import { useTranslation } from "react-i18next";
import { VaultStatus, VaultSubmissionList } from "@lib/types";
import { NewStatus } from "./NewStatus";
import { DownloadStatus } from "./DownloadStatus";
import { ConfirmStatus } from "./ConfirmStatus";
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
    return <ConfirmStatus removedAt={submission.removedAt} />;
  }

  return <StatusMessage primaryMessage={t("downloadResponsesTable.unknown")} />;
};
