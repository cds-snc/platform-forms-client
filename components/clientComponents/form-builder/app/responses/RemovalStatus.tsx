"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { VaultStatus } from "@lib/types";
import { getDaysPassed } from "@lib/client/clientHelpers";

export const RemovalStatus = ({
  vaultStatus,
  removalAt,
}: {
  vaultStatus: string;
  removalAt?: Date | number;
}) => {
  const { t } = useTranslation("form-builder-responses");
  let status = null;

  if (vaultStatus === VaultStatus.CONFIRMED && removalAt) {
    const daysLeft = getDaysPassed(removalAt);
    if (daysLeft < 0) {
      status = t("downloadResponsesTable.unknown");
    } else {
      status = t("downloadResponsesTable.status.removeWithinXDays", { daysLeft });
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
