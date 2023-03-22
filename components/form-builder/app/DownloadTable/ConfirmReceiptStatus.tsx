import React from "react";
import { useTranslation } from "react-i18next";
import { ExclamationText } from "../shared";
import { VaultStatus, getDaysPassed } from "./DownloadTable";

const CONFIRM_OVERDUE = 15;

export const ConfirmReceiptStatus = ({
  vaultStatus,
  createdAtDate,
}: {
  vaultStatus: string;
  createdAtDate: Date;
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
      status = (
        <span className="p-2 bg-[#f3e9e8] text-[#bc3332] font-bold">
          {t("downloadResponsesTable.status.problem")}
        </span>
      );
      break;
    case VaultStatus.DOWNLOADED: {
      const daysPassed = getDaysPassed(createdAtDate);
      const daysLeft = CONFIRM_OVERDUE - daysPassed;
      if (daysLeft > 0) {
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
