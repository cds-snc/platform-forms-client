"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { ExclamationText } from "@clientComponents/form-builder/app/shared";
import { VaultStatus } from "@lib/types";
import { getDaysPassed } from "@lib/client/clientHelpers";

export const ConfirmReceiptStatus = ({
  vaultStatus,
  createdAtDate,
  overdueAfter = 0,
}: {
  vaultStatus: string;
  createdAtDate: Date | number;
  overdueAfter?: number;
}) => {
  const { t } = useTranslation("form-builder-responses");
  let status = null;

  switch (vaultStatus) {
    case VaultStatus.NEW:
      status = t("downloadResponsesTable.status.unconfirmed");
      break;
    case VaultStatus.CONFIRMED:
      status = t("downloadResponsesTable.status.done");
      break;
    case VaultStatus.PROBLEM:
      status = <ExclamationText text={t("downloadResponsesTable.status.problem")} />;
      break;
    case VaultStatus.DOWNLOADED: {
      const daysPassed = getDaysPassed(createdAtDate);
      if (!overdueAfter) status = t("downloadResponsesTable.unknown");
      const daysLeft = overdueAfter - daysPassed;
      if (daysLeft < 0) {
        status = <ExclamationText text={t("downloadResponsesTable.status.overdue")} />;
      } else {
        status = t("downloadResponsesTable.status.confirmWithinXDays", { daysLeft });
      }
      break;
    }
    default:
      status = t("downloadResponsesTable.unknown");
  }

  return <>{status}</>;
};
