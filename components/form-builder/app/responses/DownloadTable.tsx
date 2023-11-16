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
import { useSetting } from "@lib/hooks/useSetting";
import Link from "next/link";
import { TableActions, initialTableItemsState, reducerTableItems } from "./DownloadTableReducer";
import { getDaysPassed } from "@lib/clientHelpers";
import { Alert } from "@components/globals";
import { CheckAll } from "./CheckAll";
import { DownloadButton } from "./DownloadButton";
import { toast } from "../shared";
import { MoreMenu } from "./MoreMenu";
import { ActionsPanel } from "./ActionsPanel";

interface DownloadTableProps {
  vaultSubmissions: VaultSubmissionList[];
  formId: string;
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

  const [downloadError, setDownloadError] = useState(false);
  const [noSelectedItemsError, setNoSelectedItemsError] = useState(false);

  const accountEscalated = nagwareResult && nagwareResult.level > 2;

  const { value: overdueAfter } = useSetting("nagwarePhaseEncouraged");
  const [tableItems, tableItemsDispatch] = useReducer(
    reducerTableItems,
    initialTableItemsState(vaultSubmissions, overdueAfter)
  );

  const MAX_FILE_DOWNLOADS = responseDownloadLimit;

  const handleChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.id;
    const checked: boolean = e.target.checked;
    const dispatchAction = { type: TableActions.UPDATE, payload: { item: { name, checked } } };
    tableItemsDispatch(dispatchAction);

    // Needed because of how useReducer updates state on the next render vs. inside this function..
    const nextState = reducerTableItems(tableItems, dispatchAction);

    if (nextState.checkedItems.size > 0) {
      setNoSelectedItemsError(false);
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
    // Reset tableItems when vaultSubmissions changes (ie, when switching between Status tabs)
    const dispatchAction = { type: TableActions.RESET, payload: { vaultSubmissions } };
    tableItemsDispatch(dispatchAction);
  }, [vaultSubmissions]);

  return (
    <>
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
          {noSelectedItemsError && (
            <Alert.Danger>
              <Alert.Title>{t("downloadResponsesTable.errors.atLeastOneFileHeader")}</Alert.Title>
              <p className="text-sm text-[#26374a]">
                {t("downloadResponsesTable.errors.atLeastOneFile")}
              </p>
            </Alert.Danger>
          )}
          {downloadError && (
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
        <table className="w-full text-sm" aria-live="polite">
          <caption className="sr-only">{t("downloadResponsesTable.header.tableTitle")}</caption>
          <thead className="border-b-2 border-[#6a6d7b]">
            <tr>
              <th className="p-4 text-center">
                <CheckAll
                  tableItems={tableItems}
                  tableItemsDispatch={tableItemsDispatch}
                  noSelectedItemsError={noSelectedItemsError}
                  setNoSelectedItemsError={setNoSelectedItemsError}
                />
              </th>
              <th className="p-4 text-left">{t("downloadResponsesTable.header.number")}</th>
              <th className="p-4 text-left">{t("downloadResponsesTable.header.status")}</th>
              <th className="p-4 text-left">
                {t("downloadResponsesTable.header.downloadResponse")}
              </th>
              <th className="p-4 text-left">
                {t("downloadResponsesTable.header.lastDownloadedBy")}
              </th>
              <th className="p-4 text-left">{t("downloadResponsesTable.header.confirmReceipt")}</th>
              <th className="p-4 text-left">{t("downloadResponsesTable.header.removal")}</th>
              <th className="p-4 text-left">{t("downloadResponsesTable.header.more")}</th>
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
                  <td className="flex whitespace-nowrap pb-2 pl-9 pr-4">
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
                    <RemovalStatus
                      vaultStatus={submission.status}
                      removalAt={submission.removedAt}
                    />
                  </td>
                  <td className="px-4">
                    <MoreMenu
                      formId={submission.formID}
                      responseId={submission.name}
                      onDownloadSuccess={() => {
                        router.replace(router.asPath, undefined, { scroll: false });
                        toast.success(t("downloadResponsesTable.notifications.downloadComplete"));
                      }}
                      setDownloadError={setDownloadError}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-8 flex">
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
            {noSelectedItemsError && (
              <Alert.Danger icon={false}>
                <Alert.Title headingTag="h3">
                  {t("downloadResponsesTable.errors.atLeastOneFileHeader")}
                </Alert.Title>
                <p className="text-sm text-black">
                  {t("downloadResponsesTable.errors.atLeastOneFile")}
                </p>
              </Alert.Danger>
            )}
            {downloadError && (
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

      {tableItems.checkedItems.size > 0 && (
        <ActionsPanel>
          <DownloadButton
            formId={formId}
            downloadError={downloadError}
            setDownloadError={setDownloadError}
            setNoSelectedItemsError={setNoSelectedItemsError}
            checkedItems={tableItems.checkedItems}
            canDownload={tableItems.checkedItems.size <= MAX_FILE_DOWNLOADS}
            onSuccessfulDownload={() => {
              router.replace(router.asPath, undefined, { scroll: false });
              toast.success(t("downloadResponsesTable.notifications.downloadComplete"));
            }}
          />
        </ActionsPanel>
      )}
    </>
  );
};
