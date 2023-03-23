import React, { useReducer, useState } from "react";
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
import { Attention, AttentionTypes } from "@components/globals/Attention/Attention";

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

enum TableActions {
  UPDATE = "UPDATE",
}

interface ReducerTableItemsState {
  statusItems: Map<string, boolean>;
  checkedItems: Map<string, boolean>;
}

interface ReducerTableItemsActions {
  type: string;
  item: {
    name: string;
    checked: boolean;
  };
}

// Using a reducer to have more control over when the template is updated (reduces re-renders)
const reducerTableItems = (state: ReducerTableItemsState, action: ReducerTableItemsActions) => {
  switch (action.type) {
    case "UPDATE": {
      if (!action.item) {
        throw Error("Table dispatch missing item checkox state");
      }
      const newStatusItems = new Map(state.statusItems);
      const newCheckedItems = new Map();
      // Find the related checkbox and set its checked state to match the UI. Also update the list
      // of checkedItems for later convienience. The below forEach does two "things" which is messy
      // but more efficient than using two forEach loops.
      state.statusItems.forEach((checked: boolean, name: string) => {
        if (name === action.item.name && checked !== action.item.checked) {
          newStatusItems.set(name, action.item.checked);
          // Add to checkedItems: case of updated checkbox and checked
          if (action.item.checked) {
            newCheckedItems.set(name, true);
          }
        } else if (checked) {
          // Add to checkedItems: case of existing checkbox and checked
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

export function getDaysPassed(date: Date): number {
  const dateCreated = new Date(date);
  const dateToday = new Date();
  const dateDiff = Math.abs(Number(dateToday) - Number(dateCreated));
  const daysPassed = Math.ceil(dateDiff / (1000 * 60 * 60 * 24));
  return daysPassed;
}

export const DownloadTable = ({ vaultSubmissions, formId }: DownloadTableProps) => {
  const { t } = useTranslation("form-builder-responses");
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    downloadError: false,
    maxItemsError: false,
    noItemsError: false,
  });
  const MAX_FILE_DOWNLOADS = 20;
  const [tableItems, tableItemsDispatch] = useReducer(reducerTableItems, {
    checkedItems: new Map(),
    statusItems: new Map(vaultSubmissions.map((submission) => [submission.name, false])),
  });

  const handleChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.id;
    const checked: boolean = e.target.checked;
    const dispatchAction = { type: TableActions.UPDATE, item: { name, checked } };
    tableItemsDispatch(dispatchAction);

    // Needed because of how useReducer updates state on the next render vs. inside this function..
    const nextState = reducerTableItems(tableItems, dispatchAction);

    // Show or hide notifications depending
    if (nextState.checkedItems.size > MAX_FILE_DOWNLOADS && !notifications.maxItemsError) {
      setNotifications({ ...notifications, maxItemsError: true });
    } else if (notifications.maxItemsError) {
      setNotifications({ ...notifications, maxItemsError: false });
    }
    if (nextState.checkedItems.size > 0 && notifications.noItemsError) {
      setNotifications({ ...notifications, noItemsError: false });
    }
  };

  // NOTE: browsers have different limits for simultaneous downloads. May need to look into
  // batching file downloads (e.g. 4 at a time) if edge cases/* come up.
  const handleDownload = async () => {
    // Handle any errors and show/reset any notifications
    if (tableItems.checkedItems.size === 0) {
      if (!notifications.noItemsError) {
        setNotifications({ ...notifications, noItemsError: true });
      }
      return;
    }
    if (tableItems.checkedItems.size > MAX_FILE_DOWNLOADS) {
      if (!notifications.maxItemsError) {
        setNotifications({ ...notifications, maxItemsError: true });
      }
      return;
    }
    if (notifications.downloadError) {
      setNotifications({ ...notifications, downloadError: false });
    }

    const toastDownloadingId = toast.info(
      t("downloadResponsesTable.notifications.downloadingXFiles", {
        fileCount: tableItems.checkedItems.size,
      })
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
          router.replace(router.asPath, undefined, { scroll: false });

          toast.dismiss(toastDownloadingId);
          toast.success(t("downloadResponsesTable.notifications.downloadComplete"));
        }, 400);
      });
    } catch (err) {
      logMessage.error(err as Error);
      toast.dismiss(toastDownloadingId);
      setNotifications({ ...notifications, downloadError: true });
    }
  };

  return (
    <section>
      <SkipLinkReusable
        text={t("downloadResponsesTable.skipLink")}
        anchor="#downloadTableButtonId"
      />
      <div id="notificationsTop" className="mr-20">
        {tableItems.checkedItems.size > MAX_FILE_DOWNLOADS && (
          <Attention
            type={AttentionTypes.ERROR}
            isAlert={true}
            width="40"
            heading={t("downloadResponsesTable.notifications.trySelectingLessFilesHeader", {
              max: MAX_FILE_DOWNLOADS,
            })}
          >
            <p className="text-[#26374a] text-sm">
              {t("downloadResponsesTable.notifications.trySelectingLessFiles", {
                max: MAX_FILE_DOWNLOADS,
              })}
            </p>
          </Attention>
        )}
        {notifications.noItemsError && (
          <Attention
            type={AttentionTypes.ERROR}
            isAlert={true}
            width="40"
            heading={t("downloadResponsesTable.notifications.atLeastOneFileHeader")}
          >
            <p className="text-[#26374a] text-sm">
              {t("downloadResponsesTable.notifications.atLeastOneFile")}
            </p>
          </Attention>
        )}
        {notifications.downloadError && (
          <Attention
            type={AttentionTypes.ERROR}
            isAlert={true}
            width="32"
            heading={t("downloadResponsesTable.notifications.errorDownloadingFilesHeader")}
          >
            <p className="text-[#26374a] text-sm mb-2">
              {t("downloadResponsesTable.notifications.errorDownloadingFiles")}
            </p>
          </Attention>
        )}
      </div>

      {/* TODO: come back to table live regions, updates may require a separate channel/* */}
      <table className="text-sm" aria-live="polite">
        <caption className="sr-only">{t("downloadResponsesTable.header.tableTitle")}</caption>
        <thead className="border-b-2 border-[#6a6d7b]">
          <tr>
            <th className="p-4 text-center">{t("downloadResponsesTable.header.select")}</th>
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
              <td className="pl-8 pr-4 pb-2 flex">
                <div className="gc-input-checkbox">
                  <input
                    id={submission.name}
                    className="gc-input-checkbox__input"
                    name="responses"
                    type="checkbox"
                    checked={tableItems.statusItems.get(submission.name)}
                    onChange={handleChecked}
                  />
                  <label className="gc-checkbox-label" htmlFor={submission.name}>
                    <span className="sr-only">{submission.name}</span>
                  </label>
                </div>
              </td>
              <td className="px-4 whitespace-nowrap">{submission.name}</td>
              <td className="px-4">
                <DownloadStatus vaultStatus={submission.status} />
              </td>
              <td className="px-4">
                <DownloadResponseStatus
                  vaultStatus={submission.status}
                  createdAt={submission.createdAt}
                  downloadedAt={submission.downloadedAt}
                />
              </td>
              <td className="px-4">
                <div className="truncate w-48">
                  {submission.lastDownloadedBy || t("downloadResponsesTable.status.notDownloaded")}
                </div>
              </td>
              <td className="px-4">
                <ConfirmReceiptStatus
                  vaultStatus={submission.status}
                  createdAtDate={submission.createdAt}
                />
              </td>
              <td className="px-4 pb-2">
                <RemovalStatus vaultStatus={submission.status} removalAt={submission.removedAt} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-8 flex">
        {/* NOTE: check/unchek item announcement may be enough for users and additionally announcing
              the updated Button items checked count may be too verbose. Remove live-region if so */}
        <button
          id="downloadTableButtonId"
          className="gc-button--blue whitespace-nowrap w-auto m-0"
          type="button"
          onClick={handleDownload}
          aria-live="polite"
        >
          {t("downloadResponsesTable.notifications.downloadXSelectedResponses", {
            size: tableItems.checkedItems.size,
          })}
        </button>

        <div id="notificationsBottom" className="ml-4">
          {tableItems.checkedItems.size > MAX_FILE_DOWNLOADS && (
            <Attention
              type={AttentionTypes.ERROR}
              isIcon={false}
              isSmall={true}
              heading={t("downloadResponsesTable.notifications.trySelectingLessFilesHeader", {
                max: MAX_FILE_DOWNLOADS,
              })}
            >
              <p className="text-black text-sm">
                {t("downloadResponsesTable.notifications.trySelectingLessFiles", {
                  max: MAX_FILE_DOWNLOADS,
                })}
              </p>
            </Attention>
          )}
          {notifications.noItemsError && (
            <Attention
              type={AttentionTypes.ERROR}
              isIcon={false}
              isSmall={true}
              heading={t("downloadResponsesTable.notifications.atLeastOneFileHeader")}
            >
              <p className="text-black text-sm">
                {t("downloadResponsesTable.notifications.atLeastOneFile")}
              </p>
            </Attention>
          )}
          {notifications.downloadError && (
            <Attention
              type={AttentionTypes.ERROR}
              isIcon={false}
              isSmall={true}
              heading={t("downloadResponsesTable.notifications.errorDownloadingFilesHeader")}
            >
              <p className="text-black text-sm">
                {t("downloadResponsesTable.notifications.errorDownloadingFiles")}
              </p>
            </Attention>
          )}
        </div>
      </div>

      {/* TODO move to the app top level probably */}
      <ToastContainer />
    </section>
  );
};
