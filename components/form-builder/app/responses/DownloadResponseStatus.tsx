import { formatDate } from "@lib/clientHelpers";
import React from "react";
import { useTranslation } from "react-i18next";
import { ExclamationText } from "../shared";
import { getDaysPassed } from "@lib/clientHelpers";
import { VaultStatus } from "@lib/types";

export const DownloadResponseStatus = ({
  vaultStatus,
  createdAt,
  downloadedAt,
  overdueAfter,
}: {
  vaultStatus: string;
  createdAt: Date | number;
  downloadedAt?: Date | number;
  overdueAfter?: number;
}) => {
  const { t } = useTranslation("form-builder-responses");
  let status = null;

  if (vaultStatus === VaultStatus.NEW) {
    const daysPassed = getDaysPassed(createdAt);
    if (!overdueAfter) return <>{t("downloadResponsesTable.unknown")}</>;
    const daysLeft = overdueAfter - daysPassed;

    if (daysLeft < 0) {
      status = <ExclamationText text={t("downloadResponsesTable.status.overdue")} />;
    } else {
      status = t("downloadResponsesTable.status.withinXDays", { daysLeft });
    }
  } else if (downloadedAt) {
    status = formatDate(new Date(downloadedAt));
  } else {
    status = t("downloadResponsesTable.unknown");
  }

  return <>{status}</>;
};
