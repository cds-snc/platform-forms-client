import React from "react";
import { useTranslation } from "react-i18next";
import { VaultStatus } from "./DownloadTable";
import { getDaysPassed } from "@lib/clientHelpers";

export const RemovalStatus = ({
  vaultStatus,
  removalAt,
}: {
  vaultStatus: string;
  removalAt?: Date;
}) => {
  const { t } = useTranslation("form-builder-responses");
  let status = null;

  if (vaultStatus === VaultStatus.CONFIRMED && removalAt) {
    const daysLeft = getDaysPassed(removalAt);
    if (daysLeft < 0) {
      status = t("downloadResponsesTable.unknown");
    } else {
      status = t("downloadResponsesTable.status.withinXDays", { daysLeft });
    }
  } else if (vaultStatus === VaultStatus.PROBLEM) {
    status = t("downloadResponsesTable.status.wontRemove");
  } else if (vaultStatus === VaultStatus.NEW || vaultStatus === VaultStatus.DOWNLOADED) {
    status = t("downloadResponsesTable.status.notSet");
  } else {
    status = t("downloadResponsesTable.unknown");
  }

  return <>{status}</>;
};
