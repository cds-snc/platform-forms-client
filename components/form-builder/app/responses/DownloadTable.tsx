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
import { logMessage } from "@lib/logger";
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
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "@components/form-builder/icons";

// TODO: move to an app setting variable
const MAX_FILE_DOWNLOADS = 100;

interface DownloadTableProps {
  vaultSubmissions: VaultSubmissionList[];
  formId?: string;
  nagwareResult: NagwareResult | null;
}

export const DownloadTable = ({ vaultSubmissions, formId, nagwareResult }: DownloadTableProps) => {
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

  const handleCheckAll = () => {
    vaultSubmissions.forEach((submission) => {
      tableItemsDispatch({
        type: TableActions.UPDATE,
        payload: { item: { name: submission.name, checked: true } },
      });
    });

    // Show or hide errors depending
    if (tableItems.checkedItems.size > MAX_FILE_DOWNLOADS && !errors.maxItemsError) {
      setErrors({ ...errors, maxItemsError: true });
    } else if (errors.maxItemsError) {
      setErrors({ ...errors, maxItemsError: false });
    }
    if (tableItems.checkedItems.size > 0 && errors.noItemsError) {
      setErrors({ ...errors, noItemsError: false });
    }
  };

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

  const handleDownloadAsCsv = async () => {
    // Handle any errors and show them
    if (tableItems.checkedItems.size === 0) {
      if (!errors.noItemsError) {
        setErrors({ ...errors, noItemsError: true });
      }
      return;
    }

    const url = `/api/id/${formId}/submissions/download?format=csv`;
    const ids = Array.from(tableItems.checkedItems.keys());

    return axios({
      url,
      method: "POST",
      responseType: "blob",
      data: {
        ids: ids.join(","),
      },
    }).then((response) => {
      const href = window.URL.createObjectURL(response.data);

      const anchorElement = document.createElement("a");

      anchorElement.href = href;
      anchorElement.download = "records.csv";

      document.body.appendChild(anchorElement);
      anchorElement.click();

      document.body.removeChild(anchorElement);
      window.URL.revokeObjectURL(href);
    });
  };

  const handleDownloadAsExcel = async () => {
    // Handle any errors and show them
    if (tableItems.checkedItems.size === 0) {
      if (!errors.noItemsError) {
        setErrors({ ...errors, noItemsError: true });
      }
      return;
    }

    const url = `/api/id/${formId}/submissions/download?format=xlsx`;
    const ids = Array.from(tableItems.checkedItems.keys());

    return axios({
      url,
      method: "POST",
      responseType: "blob",
      data: {
        ids: ids.join(","),
      },
    }).then((response) => {
      const href = window.URL.createObjectURL(response.data);

      const anchorElement = document.createElement("a");

      anchorElement.href = href;
      anchorElement.download = "records.xlsx";

      document.body.appendChild(anchorElement);
      anchorElement.click();

      document.body.removeChild(anchorElement);
      window.URL.revokeObjectURL(href);
    });
  };

  const handleDownloadAsHtmlTable = async () => {
    // Handle any errors and show them
    if (tableItems.checkedItems.size === 0) {
      if (!errors.noItemsError) {
        setErrors({ ...errors, noItemsError: true });
      }
      return;
    }

    const url = `/api/id/${formId}/submissions/download?format=html-table`;
    const ids = Array.from(tableItems.checkedItems.keys());

    return axios({
      url,
      method: "POST",
      responseType: "blob",
      data: {
        ids: ids.join(","),
      },
    }).then((response) => {
      const href = window.URL.createObjectURL(response.data);

      const anchorElement = document.createElement("a");

      anchorElement.href = href;
      anchorElement.download = "records.html";

      document.body.appendChild(anchorElement);
      anchorElement.click();

      document.body.removeChild(anchorElement);
      window.URL.revokeObjectURL(href);
    });
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
        }).then(async (response) => {
          const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();
          await timer(1000);
        });
      });

      await Promise.all(downloads).then(() => {
        // TODO: only occurs download more than one file at a time. Here is the issue to track
        // https://github.com/cds-snc/platform-forms-client/issues/1744
        setTimeout(() => {
          // Refreshes getServerSideProps data without a full page reload
          router.replace(router.asPath, undefined, { scroll: false });
          toast.success(t("downloadResponsesTable.notifications.downloadComplete"));
        }, 1000); // Increasing to 1 second to allow more time for prod - temp work around
      });
    } catch (err) {
      logMessage.error(err as Error);
      setErrors({ ...errors, downloadError: true });
    }
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
            <th className="p-4 text-center" onClick={handleCheckAll}>
              {t("downloadResponsesTable.header.select")}
            </th>
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
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <div
              className="gc-button--blue m-0 w-auto whitespace-nowrap"
              data-testid="yourAccountDropdown"
            >
              <span className="mr-1 inline-block">
                {t("downloadResponsesTable.downloadXSelectedResponses", {
                  size: tableItems.checkedItems.size,
                })}
              </span>
              <ChevronDown className="mt-[2px]" />
            </div>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              data-testid="yourAccountDropdownContent"
              align="end"
              className={`mt-1.5 min-w-[230px] rounded-lg border-1 border-black bg-white px-1.5 py-1 shadow-md`}
            >
              <DropdownMenu.Item onClick={handleDownload} asChild>
                <Link
                  className="block rounded-md p-2 text-sm text-black !no-underline !shadow-none outline-none visited:text-black hover:bg-gray-600 hover:text-white focus:bg-gray-600 focus:text-white-default"
                  href="#"
                >
                  Download as HTML
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="mb-2 border-b pt-2" />

              <DropdownMenu.Item onClick={handleDownloadAsCsv} asChild>
                <Link
                  className="block rounded-md p-2 text-sm text-black !no-underline !shadow-none outline-none visited:text-black hover:bg-gray-600 hover:text-white focus:bg-gray-600 focus:text-white-default"
                  href="#"
                >
                  Download as CSV
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Item onClick={handleDownloadAsExcel} asChild>
                <Link
                  className="block rounded-md p-2 text-sm text-black !no-underline !shadow-none outline-none visited:text-black hover:bg-gray-600 hover:text-white focus:bg-gray-600 focus:text-white-default"
                  href="#"
                >
                  Download as Excel
                </Link>
              </DropdownMenu.Item>

              <DropdownMenu.Item onClick={handleDownloadAsHtmlTable} asChild>
                <Link
                  className="block rounded-md p-2 text-sm text-black !no-underline !shadow-none outline-none visited:text-black hover:bg-gray-600 hover:text-white focus:bg-gray-600 focus:text-white-default"
                  href="#"
                >
                  Download as HTML Table
                </Link>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

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
