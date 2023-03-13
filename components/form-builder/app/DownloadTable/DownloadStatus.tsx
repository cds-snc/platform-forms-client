import React from "react";
import { useTranslation } from "react-i18next";
import { VaultStatus } from "./DownloadTable";

export const DownloadStatus = ({ vaultStatus }: { vaultStatus: string }) => {
  const { t } = useTranslation("form-builder");
  let status = null;

  switch (vaultStatus) {
    case VaultStatus.NEW:
      status = (
        <span className="p-2 bg-[#ecf3eb] text-[#0c6722]">
          {t("downloadResponsesTable.status.new")}
        </span>
      );
      break;
    case VaultStatus.DOWNLOADED:
      status = (
        <span className="p-2 bg-[#dcd6fe]">{t("downloadResponsesTable.status.downloaded")}</span>
      );
      break;
    case VaultStatus.CONFIRMED:
      status = (
        <span className="p-2 bg-[#e2e8ef]">{t("downloadResponsesTable.status.confirmed")}</span>
      );
      break;
    case VaultStatus.PROBLEM:
      status = (
        <span className="p-2 bg-[#f3e9e8] text-[#bc3332]">
          {t("downloadResponsesTable.status.problem")}
        </span>
      );
      break;
    default:
      status = (
        <span className="p-2 bg-[#f3e9e8] text-[#bc3332]">
          {t("downloadResponsesTable.unknown")}
        </span>
      );
      break;
  }

  return <>{status}</>;
};
