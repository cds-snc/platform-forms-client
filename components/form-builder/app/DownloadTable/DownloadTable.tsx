import React from "react";
import { VaultSubmissionList } from "@lib/types";
import { useTranslation } from "react-i18next";
import { SkipLinkReusable } from "@components/globals/SkipLinkReusable";
import { ConfirmReceiptStatus } from "./ConfirmReceiptStatus";
import { DownloadResponseStatus } from "./DownloadResponseStatus";
import { RemovalStatus } from "./RemovalStatus";
import { DownloadStatus } from "./DownloadStatus";

export enum VaultStatus {
  NEW = "New",
  DOWNLOADED = "Downloaded",
  CONFIRMED = "Confirmed",
  PROBLEM = "Problem",
}

interface DownloadTableProps {
  submissions: VaultSubmissionList[];
  selectionStatus: Map<string, boolean>;
  setSelectionStatus: (newStatus: Map<string, boolean>) => void;
  checkedItems: Map<string, boolean>;
  handleDownload: React.MouseEventHandler<HTMLButtonElement>;
}

export function getDaysPassed(date: Date): number {
  const dateCreated = new Date(date);
  const dateToday = new Date();
  const dateDiff = Math.abs(Number(dateToday) - Number(dateCreated));
  const daysPassed = Math.ceil(dateDiff / (1000 * 60 * 60 * 24));
  return daysPassed;
}

export const DownloadTable = ({
  submissions,
  selectionStatus,
  setSelectionStatus,
  checkedItems,
  handleDownload,
}: DownloadTableProps) => {
  const { t } = useTranslation("form-builder");

  const handleChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.id;
    const checked: boolean = e.target.checked;
    // Note: "new Map" Needed to clone and set so React change detection notices a change in the Map
    setSelectionStatus(new Map(selectionStatus.set(name, checked)));
  };

  return (
    <section>
      <SkipLinkReusable
        text={t("downloadResponsesTable.skipLink")}
        anchor="#downloadTableButtonId"
      />
      <table className="text-sm">
        <caption className="sr-only">{t("downloadResponsesTable.header.tableTitle")}</caption>
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
          {submissions.map((submission, index) => (
            <tr
              key={index}
              className={
                "border-b-2 border-grey" +
                (selectionStatus.get(submission.name) ? " bg-[#fffbf3]" : "")
              }
            >
              <td className="p-4 flex">
                {/* TODO: Replace below with Design System checkbox */}
                <div className="form-builder">
                  <div className="multiple-choice-wrapper">
                    <input
                      id={submission.name}
                      className="multiple-choice-wrapper"
                      name="responses"
                      type="checkbox"
                      checked={selectionStatus.get(submission.name)}
                      onChange={handleChecked}
                    />
                    <label htmlFor={submission.name}>
                      <span className="sr-only">{submission.name}</span>
                    </label>
                  </div>
                </div>
              </td>
              <td className="p-4 whitespace-nowrap">{submission.name}</td>
              <td className="p-4">
                <DownloadStatus vaultStatus={submission.status} />
              </td>
              <td className="p-4">
                <DownloadResponseStatus
                  vaultStatus={submission.status}
                  createdAt={submission.createdAt}
                  downloadedAt={submission.downloadedAt}
                />
              </td>
              <td className="p-4">
                <div className="truncate w-48">
                  {submission.lastDownloadedBy || t("downloadResponsesTable.status.notDownloaded")}
                </div>
              </td>
              <td className="p-4">
                <ConfirmReceiptStatus
                  vaultStatus={submission.status}
                  createdAtDate={submission.createdAt}
                />
              </td>
              <td className="p-4">
                <RemovalStatus vaultStatus={submission.status} removedAt={submission.removedAt} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-8">
        {/* NOTE: check/unchek item announcement may be enough for users and additionally announcing
            the updated Button items checked count may be too verbose. Remove live-region if so */}
        <button
          id="downloadTableButtonId"
          className="gc-button whitespace-nowrap w-auto"
          type="button"
          onClick={handleDownload}
          aria-live="polite"
        >
          {t("downloadResponsesTable.download.downloadXSelectedResponses", {
            size: checkedItems.size,
          })}
        </button>
      </div>
    </section>
  );
};
