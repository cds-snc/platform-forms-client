import React, { useEffect, useReducer, useState } from "react";
import {
  NagwareResult,
  TypeOmit,
  VaultStatus,
  VaultSubmission,
  VaultSubmissionList,
} from "@lib/types";
import { useTranslation } from "react-i18next";
import { SkipLinkReusable } from "@components/globals/SkipLinkReusable";
import { ConfirmReceiptStatus } from "./ConfirmReceiptStatus";
import { DownloadResponseStatus } from "./DownloadResponseStatus";
import { RemovalStatus } from "./RemovalStatus";
import { DownloadStatus } from "./DownloadStatus";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "../shared/Toast";
import { useSetting } from "@lib/hooks/useSetting";
import Link from "next/link";
import {
  TableActions,
  isSubmissionOverdue,
  reducerTableItems,
  sortVaultSubmission,
} from "./DownloadTableReducer";
import { getDaysPassed } from "@lib/clientHelpers";
import { Alert } from "@components/globals";
import { logMessage } from "@lib/logger";

interface DownloadTableProps {
  vaultSubmissions: VaultSubmissionList[];
  formId?: string;
  nagwareResult: NagwareResult | null;
  responseDownloadLimit: number;
}

export const DownloadTable = ({
  vaultSubmissions,
  formId,
  nagwareResult,
  responseDownloadLimit,
}: DownloadTableProps) => {
  const { t } = useTranslation("form-builder-responses");
  const router = useRouter();
  const [errors, setErrors] = useState({
    downloadError: false,
    maxItemsError: false,
    noItemsError: false,
  });
  const accountEscalated = nagwareResult && nagwareResult.level > 2;

  const { value: overdueAfter } = useSetting("nagwarePhaseEncouraged");
  const [tableItems, tableItemsDispatch] = useReducer(reducerTableItems, {
    checkedItems: new Map(),
    statusItems: new Map(vaultSubmissions.map((submission) => [submission.name, false])),
    sortedItems: sortVaultSubmission(vaultSubmissions),
    numberOfOverdueResponses: vaultSubmissions.filter((submission) =>
      isSubmissionOverdue({
        status: submission.status,
        createdAt: submission.createdAt,
        overdueAfter,
      })
    ).length,
  });

  const MAX_FILE_DOWNLOADS = responseDownloadLimit;

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

    // Download an aggregated version of all the records
    if (tableItems.checkedItems.size > 1) {
      const urlAggregated = `/api/id/${formId}/submissions/download?format=html-aggregated`;
      const ids = Array.from(tableItems.checkedItems.keys());
      axios({
        url: urlAggregated,
        method: "POST",
        data: {
          ids: ids.join(","),
        },
      }).then((response) => {
        const fileName = `${formId}.html`;
        const href = window.URL.createObjectURL(new Blob([response.data]));
        const anchorElement = document.createElement("a");
        anchorElement.href = href;
        anchorElement.download = fileName;
        document.body.appendChild(anchorElement);
        anchorElement.click();
        document.body.removeChild(anchorElement);
        window.URL.revokeObjectURL(href);
      });

      return; //TODO TEMP
    }

    // Download each record as a separate file
    const url = `/api/id/${formId}/submissions/download?format=html`;
    const ids = Array.from(tableItems.checkedItems.keys());

    axios({
      url,
      method: "POST",
      data: {
        ids: ids.join(","),
      },
    })
      .then((response) => {
        const interval = 200;
        response.data.forEach((submission: { id: string; html: string }, i: number) => {
          setTimeout(() => {
            const fileName = `${submission.id}.html`;
            const href = window.URL.createObjectURL(new Blob([submission.html]));
            const anchorElement = document.createElement("a");
            anchorElement.href = href;
            anchorElement.download = fileName;
            document.body.appendChild(anchorElement);
            anchorElement.click();
            document.body.removeChild(anchorElement);
            window.URL.revokeObjectURL(href);
          }, interval * i);
        });
        setTimeout(() => {
          router.replace(router.asPath, undefined, { scroll: false });
          toast.success(t("downloadResponsesTable.notifications.downloadComplete"));
        }, interval * response.data.length);
      })
      .catch((err) => {
        logMessage.error(err as Error);
        setErrors({ ...errors, downloadError: true });
      });
  };

  const blockDownload = (
    submission: TypeOmit<VaultSubmission, "formSubmission" | "submissionID" | "confirmationCode">
  ) => {
    const daysPast = getDaysPassed(submission.createdAt);

    if (
      submission.status === VaultStatus.NEW &&
      accountEscalated &&
      daysPast < Number(overdueAfter)
    ) {
      return true;
    }
    return false;
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
          <Alert.Danger>
            <Alert.Title>
              {t("downloadResponsesTable.errors.trySelectingLessFilesHeader", {
                max: MAX_FILE_DOWNLOADS,
              })}
            </Alert.Title>
            <p className="text-sm text-[#26374a]">
              {t("downloadResponsesTable.errors.trySelectingLessFiles", {
                max: MAX_FILE_DOWNLOADS,
              })}
            </p>
          </Alert.Danger>
        )}
        {errors.noItemsError && (
          <Alert.Danger>
            <Alert.Title>{t("downloadResponsesTable.errors.atLeastOneFileHeader")}</Alert.Title>
            <p className="text-sm text-[#26374a]">
              {t("downloadResponsesTable.errors.atLeastOneFile")}
            </p>
          </Alert.Danger>
        )}
        {errors.downloadError && (
          <Alert.Danger>
            <Alert.Title>
              {t("downloadResponsesTable.errors.errorDownloadingFilesHeader")}
            </Alert.Title>
            <p className="mb-2 text-sm text-[#26374a]">
              {t("downloadResponsesTable.errors.errorDownloadingFiles")}
              <Link href="/form-builder/support">
                {t("downloadResponsesTable.errors.errorDownloadingFilesLink")}
              </Link>
              .
            </p>
          </Alert.Danger>
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
          {tableItems.sortedItems.map((submission) => {
            const isBlocked = blockDownload(submission);
            return (
              <tr
                key={submission.name}
                className={
                  "border-b-2 border-grey" +
                  (tableItems.statusItems.get(submission.name) ? " bg-[#fffbf3]" : "") +
                  (isBlocked ? " opacity-50" : "")
                }
              >
                <td className="flex whitespace-nowrap pb-2 pl-8 pr-4">
                  <div className="gc-input-checkbox">
                    <input
                      id={submission.name}
                      className="gc-input-checkbox__input"
                      name="responses"
                      type="checkbox"
                      checked={tableItems.statusItems.get(submission.name)}
                      onChange={handleChecked}
                      {...(isBlocked && { disabled: true })}
                    />
                    <label className="gc-checkbox-label" htmlFor={submission.name}>
                      <span className="sr-only">{submission.name}</span>
                    </label>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4">{submission.name}</td>
                <td className="whitespace-nowrap px-4">
                  <DownloadStatus vaultStatus={submission.status} />
                </td>
                <td className="whitespace-nowrap px-4">
                  <DownloadResponseStatus
                    vaultStatus={submission.status}
                    createdAt={submission.createdAt}
                    downloadedAt={submission.downloadedAt}
                    overdueAfter={overdueAfter ? parseInt(overdueAfter) : undefined}
                  />
                </td>
                <td className="whitespace-nowrap px-4">
                  <div className="w-40 truncate">
                    {submission.lastDownloadedBy ||
                      t("downloadResponsesTable.status.notDownloaded")}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4">
                  <ConfirmReceiptStatus
                    vaultStatus={submission.status}
                    createdAtDate={submission.createdAt}
                    overdueAfter={overdueAfter ? parseInt(overdueAfter) : undefined}
                  />
                </td>
                <td className="whitespace-nowrap px-4">
                  <RemovalStatus vaultStatus={submission.status} removalAt={submission.removedAt} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-8 flex">
        <button
          id="downloadTableButtonId"
          className="gc-button--blue m-0 w-auto whitespace-nowrap"
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
            <Alert.Danger icon={false}>
              <Alert.Title headingTag="h3">
                {t("downloadResponsesTable.errors.trySelectingLessFilesHeader", {
                  max: MAX_FILE_DOWNLOADS,
                })}
              </Alert.Title>
              <p className="text-sm text-black">
                {t("downloadResponsesTable.errors.trySelectingLessFiles", {
                  max: MAX_FILE_DOWNLOADS,
                })}
              </p>
            </Alert.Danger>
          )}
          {errors.noItemsError && (
            <Alert.Danger icon={false}>
              <Alert.Title headingTag="h3">
                {t("downloadResponsesTable.errors.atLeastOneFileHeader")}
              </Alert.Title>
              <p className="text-sm text-black">
                {t("downloadResponsesTable.errors.atLeastOneFile")}
              </p>
            </Alert.Danger>
          )}
          {errors.downloadError && (
            <Alert.Danger icon={false}>
              <Alert.Title headingTag="h3">
                {t("downloadResponsesTable.errors.errorDownloadingFilesHeader")}
              </Alert.Title>
              <p className="text-sm text-black">
                {t("downloadResponsesTable.errors.errorDownloadingFiles")}
              </p>
            </Alert.Danger>
          )}
        </div>
      </div>
    </section>
  );
};
