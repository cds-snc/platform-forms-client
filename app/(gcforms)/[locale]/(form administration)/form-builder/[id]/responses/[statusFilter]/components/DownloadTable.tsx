import React, { useEffect, useReducer, useState } from "react";
import {
  NagwareResult,
  TypeOmit,
  VaultStatus,
  VaultSubmission,
  VaultSubmissionList,
} from "@lib/types";
import { useTranslation } from "@i18n/client";
import { SkipLinkReusable } from "@clientComponents/globals/SkipLinkReusable";
import { useParams } from "next/navigation";
import Link from "next/link";
import { TableActions, initialTableItemsState, reducerTableItems } from "./DownloadTableReducer";
import { getDaysPassed, ucfirst } from "@lib/client/clientHelpers";
import { Alert } from "@clientComponents/globals";
import { CheckAll } from "./CheckAll";
import { DownloadButton } from "./DownloadButton";
import { ActionsPanel } from "./ActionsPanel";
import { DeleteButton } from "./DeleteButton";
import { ConfirmDeleteNewDialog } from "./Dialogs/ConfirmDeleteNewDialog";
import { DownloadDialog } from "./Dialogs/DownloadDialog";
import { formatDateTime } from "@clientComponents/form-builder/util";
import { DownloadSingleButton } from "./DownloadSingleButton";
import { Pagination } from "./Pagination";
import { cn } from "@lib/utils";
import { NextStep } from "./NextStep";

interface DownloadTableProps {
  vaultSubmissions: VaultSubmissionList[];
  formName: string;
  formId: string;
  nagwareResult: NagwareResult | null;
  responseDownloadLimit: number;
  lastEvaluatedKey?: Record<string, string> | null;
  overdueAfter: number;
}

export const DownloadTable = ({
  vaultSubmissions,
  formName,
  formId,
  nagwareResult,
  responseDownloadLimit,
  lastEvaluatedKey,
  overdueAfter,
}: DownloadTableProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("form-builder-responses");

  const { statusFilter: rawStatusFilter } = useParams<{ statusFilter: string }>();
  const statusFilter = ucfirst(rawStatusFilter);
  const [downloadError, setDownloadError] = useState(false);
  const [noSelectedItemsError, setNoSelectedItemsError] = useState(false);
  const [showConfirmNewtDialog, setShowConfirmNewDialog] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [showDownloadSuccess, setShowDownloadSuccess] = useState<false | string>(false);
  const [removedRows, setRemovedRows] = useState<string[]>([]);
  const accountEscalated = nagwareResult && nagwareResult.level > 2;

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
      {showDownloadSuccess && (
        <Alert.Success className="mb-4">
          <Alert.Title>{t(`${showDownloadSuccess}.title`)}</Alert.Title>
          <Alert.Body>{t(`${showDownloadSuccess}.body`)}</Alert.Body>
        </Alert.Success>
      )}
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
                <Link href={`/${language}/support`}>
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
          <thead>
            <tr className="border-b-1 border-slate-300">
              <th scope="col" className="py-4 text-center">
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
            <tr className="border-y-1 border-slate-400 bg-slate-100 py-2">
              <td colSpan={5} className="px-4 py-2">
                <Pagination
                  lastEvaluatedKey={lastEvaluatedKey}
                  formId={formId}
                  responseDownloadLimit={responseDownloadLimit}
                  recordCount={vaultSubmissions.length}
                />
              </td>
            </tr>

            {tableItems.allItems.map((submission) => {
              const isBlocked = blockDownload(submission);
              const createdDateTime = formatDateTime(submission.createdAt).join(" ");
              return (
                <tr
                  key={submission.name}
                  className={cn(
                    "border-y-1 border-slate-300 hover:ring-2 hover:ring-purple-500" +
                      (tableItems.statusItems.get(submission.name) ? " bg-purple-50" : "") +
                      (isBlocked ? " opacity-50" : "") +
                      (statusFilter === VaultStatus.NEW && removedRows.includes(submission.name)
                        ? " transition-opacity opacity-50 ease-in-out duration-500"
                        : "")
                  )}
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
                  <td className="whitespace-nowrap px-4">{createdDateTime}</td>
                  <td className="whitespace-nowrap px-4">
                    <NextStep
                      statusFilter={statusFilter as VaultStatus}
                      submission={submission}
                      overdueAfter={overdueAfter ? overdueAfter : undefined}
                      removedRows={removedRows}
                    />
                  </td>
                  <td className="whitespace-nowrap text-center">
                    <DownloadSingleButton
                      id={`button-${submission.name}`}
                      formId={submission.formID}
                      responseId={submission.name}
                      onDownloadSuccess={() => {
                        setDownloadError(false);
                        setRemovedRows([...removedRows, submission.name]);
                        // router.replace(router.asPath, undefined, { scroll: false });
                        if (statusFilter === VaultStatus.NEW) {
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
            <tr className="border-y-1 border-slate-300 bg-slate-100 py-2">
              <td colSpan={5} className="px-4 py-2">
                <Pagination
                  lastEvaluatedKey={lastEvaluatedKey}
                  formId={formId}
                  responseDownloadLimit={responseDownloadLimit}
                  recordCount={vaultSubmissions.length}
                />
              </td>
            </tr>
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
          {statusFilter === VaultStatus.NEW && false && (
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
          setRemovedRows([...removedRows, ...tableItems.checkedItems.keys()]);
          // router.replace(router.asPath, undefined, { scroll: false });
          if (statusFilter === VaultStatus.NEW) {
            setShowDownloadSuccess("downloadSuccess");
          }
        }}
        setDownloadError={setDownloadError}
        responseDownloadLimit={responseDownloadLimit}
      />
    </>
  );
};
