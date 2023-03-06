import React from "react";
import { VaultSubmissionList } from "@lib/types";
import { ExclamationIcon } from "@components/form-builder/icons";

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
        return <span className="p-2 bg-[#ecf3eb] text-[#0c6722]">New</span>;
      case "Downloaded":
        return <span className="p-2 bg-[#dcd6fe]">Downloaded</span>;
      case "Confirmed":
        return <span className="p-2 bg-[#e2e8ef]">Confirmed</span>;
      case "Problem":
        return <span className="p-2 bg-[#f3e9e8] text-[#bc3332]">Problem</span>;
      default:
        return <span className="p-2 bg-[#f3e9e8] text-[#bc3332]">Unknown</span>;
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
        return `Within ${daysLeft} days`;
      }
      return (
        // TODO: probably move to an Exclamation component
        <div className="flex items-center">
          <ExclamationIcon className="mr-1" />
          <span className="font-bold text-[#bc3332]">Overdue</span>
        </div>
      );
    }

    if (
      (vaultStatus === "Downloaded" || vaultStatus === "Confirmed" || vaultStatus === "Problem") &&
      downloadedAt
    ) {
      return formatDate(downloadedAt);
    }

    return "Unknown";
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
        return "Unconfirmed";
      case "Confirmed":
        return "Done";
      case "Problem":
        return <span className="p-2 bg-[#f3e9e8] text-[#bc3332] font-bold">Problem</span>;
      case "Downloaded": {
        const daysPassed = getDaysPassed(createdAtDate);
        const daysLeft = CONFIRM_OVERDUE - daysPassed;
        if (daysLeft > 0) {
          return `Within ${daysLeft} days`;
        }
        return (
          <div className="flex items-center">
            <ExclamationIcon className="mr-1" />
            <span className="font-bold text-[#bc3332]">Overdue</span>
          </div>
        );
      }
      default:
        return "Unknown";
    }
  }

  function formatRemoval({ vaultStatus, removedAt }: { vaultStatus: string; removedAt?: Date }) {
    if (vaultStatus === "Confirmed" && removedAt) {
      const days = getDaysPassed(removedAt);
      return `Within ${days} days`;
    }

    if (vaultStatus === "Problem") {
      return "Won't Remove";
    }

    if (vaultStatus === "New" || vaultStatus === "Downloaded") {
      return "Not set";
    }

    return "Unknown";
  }

  const handleChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.id;
    const checked: boolean = e.target.checked;
    // Note: Needed to clone and set so React change detection notices a change in the Map
    setCheckedItems(new Map(checkedItems.set(name, checked)));
  };

  return (
    <table className="text-sm">
      <thead className="border-b-2 border-[#6a6d7b]">
        <tr>
          <th className="p-4  text-center">Select</th>
          <th className="p-4 text-left">Number</th>
          <th className="p-4 text-left">Status</th>
          <th className="p-4 text-left whitespace-nowrap">Download Response</th>
          <th className="p-4 text-left whitespace-nowrap">Last Downloaded By</th>
          <th className="p-4 text-left whitespace-nowrap">Confirm Receipt</th>
          <th className="p-4 text-left">Removal</th>
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
                  {submission.lastDownloadedBy || "Not downloaded"}
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
