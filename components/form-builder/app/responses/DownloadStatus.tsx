import React from "react";
import { useTranslation } from "react-i18next";
import { getDaysPassed } from "@lib/clientHelpers";
import { StatusMessage, StatusMessageLevel } from "./StatusMessage";

export const DownloadStatus = ({
  downloadedAt,
  overdueAfter,
  escalatedAfter,
}: {
  downloadedAt: number | undefined;
  overdueAfter: string | undefined;
  escalatedAfter: string | undefined;
}) => {
  const { t } = useTranslation("form-builder-responses");
  const daysPassedDownloaded = downloadedAt && getDaysPassed(downloadedAt);

  if (!daysPassedDownloaded) {
    return <StatusMessage primaryMessage={t("downloadResponsesTable.unknown")} />;
  }

  const daysToDelete = overdueAfter && parseInt(overdueAfter, 10) - daysPassedDownloaded;

  if (!daysToDelete) {
    return <StatusMessage primaryMessage={t("downloadResponsesTable.unknown")} />;
  }

  if (daysToDelete && daysToDelete > 0) {
    return (
      <StatusMessage
        primaryMessage={t("downloadResponsesTable.deleteWithin", { days: daysToDelete })}
      />
    );
  }

  const daysToEscalateDelete =
    escalatedAfter && parseInt(escalatedAfter, 10) - daysPassedDownloaded;

  if (daysToEscalateDelete) {
    return (
      <StatusMessage
        primaryMessage={t("downloadResponsesTable.deleteOverdue.deleteImmediately")}
        secondaryMessage={t("downloadResponsesTable.deleteOverdue.accountRestricted", {
          days: daysToEscalateDelete,
        })}
        level={StatusMessageLevel.ERROR}
      />
    );
  }

  return <StatusMessage primaryMessage={t("downloadResponsesTable.unknown")} />;
};
