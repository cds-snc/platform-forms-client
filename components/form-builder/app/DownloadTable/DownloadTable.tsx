import React, { useEffect, useState, useRef } from "react";
import { VaultSubmissionList } from "@lib/types";
import { useTranslation } from "react-i18next";
import { SkipLinkReusable } from "@components/globals/SkipLinkReusable";
import { ConfirmReceiptStatus } from "./ConfirmReceiptStatus";
import { DownloadResponseStatus } from "./DownloadResponseStatus";
import { RemovalStatus } from "./RemovalStatus";
import { DownloadStatus } from "./DownloadStatus";
import { useRouter } from "next/router";
import { logMessage } from "@lib/logger";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

export enum VaultStatus {
  NEW = "New",
  DOWNLOADED = "Downloaded",
  CONFIRMED = "Confirmed",
  PROBLEM = "Problem",
}

interface DownloadTableProps {
  vaultSubmissions: VaultSubmissionList[];
  formId?: string;
}

export function getDaysPassed(date: Date): number {
  const dateCreated = new Date(date);
  const dateToday = new Date();
  const dateDiff = Math.abs(Number(dateToday) - Number(dateCreated));
  const daysPassed = Math.ceil(dateDiff / (1000 * 60 * 60 * 24));
  return daysPassed;
}

export const DownloadTable = ({ vaultSubmissions, formId }: DownloadTableProps) => {
  const { t } = useTranslation("form-builder");
  const router = useRouter();
  const MAX_FILE_DOWNLOADS = 20;
  const toastPosition = toast.POSITION.TOP_CENTER;
  const checkedItems = useRef(new Map());
  const [selectionStatus, setSelectionStatus] = useState(
    new Map(vaultSubmissions.map((submission) => [submission.name, false]))
  );

  useEffect(() => {
    const checkedMap = new Map();
    selectionStatus.forEach((checked, name) => {
      if (checked) {
        checkedMap.set(name, checked);
      }
    });
    checkedItems.current = checkedMap;
  }, [selectionStatus]);

  const handleChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.id;
    const checked: boolean = e.target.checked;
    // Note: "new Map" Needed to clone and set so React change detection notices a change in the Map
    setSelectionStatus(new Map(selectionStatus.set(name, checked)));
  };

  // NOTE: browsers have different limits for simultaneous downloads. May need to look into
  // batching file downloads (e.g. 4 at a time) if edge cases/* come up.
  const handleDownload = async () => {
    if (checkedItems.current.size === 0) {
      toast.warn(t("downloadResponsesTable.download.atLeastOneFile"), { position: toastPosition });
      return;
    }

    if (checkedItems.current.size > MAX_FILE_DOWNLOADS) {
      toast.warn(
        t("downloadResponsesTable.download.trySelectingLessFiles", { max: MAX_FILE_DOWNLOADS }),
        { position: toastPosition }
      );
      return;
    }

    const toastDownloadingId = toast.info(
      t("downloadResponsesTable.download.downloadingXFiles", {
        fileCount: checkedItems.current.size,
      }),
      { position: toastPosition, autoClose: false }
    );

    try {
      const downloads = Array.from(checkedItems.current, async ([submissionName]) => {
        if (!submissionName) {
          throw new Error("Error downloading file from Retrieval table. SubmissionId missing.");
        }
        const url = `/api/id/${formId}/${submissionName}/download`;
        const fileName = `${submissionName}.html`;
        return axios({
          url,
          method: "GET",
          responseType: "blob",
          timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
        }).then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();
        });
      });

      await Promise.all(downloads).then(() => {
        // TODO: Future tech debt. See https://github.com/cds-snc/platform-forms-client/issues/1744
        setTimeout(() => {
          // Refreshes getServerSideProps data without a full page reload
          router.replace(router.asPath);
          toast.dismiss(toastDownloadingId);
          toast.success(t("downloadResponsesTable.download.downloadComplete"), {
            position: toastPosition,
          });
        }, 400);
      });
    } catch (err) {
      logMessage.error(err as Error);
      toast.dismiss(toastDownloadingId);
      toast.error(t("downloadResponsesTable.download.errorDownloadingFiles"), {
        position: toastPosition,
        autoClose: false,
      });
    }
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
          {vaultSubmissions.map((submission) => (
            <tr
              key={submission.name}
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
                <RemovalStatus vaultStatus={submission.status} removalAt={submission.removedAt} />
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
            size: checkedItems.current.size,
          })}
        </button>
      </div>

      {/* Sticky position to stop the page from scrolling to the top when showing a Toast */}
      <div className="sticky top-0">
        <ToastContainer />
      </div>
    </section>
  );
};
