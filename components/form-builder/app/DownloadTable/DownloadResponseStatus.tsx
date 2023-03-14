import React from "react";
import { useTranslation } from "react-i18next";
import { ExclamationText } from "../shared";
import { getDaysPassed } from "./DownloadTable";

const DOWNLOAD_OVERDUE = 15;

// Format date for: YYY-MM-DD
function formatDate(date: Date): string {
  const dateObj = new Date(date);
  const day = String(dateObj.getDate()).length <= 1 ? `0${dateObj.getDate()}` : dateObj.getDate();
  const month =
    String(dateObj.getMonth()).length <= 1 ? `0${dateObj.getMonth() + 1}` : dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();
  return `${year}-${month}-${day}`;
}

export const DownloadResponseStatus = ({
  vaultStatus,
  createdAt,
  downloadedAt,
}: {
  vaultStatus: string;
  createdAt: Date;
  downloadedAt?: Date;
}) => {
  const { t } = useTranslation("form-builder");
  let status = null;

  if (vaultStatus === "New") {
    const daysPassed = getDaysPassed(createdAt);
    const daysLeft = DOWNLOAD_OVERDUE - daysPassed;
    if (daysLeft > 0) {
      status = t("downloadResponsesTable.status.withinXDays", { daysLeft });
    } else {
      status = <ExclamationText text={t("downloadResponsesTable.status.overdue")} />;
    }
  } else if (downloadedAt) {
    status = formatDate(downloadedAt);
  } else {
    status = t("downloadResponsesTable.unknown");
  }

  return <>{status}</>;
};
