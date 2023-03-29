import { formatDate } from "@lib/clientHelpers";
import React from "react";
import { useTranslation } from "react-i18next";
import { ExclamationText } from "../shared";
import { getDaysPassed } from "./DownloadTable";

const DOWNLOAD_OVERDUE = 15;

export const DownloadResponseStatus = ({
  vaultStatus,
  createdAt,
  downloadedAt,
}: {
  vaultStatus: string;
  createdAt: Date;
  downloadedAt?: Date;
}) => {
  const { t } = useTranslation("form-builder-responses");
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
    status = formatDate(new Date(downloadedAt));
  } else {
    status = t("downloadResponsesTable.unknown");
  }

  return <>{status}</>;
};
