import React from "react";
import { useTranslation } from "react-i18next";
import { VaultStatus, getDaysPassed } from "./DownloadTable";

export const RemovalStatus = ({
  vaultStatus,
  removedAt,
}: {
  vaultStatus: string;
  removedAt?: Date;
}) => {
  const { t } = useTranslation("form-builder");
  let status = null;

  if (vaultStatus === VaultStatus.CONFIRMED && removedAt) {
    const daysLeft = getDaysPassed(removedAt);
    status = t("downloadResponsesTable.status.withinXDays", { daysLeft });
  } else if (vaultStatus === VaultStatus.PROBLEM) {
    status = t("downloadResponsesTable.status.wontRemove");
  } else if (vaultStatus === VaultStatus.NEW || vaultStatus === VaultStatus.DOWNLOADED) {
    status = t("downloadResponsesTable.status.notSet");
  } else {
    status = t("downloadResponsesTable.unknown");
  }

  return <>{status}</>;
};
