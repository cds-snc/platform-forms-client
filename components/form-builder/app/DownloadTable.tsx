import React from "react";
import { VaultSubmissionList } from "@lib/types";
import { ExclamationIcon } from "@components/form-builder/icons";
import { useTranslation } from "react-i18next";

interface DownloadTableProps {
  vaultSubmissions: VaultSubmissionList[];
  checkedItems: any;
  setCheckedItems: any;
}

export const DownloadTable = ({
  vaultSubmissions,
  checkedItems,
  setCheckedItems,
}: DownloadTableProps) => {
  const { t } = useTranslation("form-builder");
  const DOWNLOAD_OVERDUE = 15;
  const CONFIRM_OVERDUE = 15;

  function getDaysPassed(date: Date): number {
    const dateCreated = new Date(date);
    const dateToday = new Date();
    const dateDiff = Math.abs(Number(dateToday) - Number(dateCreated));
    const daysPassed = Math.ceil(dateDiff / (1000 * 60 * 60 * 24));
    return daysPassed;
  }

  // Format date for: DD/MM/YYYY
  function formatDate(date: Date): string {
    const dateObj = new Date(date);
    const day = String(dateObj.getDate()).length <= 2 ? `0${dateObj.getDate()}` : dateObj.getDate();
    const month =
      String(dateObj.getMonth()).length <= 2
        ? `0${dateObj.getMonth() + 1}`
        : dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function formatStatus(vaultStatus: string) {
    switch (vaultStatus) {
      case "New":
        return (
          <span className="p-2 bg-[#ecf3eb] text-[#0c6722]">
            {t("downloadResponsesTable.status.new")}
          </span>
        );
      case "Downloaded":
        return (
          <span className="p-2 bg-[#dcd6fe]">{t("downloadResponsesTable.status.downloaded")}</span>
        );
      case "Confirmed":
        return (
          <span className="p-2 bg-[#e2e8ef]">{t("downloadResponsesTable.status.confirmed")}</span>
        );
      case "Problem":
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
  }

  function formatDownloadResponse({
    vaultStatus,
    createdAt,
    downloadedAt,
  }: {
    vaultStatus: string;
    createdAt?: Date;
    downloadedAt?: Date;
  }) {
    if (vaultStatus === "New" && createdAt) {
      const daysPassed = getDaysPassed(createdAt);
      const daysLeft = DOWNLOAD_OVERDUE - daysPassed;
      if (daysLeft > 0) {
        return t("downloadResponsesTable.status.withinXDays", { daysLeft });
      }
      return (
        // TODO: probably move to an Exclamation component
        <div className="flex items-center">
          <ExclamationIcon className="mr-1" />
          <span className="font-bold text-[#bc3332]">
            {t("downloadResponsesTable.status.overdue")}
          </span>
        </div>
      );
    }

    if (
      (vaultStatus === "Downloaded" || vaultStatus === "Confirmed" || vaultStatus === "Problem") &&
      downloadedAt
    ) {
      return formatDate(downloadedAt);
    }

    return t("downloadResponsesTable.unknown");
  }

  function formatConfirmReceipt({
    vaultStatus,
    createdAtDate,
  }: {
    vaultStatus: string;
    createdAtDate: Date;
  }) {
    switch (vaultStatus) {
      case "New":
        return t("downloadResponsesTable.status.unconfirmed");
      case "Confirmed":
        return t("downloadResponsesTable.status.one");
      case "Problem":
        return (
          <span className="p-2 bg-[#f3e9e8] text-[#bc3332] font-bold">
            {t("downloadResponsesTable.status.problem")}
          </span>
        );
      case "Downloaded": {
        const daysPassed = getDaysPassed(createdAtDate);
        const daysLeft = CONFIRM_OVERDUE - daysPassed;
        if (daysLeft > 0) {
          return t("downloadResponsesTable.status.withinXDays", { daysLeft });
        }
        return (
          <div className="flex items-center">
            <ExclamationIcon className="mr-1" />
            <span className="font-bold text-[#bc3332]">
              {t("downloadResponsesTable.status.overdue")}
            </span>
          </div>
        );
      }
      default:
        return t("downloadResponsesTable.unknown");
    }
  }

  function formatRemoval({ vaultStatus, removedAt }: { vaultStatus: string; removedAt?: Date }) {
    if (vaultStatus === "Confirmed" && removedAt) {
      const daysLeft = getDaysPassed(removedAt);
      return t("downloadResponsesTable.status.withinXDays", { daysLeft });
    }

    if (vaultStatus === "Problem") {
      return t("downloadResponsesTable.status.wontRemove");
    }

    if (vaultStatus === "New" || vaultStatus === "Downloaded") {
      return t("downloadResponsesTable.status.notSet");
    }

    return t("downloadResponsesTable.unknown");
  }

  const handleChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.id;
    const checked: boolean = e.target.checked;
    // Note: "new Map" Needed to clone and set so React change detection notices a change in the Map
    setCheckedItems(new Map(checkedItems.set(name, checked)));
  };

  return (
    <table className="text-sm">
      <caption className="sr-only">{t("downloadResponsesTable.tableTitle")}</caption>
      <thead className="border-b-2 border-[#6a6d7b]">
        <tr>
          <th className="p-4  text-center">{t("downloadResponsesTable.header.select")}</th>
          <th className="p-4 text-left">{t("downloadResponsesTable.header.number")}</th>
          <th className="p-4 text-left">{t("downloadResponsesTable.header.status")}</th>
          <th className="p-4 text-left whitespace-nowrap">
            {t("downloadResponsesTable.header.downloadResponse")}
          </th>
          <th className="p-4 text-left whitespace-nowrap">
            {t("downloadResponsesTable.header.lastDownloadedBy")}
          </th>
          <th className="p-4 text-left whitespace-nowrap">
            {t("downloadResponsesTable.header.confirmReceipt")}
          </th>
          <th className="p-4 text-left">{t("downloadResponsesTable.header.removal")}</th>
        </tr>
      </thead>
      <tbody>
        <>
          {vaultSubmissions.map((submission, index) => (
            <tr
              key={index}
              className={
                "border-b-2 border-grey" +
                (checkedItems.get(submission.name)?.checked ? " bg-[#fffbf3]" : "")
              }
            >
              <td className="p-4 flex">
                {/* TODO 
                    Replace below with Design System checkbox 
                */}
                <div className="form-builder">
                  <div className="multiple-choice-wrapper">
                    <input
                      id={submission.name}
                      className="multiple-choice-wrapper"
                      name="responses"
                      type="checkbox"
                      checked={checkedItems.get(submission.name)?.checked}
                      onChange={handleChecked}
                    />
                    <label htmlFor={submission.name}>
                      <span className="sr-only">{submission.name}</span>
                    </label>
                  </div>
                </div>
              </td>
              <td className="p-4 whitespace-nowrap">{submission.name}</td>
              <td className="p-4 ">{formatStatus(submission.status)}</td>
              <td className="p-4 ">
                {formatDownloadResponse({
                  vaultStatus: submission.status,
                  createdAt: submission.createdAt,
                  downloadedAt: submission.downloadedAt,
                })}
              </td>
              <td className="p-4">
                <div className="truncate w-48">
                  {submission.lastDownloadedBy || t("downloadResponsesTable.status.notDownloaded")}
                </div>
              </td>
              <td className="p-4 ">
                {formatConfirmReceipt({
                  vaultStatus: submission.status,
                  createdAtDate: submission.createdAt,
                })}
              </td>
              <td className="p-4 ">
                {formatRemoval({
                  vaultStatus: submission.status,
                  removedAt: submission.removedAt,
                })}
              </td>
            </tr>
          ))}
        </>
      </tbody>
    </table>
  );
};
