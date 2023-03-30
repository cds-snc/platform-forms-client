import React from "react";
import { useTranslation } from "react-i18next";
import { ExclamationText } from "../shared";
import { VaultStatus } from "./DownloadTable";
import { getDaysPassed } from "@lib/clientHelpers";

// TODO: move to an app setting variable
const CONFIRM_OVERDUE = 15;

export const ConfirmReceiptStatus = ({
  vaultStatus,
  createdAtDate,
}: {
  vaultStatus: string;
  createdAtDate: number;
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
      const daysLeft = CONFIRM_OVERDUE - daysPassed;
      if (daysLeft < 0) {
        status = t("downloadResponsesTable.unknown");
      } else if (daysLeft > 0) {
        status = t("downloadResponsesTable.status.withinXDays", { daysLeft });
      } else {
        status = <ExclamationText text={t("downloadResponsesTable.status.overdue")} />;
      }
      break;
    }
    default:
      status = t("downloadResponsesTable.unknown");
  }

  return <>{status}</>;
};
