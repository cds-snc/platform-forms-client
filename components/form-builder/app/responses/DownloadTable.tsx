import React, { useEffect, useReducer, useState } from "react";
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
import { Attention, AttentionTypes } from "@components/globals/Attention/Attention";
import { toast } from "../shared/Toast";
import { useSetting } from "@lib/hooks/useSetting";
import Link from "next/link";

// TODO: move to an app setting variable
const MAX_FILE_DOWNLOADS = 20;

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
  SORT = "SORT",
}

interface ReducerTableItemsState {
  statusItems: Map<string, boolean>;
  checkedItems: Map<string, boolean>;
  sortedItems: VaultSubmissionList[];
}

interface ReducerTableItemsActions {
  type: string;
  payload: {
    item?: {
      name: string;
      checked: boolean;
    };
    vaultSubmissions?: VaultSubmissionList[];
  };
}

// Using a reducer to have more control over when the template is updated (reduces re-renders)
const reducerTableItems = (state: ReducerTableItemsState, action: ReducerTableItemsActions) => {
  const { type, payload } = action;
  switch (type) {
    case "UPDATE": {
      if (!payload.item) {
        throw Error("Table update dispatch missing item checkbox state");
      }
      const newStatusItems = new Map(state.statusItems);
      const newCheckedItems = new Map();
      // Find the related checkbox and set its checked state to match the UI. Also update the list
      // of checkedItems for later convienience. The below forEach does two "things" which is messy
      // but more efficient than using two forEach loops.
      state.statusItems.forEach((checked: boolean, name: string) => {
        if (name === payload.item?.name && checked !== payload.item.checked) {
          newStatusItems.set(name, payload.item.checked);
          // Add to checkedItems: case of updated checkbox and checked
          if (payload.item.checked) {
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
    case "SORT": {
      if (!payload.vaultSubmissions) {
        throw Error("Table sort dispatch missing vaultSubmissions");
      }
      return {
        ...state,
        sortedItems: sortVaultSubmission(payload.vaultSubmissions),
      };
    }
    default:
      throw Error("Unknown action: " + action.type);
  }
};

// Sort submissions by created date first but prioritize New submissions to the top of the list.
// Note: This can probably be done more efficiently but the sorting behavior has not been fully
// defined yet and for now this simple way works.
export const sortVaultSubmission = (
  vaultSubmissions: VaultSubmissionList[]
): VaultSubmissionList[] => {
  const vaultSubmissionsNew = vaultSubmissions
    .filter((submission) => submission.status === VaultStatus.NEW.valueOf())
    .sort((submissionA, submissionB) => {
      return submissionB.createdAt - submissionA.createdAt;
    });
  const vaultSubmissionsWithoutNew = vaultSubmissions
    .filter((submission) => submission.status !== VaultStatus.NEW.valueOf())
    .sort((submissionA, submissionB) => {
      return submissionB.createdAt - submissionA.createdAt;
    });
  return [...vaultSubmissionsNew, ...vaultSubmissionsWithoutNew];
};

export const DownloadTable = ({ vaultSubmissions, formId }: DownloadTableProps) => {
  const { t } = useTranslation("form-builder-responses");
  const router = useRouter();
  const [errors, setErrors] = useState({
    downloadError: false,
    maxItemsError: false,
    noItemsError: false,
  });
  const [tableItems, tableItemsDispatch] = useReducer(reducerTableItems, {
    checkedItems: new Map(),
    statusItems: new Map(vaultSubmissions.map((submission) => [submission.name, false])),
    sortedItems: sortVaultSubmission(vaultSubmissions),
  });
  const { value: overdueAfter } = useSetting("nagwarePhaseEncouraged");

  const handleChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.id;
    const checked: boolean = e.target.checked;
    const dispatchAction = { type: TableActions.UPDATE, payload: { item: { name, checked } } };
    tableItemsDispatch(dispatchAction);

    // Needed because of how useReducer updates state on the next render vs. inside this function..
    const nextState = reducerTableItems(tableItems, dispatchAction);

    // Show or hide errors depending
    if (nextState.checkedItems.size > MAX_FILE_DOWNLOADS && !errors.maxItemsError) {
      setErrors({ ...errors, maxItemsError: true });
    } else if (errors.maxItemsError) {
      setErrors({ ...errors, maxItemsError: false });
    }
    if (nextState.checkedItems.size > 0 && errors.noItemsError) {
      setErrors({ ...errors, noItemsError: false });
    }
  };

  // NOTE: browsers have different limits for simultaneous downloads. May need to look into
  // batching file downloads (e.g. 4 at a time) if edge cases/* come up.
  const handleDownload = async () => {
    // Reset any errors
    if (errors.downloadError) {
      setErrors({ ...errors, downloadError: false });
    }

    // Handle any errors and show them
    if (tableItems.checkedItems.size === 0) {
      if (!errors.noItemsError) {
        setErrors({ ...errors, noItemsError: true });
      }
      return;
    }
    if (tableItems.checkedItems.size > MAX_FILE_DOWNLOADS) {
      if (!errors.maxItemsError) {
        setErrors({ ...errors, maxItemsError: true });
      }
      return;
    }

    toast.info(
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
        // TODO: only occurs download more than one file at a time. Here is the issue to track
        // https://github.com/cds-snc/platform-forms-client/issues/1744
        setTimeout(() => {
          // Refreshes getServerSideProps data without a full page reload
          router.replace(router.asPath, undefined, { scroll: false });
          toast.success(t("downloadResponsesTable.notifications.downloadComplete"));
        }, 500);
      });
    } catch (err) {
      logMessage.error(err as Error);
      setErrors({ ...errors, downloadError: true });
    }
  };

  useEffect(() => {
    // NOTE: Table not updating when it should? May need to be more explicit in telling react
    // what has changed in the array (e.g. a status). For now, this seems to work well.
    const dispatchAction = { type: TableActions.SORT, payload: { vaultSubmissions } };
    tableItemsDispatch(dispatchAction);
  }, [vaultSubmissions]);

  return (
    <section>
      <SkipLinkReusable
        text={t("downloadResponsesTable.skipLink")}
        anchor="#downloadTableButtonId"
      />
      <div id="notificationsTop">
        {tableItems.checkedItems.size > MAX_FILE_DOWNLOADS && (
          <Attention
            type={AttentionTypes.ERROR}
            isAlert={true}
            heading={t("downloadResponsesTable.errors.trySelectingLessFilesHeader", {
              max: MAX_FILE_DOWNLOADS,
            })}
          >
            <p className="text-[#26374a] text-sm">
              {t("downloadResponsesTable.errors.trySelectingLessFiles", {
                max: MAX_FILE_DOWNLOADS,
              })}
            </p>
          </Attention>
        )}
        {errors.noItemsError && (
          <Attention
            type={AttentionTypes.ERROR}
            isAlert={true}
            heading={t("downloadResponsesTable.errors.atLeastOneFileHeader")}
          >
            <p className="text-[#26374a] text-sm">
              {t("downloadResponsesTable.errors.atLeastOneFile")}
            </p>
          </Attention>
        )}
        {errors.downloadError && (
          <Attention
            type={AttentionTypes.ERROR}
            isAlert={true}
            heading={t("downloadResponsesTable.errors.errorDownloadingFilesHeader")}
          >
            <p className="text-[#26374a] text-sm mb-2">
              {t("downloadResponsesTable.errors.errorDownloadingFiles")}
              <Link href="/form-builder/support">
                {t("downloadResponsesTable.errors.errorDownloadingFilesLink")}
              </Link>
              .
            </p>
          </Attention>
        )}
      </div>

      <table className="text-sm" aria-live="polite">
        <caption className="sr-only">{t("downloadResponsesTable.header.tableTitle")}</caption>
        <thead className="border-b-2 border-[#6a6d7b]">
          <tr>
            <th className="p-4 text-center">{t("downloadResponsesTable.header.select")}</th>
            <th className="p-4 text-left">{t("downloadResponsesTable.header.number")}</th>
            <th className="p-4 text-left">{t("downloadResponsesTable.header.status")}</th>
            <th className="p-4 text-left">{t("downloadResponsesTable.header.downloadResponse")}</th>
            <th className="p-4 text-left">{t("downloadResponsesTable.header.lastDownloadedBy")}</th>
            <th className="p-4 text-left">{t("downloadResponsesTable.header.confirmReceipt")}</th>
            <th className="p-4 text-left">{t("downloadResponsesTable.header.removal")}</th>
          </tr>
        </thead>
        <tbody>
          {tableItems.sortedItems.map((submission) => (
            <tr
              key={submission.name}
              className={
                "border-b-2 border-grey" +
                (tableItems.statusItems.get(submission.name) ? " bg-[#fffbf3]" : "")
              }
            >
              <td className="pl-8 pr-4 pb-2 flex whitespace-nowrap">
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
              <td className="px-4 whitespace-nowrap">
                <DownloadStatus vaultStatus={submission.status} />
              </td>
              <td className="px-4 whitespace-nowrap">
                <DownloadResponseStatus
                  vaultStatus={submission.status}
                  createdAt={submission.createdAt}
                  downloadedAt={submission.downloadedAt}
                  overdueAfter={overdueAfter ? parseInt(overdueAfter) : undefined}
                />
              </td>
              <td className="px-4 whitespace-nowrap">
                <div className="truncate w-40">
                  {submission.lastDownloadedBy || t("downloadResponsesTable.status.notDownloaded")}
                </div>
              </td>
              <td className="px-4 whitespace-nowrap">
                <ConfirmReceiptStatus
                  vaultStatus={submission.status}
                  createdAtDate={submission.createdAt}
                  overdueAfter={overdueAfter ? parseInt(overdueAfter) : undefined}
                />
              </td>
              <td className="px-4 whitespace-nowrap">
                <RemovalStatus vaultStatus={submission.status} removalAt={submission.removedAt} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-8 flex">
        <button
          id="downloadTableButtonId"
          className="gc-button--blue whitespace-nowrap w-auto m-0"
          type="button"
          onClick={handleDownload}
          aria-live="polite"
        >
          {t("downloadResponsesTable.downloadXSelectedResponses", {
            size: tableItems.checkedItems.size,
          })}
        </button>

        <div id="notificationsBottom" className="ml-4">
          {tableItems.checkedItems.size > MAX_FILE_DOWNLOADS && (
            <Attention
              type={AttentionTypes.ERROR}
              isIcon={false}
              isSmall={true}
              heading={t("downloadResponsesTable.errors.trySelectingLessFilesHeader", {
                max: MAX_FILE_DOWNLOADS,
              })}
            >
              <p className="text-black text-sm">
                {t("downloadResponsesTable.errors.trySelectingLessFiles", {
                  max: MAX_FILE_DOWNLOADS,
                })}
              </p>
            </Attention>
          )}
          {errors.noItemsError && (
            <Attention
              type={AttentionTypes.ERROR}
              isIcon={false}
              isSmall={true}
              heading={t("downloadResponsesTable.errors.atLeastOneFileHeader")}
            >
              <p className="text-black text-sm">
                {t("downloadResponsesTable.errors.atLeastOneFile")}
              </p>
            </Attention>
          )}
          {errors.downloadError && (
            <Attention
              type={AttentionTypes.ERROR}
              isIcon={false}
              isSmall={true}
              heading={t("downloadResponsesTable.errors.errorDownloadingFilesHeader")}
            >
              <p className="text-black text-sm">
                {t("downloadResponsesTable.errors.errorDownloadingFiles")}
              </p>
            </Attention>
          )}
        </div>
      </div>
    </section>
  );
};
