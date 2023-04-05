import React from "react";
import { useTranslation } from "react-i18next";
import { ExclamationText } from "../shared";
import { VaultStatus } from "./DownloadTable";
import { getDaysPassed } from "@lib/clientHelpers";

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
        status = t("downloadResponsesTable.status.withinXDays", { daysLeft });
      }
      break;
    }
    default:
      status = t("downloadResponsesTable.unknown");
  }

  return <>{status}</>;
};
