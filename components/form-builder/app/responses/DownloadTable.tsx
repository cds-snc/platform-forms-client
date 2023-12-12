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
import { useRouter } from "next/router";
import { useSetting } from "@lib/hooks/useSetting";
import Link from "next/link";
import { TableActions, initialTableItemsState, reducerTableItems } from "./DownloadTableReducer";
import { getDaysPassed, isStatus } from "@lib/clientHelpers";
import { Alert } from "@components/globals";
import { CheckAll } from "./CheckAll";
import { DownloadButton } from "./DownloadButton";
import { ActionsPanel } from "./ActionsPanel";
import { DeleteButton } from "./DeleteButton";
import { ConfirmDeleteNewDialog } from "./Dialogs/ConfirmDeleteNewDialog";
import { DownloadDialog } from "./Dialogs/DownloadDialog";
import { formatDateTime } from "@components/form-builder/util";
import { WarningIcon } from "@components/form-builder/icons";
import { DownloadSingleButton } from "./DownloadSingleButton";
import { Pagination } from "./Pagination";

interface DownloadTableProps {
  vaultSubmissions: VaultSubmissionList[];
  formName: string;
  formId: string;
  nagwareResult: NagwareResult | null;
  responseDownloadLimit: number;
  showDownloadSuccess: false | string;
  setShowDownloadSuccess: React.Dispatch<React.SetStateAction<false | string>>;
  lastEvaluatedKey: Record<string, string> | null | undefined;
}

export const DownloadTable = ({
  vaultSubmissions,
  formName,
  formId,
  nagwareResult,
  responseDownloadLimit,
  setShowDownloadSuccess,
  lastEvaluatedKey,
}: DownloadTableProps) => {
  const { t } = useTranslation("form-builder-responses");
  const router = useRouter();
  const [, statusQuery = "new"] = router.query?.params || [];

  const [downloadError, setDownloadError] = useState(false);
  const [noSelectedItemsError, setNoSelectedItemsError] = useState(false);
  const [showConfirmNewtDialog, setShowConfirmNewDialog] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);

  const accountEscalated = nagwareResult && nagwareResult.level > 2;

  const { value: overdueAfter } = useSetting("nagwarePhaseEncouraged");
  const [tableItems, tableItemsDispatch] = useReducer(
    reducerTableItems,
    initialTableItemsState(vaultSubmissions, overdueAfter)
  );

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
      isStatus(submission.status, VaultStatus.NEW) &&
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
          anchor="#reportProblemButton"
        />
        <div id="notificationsTop">
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
          <caption>
            <span className="sr-only">{t("downloadResponsesTable.header.tableTitle")}</span>
          </caption>
          <thead className="border-b-1 border-slate-400">
            <tr>
              <th scope="col" className="py-4 pr-3 text-center">
                <CheckAll
                  tableItems={tableItems}
                  tableItemsDispatch={tableItemsDispatch}
                  noSelectedItemsError={noSelectedItemsError}
                  setNoSelectedItemsError={setNoSelectedItemsError}
                />
              </th>
              <th scope="col" className="p-4 text-left">
                {t("downloadResponsesTable.header.number")}
              </th>
              <th scope="col" className="p-4 text-left">
                {t("downloadResponsesTable.header.date")}
              </th>
              <th scope="col" className="w-full p-4 text-left">
                {t("downloadResponsesTable.header.nextStep")}
              </th>
              <th scope="col" className="py-4 text-center">
                {t("downloadResponsesTable.header.download")}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b-1 border-slate-300 bg-slate-100 py-2">
              <th scope="row">
                <WarningIcon className="mx-8 mt-1 inline-block scale-125" />{" "}
                <span className="sr-only">{t("downloadResponsesTable.header.warning")}</span>
              </th>
              <td className="relative px-4 py-2" colSpan={4}>
                <div>
                  {isStatus(statusQuery, VaultStatus.NEW) &&
                    t("downloadResponsesTable.header.pagination.new.remainingResponses", {
                      max: responseDownloadLimit,
                    })}
                  {isStatus(statusQuery, VaultStatus.DOWNLOADED) &&
                    t("downloadResponsesTable.header.pagination.downloaded.remainingResponses", {
                      max: responseDownloadLimit,
                    })}
                  {isStatus(statusQuery, VaultStatus.CONFIRMED) &&
                    t("downloadResponsesTable.header.pagination.confirmed.remainingResponses", {
                      max: responseDownloadLimit,
                    })}
                </div>
                <div className="absolute right-0 top-0 mr-4 mt-2">
                  <Pagination
                    lastEvaluatedKey={lastEvaluatedKey}
                    formId={formId}
                    responseDownloadLimit={responseDownloadLimit}
                    recordCount={vaultSubmissions.length}
                  />
                </div>
              </td>
            </tr>

            {tableItems.sortedItems.map((submission) => {
              const isBlocked = blockDownload(submission);
              const createdDateTime = formatDateTime(submission.createdAt).join(" ");
              const downloadedDateTime = submission.downloadedAt
                ? formatDateTime(submission.downloadedAt).join(" ")
                : "";
              const confirmedDateTime = submission.confirmedAt
                ? formatDateTime(submission.confirmedAt).join(" ")
                : "";
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
                  <th
                    scope="row"
                    id={submission.name}
                    className="whitespace-nowrap px-4 font-normal"
                  >
                    <span className="sr-only">{t("downloadResponsesTable.header.download")}</span>
                    {submission.name}
                  </th>
                  <td className="whitespace-nowrap px-4">
                    {isStatus(statusQuery, [VaultStatus.NEW, VaultStatus.PROBLEM]) && (
                      <span>{createdDateTime}</span>
                    )}
                    {isStatus(statusQuery, VaultStatus.DOWNLOADED) && (
                      <span>{downloadedDateTime}</span>
                    )}
                    {isStatus(statusQuery, VaultStatus.CONFIRMED) && (
                      <span>{confirmedDateTime}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4">
                    {isStatus(statusQuery, VaultStatus.NEW) && (
                      <DownloadResponseStatus
                        vaultStatus={submission.status}
                        createdAt={submission.createdAt}
                        downloadedAt={submission.downloadedAt}
                        overdueAfter={overdueAfter ? parseInt(overdueAfter) : undefined}
                      />
                    )}
                    {isStatus(statusQuery, VaultStatus.DOWNLOADED) && (
                      <ConfirmReceiptStatus
                        vaultStatus={submission.status}
                        createdAtDate={submission.createdAt}
                        overdueAfter={overdueAfter ? parseInt(overdueAfter) : undefined}
                      />
                    )}
                    {isStatus(statusQuery, VaultStatus.CONFIRMED) && (
                      <RemovalStatus
                        vaultStatus={submission.status}
                        removalAt={submission.removedAt}
                      />
                    )}
                    {isStatus(statusQuery, VaultStatus.PROBLEM) && (
                      <p className="text-red">
                        <strong>{t("supportWillContact")}</strong>
                        <br />
                        {t("reportedAsProblem")}
                      </p>
                    )}
                  </td>
                  <td className="whitespace-nowrap text-center">
                    <DownloadSingleButton
                      id={`button-${submission.name}`}
                      formId={submission.formID}
                      responseId={submission.name}
                      onDownloadSuccess={() => {
                        router.replace(router.asPath, undefined, { scroll: false });
                        if (isStatus(statusQuery, VaultStatus.NEW)) {
                          setShowDownloadSuccess("downloadSuccess");
                        }
                      }}
                      setDownloadError={setDownloadError}
                      ariaLabelledBy={submission.name}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="mt-8 flex">
          <div id="notificationsBottom" className="ml-4">
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
            setShowDownloadDialog={setShowDownloadDialog}
            onClick={() => setDownloadError(false)}
          />
          {isStatus(statusQuery, VaultStatus.NEW) && false && (
            <DeleteButton setShowConfirmNewDialog={setShowConfirmNewDialog} />
          )}
        </ActionsPanel>
      )}

      <ConfirmDeleteNewDialog
        isVisible={showConfirmNewtDialog}
        setIsVisible={setShowConfirmNewDialog}
      />

      <DownloadDialog
        checkedItems={tableItems.checkedItems}
        isDialogVisible={showDownloadDialog}
        setIsDialogVisible={setShowDownloadDialog}
        formId={formId}
        formName={formName}
        onSuccessfulDownload={() => {
          router.replace(router.asPath, undefined, { scroll: false });
          if (isStatus(statusQuery, VaultStatus.NEW)) {
            setShowDownloadSuccess("downloadSuccess");
          }
        }}
        downloadError={downloadError}
        setDownloadError={setDownloadError}
        responseDownloadLimit={responseDownloadLimit}
      />
    </>
  );
};
