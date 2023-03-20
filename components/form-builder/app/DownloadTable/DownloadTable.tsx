import React, { useReducer } from "react";
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

// Note: using a reducer to have more control over when the template is updated (reduces re-renders)
const reducerTableItems = (state, action) => {
  switch (action.type) {
    case "UPDATE": {
      if (!action.item) {
        throw Error("Table dispatch missing item checkox state");
      }
      const newStatusItems = new Map(state.statusItems);
      const newCheckedItems = new Map();
      // NOTE: below forEach does two "things" which is messy but more efficient than two forEach's
      // Find the related checkbox and set its checked state to match the UI
      state.statusItems.forEach((checked: boolean, name: string) => {
        if (name === action.item.name && checked !== action.item.checked) {
          newStatusItems.set(name, action.item.checked);
          // Add to checked list: case of updated checkbox and checked
          if (action.item.checked) {
            newCheckedItems.set(name, true);
          }
        } else if (checked) {
          // Add to checked list: case of existing checkbox and checked
          newCheckedItems.set(name, true);
        }
      });
      return {
        ...state,
        checkedItems: newCheckedItems,
        statusItems: newStatusItems,
      };
    }
    default:
      throw Error("Unknown action: " + action.type);
  }
};

export const DownloadTable = ({ vaultSubmissions, formId }: DownloadTableProps) => {
  const { t } = useTranslation("form-builder");
  const router = useRouter();
  const MAX_FILE_DOWNLOADS = 20;
  const toastPosition = toast.POSITION.TOP_CENTER;
  const [tableItems, tableItemsDispatch] = useReducer(reducerTableItems, {
    checkedItems: new Map(),
    statusItems: new Map(vaultSubmissions.map((submission) => [submission.name, false])),
  });

  const handleChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.id;
    const checked: boolean = e.target.checked;
    tableItemsDispatch({ type: "UPDATE", item: { name, checked } });
  };

  // NOTE: browsers have different limits for simultaneous downloads. May need to look into
  // batching file downloads (e.g. 4 at a time) if edge cases/* come up.
  const handleDownload = async () => {
    if (tableItems.checkedItems.size === 0) {
      toast.warn(t("downloadResponsesTable.download.atLeastOneFile"), { position: toastPosition });
      return;
    }

    if (tableItems.checkedItems.size > MAX_FILE_DOWNLOADS) {
      toast.warn(
        t("downloadResponsesTable.download.trySelectingLessFiles", { max: MAX_FILE_DOWNLOADS }),
        { position: toastPosition }
      );
      return;
    }

    const toastDownloadingId = toast.info(
      t("downloadResponsesTable.download.downloadingXFiles", {
        fileCount: tableItems.checkedItems.size,
      }),
      { position: toastPosition, autoClose: false }
    );

    try {
      const downloads = Array.from(tableItems.checkedItems, async ([submissionName]) => {
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
                (tableItems.statusItems.get(submission.name) ? " bg-[#fffbf3]" : "")
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
                      checked={tableItems.statusItems.get(submission.name)}
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
            size: tableItems.checkedItems.size,
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
