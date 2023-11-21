import React from "react";
import { useTranslation } from "react-i18next";
import { VaultStatus, VaultSubmission, VaultSubmissionList } from "@lib/types";
import { DownloadResponseStatus } from "./DownloadResponseStatus";
import { getDaysPassed } from "@lib/clientHelpers";

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
    return "Support will contact you - Response reported as a problem"; //todo format
  }

  // New "tab"
  if (submission.status === VaultStatus.NEW) {
    const daysPassedCreated = getDaysPassed(submission.createdAt);
    const daysToDownload =
      overdueAfterDownload && parseInt(overdueAfterDownload, 10) - daysPassedCreated;
    const daysToEscalateDownload =
      escalatedAfter && parseInt(escalatedAfter, 10) - daysPassedCreated;

    if (daysToDownload) {
      if (daysToDownload > 0) {
        return `Download within ${daysToDownload} days`;
      }
      if (daysToDownload < 0) {
        return `Download immediately (overdue) - Account restricted in ${daysToEscalateDownload} days`;
      }
    }
  }

  // Downloaded "tab"
  if (submission.status === VaultStatus.DOWNLOADED) {
    const daysPassedDownloaded = submission.downloadedAt && getDaysPassed(submission.downloadedAt);

    // check needed since downloadedAt can be undefined|number and 0 is a possible value (fasley)
    if (typeof daysPassedDownloaded !== "undefined" && !Number.isNaN(daysPassedDownloaded)) {
      const daysToDelete =
        overdueAfterDelete && parseInt(overdueAfterDelete, 10) - daysPassedDownloaded;

      if (daysToDelete) {
        if (daysToDelete > 0) {
          return `Delete within ${daysToDelete} days`;
        }
        if (daysToDelete < 0) {
          const daysToEscalateDelete =
            escalatedAfter && parseInt(escalatedAfter, 10) - daysPassedDownloaded;

          if (daysToEscalateDelete) {
            return `Delete immediately (overdue)- Account restricted in ${daysToEscalateDelete} days`;
          }
        }
      }
    }
  }

  // Deleted "tab"
  if (submission.status === VaultStatus.CONFIRMED) {
    const daysToRemove = submission.removedAt && getDaysPassed(submission.removedAt); // Note: Vault mapping of RemovalDate to removedAt

    if (!Number.isNaN(daysToRemove)) {
      return `Will be removed permanently in ${daysToRemove} days`;
    }
  }

  // Should never be reached, if so something in the above failed.
  return "todo An error occurred."; // TODO: maybe a similar contact support message?
};
