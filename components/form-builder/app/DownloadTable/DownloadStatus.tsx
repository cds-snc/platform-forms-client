import React from "react";
import { useTranslation } from "react-i18next";
import { VaultStatus } from "./DownloadTable";

export const DownloadStatus = ({ vaultStatus }: { vaultStatus: string }) => {
  const { t } = useTranslation("form-builder");

  switch (vaultStatus) {
    case VaultStatus.NEW:
      return (
        <span className="p-2 bg-[#ecf3eb] text-[#0c6722]">
          {t("downloadResponsesTable.status.new")}
        </span>
      );
    case VaultStatus.DOWNLOADED:
      return (
        <span className="p-2 bg-[#dcd6fe]">{t("downloadResponsesTable.status.downloaded")}</span>
      );
    case VaultStatus.CONFIRMED:
      return (
        <span className="p-2 bg-[#e2e8ef]">{t("downloadResponsesTable.status.confirmed")}</span>
      );
    case VaultStatus.PROBLEM:
      return (
        <span className="p-2 bg-[#f3e9e8] text-[#bc3332]">
          {t("downloadResponsesTable.status.problem")}
        </span>
      );
    default:
      return (
        <span className="p-2 bg-[#f3e9e8] text-[#bc3332]">
          {t("downloadResponsesTable.unknown")}
        </span>
      );
  }
};
