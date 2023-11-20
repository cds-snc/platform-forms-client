import React from "react";
import { useTranslation } from "react-i18next";
import { VaultStatus, VaultSubmission, VaultSubmissionList } from "@lib/types";
import { DownloadResponseStatus } from "./DownloadResponseStatus";
import { getDaysPassed } from "@lib/clientHelpers";

export const NextStep = ({
  submission,
  overdueAfter,
}: {
  submission: VaultSubmissionList;
  overdueAfter: string | undefined;
}) => {
  const { t } = useTranslation("form-builder-responses");

  const daysPassed = getDaysPassed(submission.createdAt);
  if (!overdueAfter) return <>{t("downloadResponsesTable.unknown")}</>;
  const daysLeft = parseInt(overdueAfter, 10) - daysPassed;

  // Any "tab"
  if (submission.status === VaultStatus.PROBLEM) {
    return "Support will contact you - Response reported as a problem"; //todo format
  }

  // New "tab"
  if (submission.status === VaultStatus.NEW) {
    if (daysLeft > 0) {
      return `Download within ${daysLeft} days`;
    }
    if (daysLeft < 0) {
      return "Download immediately (overdue) - Account restricted in X days"; //todo how determin "restricted in X days?"
    }
  }

  // Downloaded "tab"
  if (submission.status === VaultStatus.DOWNLOADED) {
    return "Delete within X days";
  }

  // Deleted "tab"
  if (submission.status === VaultStatus.CONFIRMED) {
    //todo is this right?
    // "Will be removed permanently in X days"
  }

  return "unknown"; //todo maybe contact support message?
};
