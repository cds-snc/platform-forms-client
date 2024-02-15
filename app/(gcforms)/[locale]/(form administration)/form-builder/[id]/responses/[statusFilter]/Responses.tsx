"use client";
import { useState } from "react";
import { useTranslation } from "@i18n/client";
import { FormRecord, VaultStatus, VaultSubmissionList } from "@lib/types";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, HeadingLevel } from "@clientComponents/globals/card/Card";
import { DownloadTable } from "@clientComponents/form-builder/app/responses/DownloadTable";
import { ReportDialog } from "@clientComponents/form-builder/app/responses/Dialogs/ReportDialog";
import { NagwareResult } from "@lib/types";
import { Nagware } from "@clientComponents/form-builder/app/Nagware";
import { Button } from "@clientComponents/globals";
import { ClosedBanner } from "@clientComponents/form-builder/app/shared/ClosedBanner";
import { DeleteIcon, FolderIcon, InboxIcon, WarningIcon } from "@clientComponents/icons";
import { useRouter, useParams, usePathname } from "next/navigation";
import Image from "next/image";
import { ConfirmDialog } from "@clientComponents/form-builder/app/responses/Dialogs/ConfirmDialog";
import { Alert } from "@clientComponents/globals";
import { TabNavLink } from "@clientComponents/form-builder/app/navigation/TabNavLink";
import { useRehydrate } from "@clientComponents/form-builder/hooks";

export interface ResponsesProps {
  initialForm: FormRecord | null;
  vaultSubmissions: VaultSubmissionList[];
  nagwareResult: NagwareResult | null;
  responseDownloadLimit: number;
  lastEvaluatedKey: Record<string, string> | null | undefined;
}

// TODO: move to an app setting variable
const MAX_REPORT_COUNT = 20;

export const Responses = ({
  initialForm,
  vaultSubmissions,
  nagwareResult,
  responseDownloadLimit,
  lastEvaluatedKey,
}: ResponsesProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("form-builder-responses");
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [isShowReportProblemsDialog, setIsShowReportProblemsDialog] = useState(false);
  const [showConfirmReceiptDialog, setShowConfirmReceiptDialog] = useState(false);
  const [successAlertMessage, setShowSuccessAlert] = useState<false | string>(false);
  const router = useRouter();

  const { id, statusFilter } = useParams<{ id: string; statusFilter: string }>();
  const formId = id;

  const pathName = usePathname();

  let formName = "";
  if (initialForm) {
    formName = initialForm.name
      ? initialForm.name
      : language === "fr"
      ? initialForm.form.titleFr
      : initialForm.form.titleEn;
  }

  const hasHydrated = useRehydrate();
  if (!hasHydrated) return null;

  return (
    <>
      {/* <Head>
        <title>{t("responses.title")}</title>
      </Head> */}

      <nav
        className="relative mb-10 flex border-b border-black"
        aria-label={t("responses.navLabel")}
      >
        <TabNavLink
          id="new-responses"
          defaultActive={statusFilter === VaultStatus.NEW}
          href={`/${language}/form-builder/${formId}/responses/new`}
          setAriaCurrent={true}
          onClick={() => setShowSuccessAlert(false)}
        >
          <span className="text-sm laptop:text-base">
            <InboxIcon className="inline-block h-7 w-7" /> {t("responses.status.new")}
          </span>
        </TabNavLink>
        <TabNavLink
          defaultActive={statusFilter === VaultStatus.DOWNLOADED}
          id="downloaded-responses"
          href={`/${language}/form-builder/${formId}/responses/downloaded`}
          setAriaCurrent={true}
          onClick={() => setShowSuccessAlert(false)}
        >
          <span className="text-sm laptop:text-base">
            <FolderIcon className="inline-block h-7 w-7" /> {t("responses.status.downloaded")}
          </span>
        </TabNavLink>
        <TabNavLink
          defaultActive={statusFilter === VaultStatus.CONFIRMED}
          id="deleted-responses"
          href={`/${language}/form-builder/${formId}/responses/confirmed`}
          setAriaCurrent={true}
          onClick={() => setShowSuccessAlert(false)}
        >
          <span className="text-sm laptop:text-base">
            <DeleteIcon className="inline-block h-7 w-7" /> {t("responses.status.deleted")}
          </span>
        </TabNavLink>
      </nav>

      {isAuthenticated && vaultSubmissions.length > 0 && (
        <>
          {statusFilter === VaultStatus.NEW && (
            <>
              <h1>{t("tabs.newResponses.title")}</h1>
              <div className="mb-4">
                <p className="mb-4">
                  <strong>{t("tabs.newResponses.message1")}</strong>
                  <br />
                  {t("tabs.newResponses.message2")}
                </p>
              </div>
            </>
          )}
          {statusFilter === VaultStatus.DOWNLOADED && (
            <>
              <h1>{t("tabs.downloadedResponses.title")}</h1>
              <div className="mb-4">
                <p className="mb-4">
                  <strong>{t("tabs.downloadedResponses.message1")}</strong>
                  <br />
                  {t("tabs.downloadedResponses.message2")}
                </p>
                <Button onClick={() => setShowConfirmReceiptDialog(true)} theme="secondary">
                  {t("responses.confirmReceipt")}
                </Button>
              </div>
            </>
          )}
          {statusFilter === VaultStatus.CONFIRMED && (
            <>
              <h1>{t("tabs.confirmedResponses.title")}</h1>
              <div className="mb-4">
                <p className="mb-4">
                  <strong>{t("tabs.confirmedResponses.message1")}</strong>
                  <br />
                  {t("tabs.confirmedResponses.message2")}
                </p>
              </div>
            </>
          )}
          {statusFilter === VaultStatus.PROBLEM && (
            <>
              <h1>{t("tabs.problemResponses.title")}</h1>
              <div className="mb-4">
                <p className="mb-4">
                  <strong>{t("tabs.problemResponses.message1")}</strong>
                  <br />
                  {t("tabs.problemResponses.message2")}
                </p>
                <Button onClick={() => setShowConfirmReceiptDialog(true)} theme="secondary">
                  {t("responses.confirmReceipt")}
                </Button>
              </div>
            </>
          )}
        </>
      )}

      {successAlertMessage && (
        <Alert.Success className="mb-4">
          <Alert.Title>{t(`${successAlertMessage}.title`)}</Alert.Title>
          <Alert.Body>{t(`${successAlertMessage}.body`)}</Alert.Body>
        </Alert.Success>
      )}

      {nagwareResult && <Nagware nagwareResult={nagwareResult} />}

      {isAuthenticated && (
        <>
          <div aria-live="polite">
            <ClosedBanner id={formId} />
            {vaultSubmissions.length > 0 && (
              <>
                <DownloadTable
                  vaultSubmissions={vaultSubmissions}
                  formName={formName}
                  formId={formId}
                  nagwareResult={nagwareResult}
                  responseDownloadLimit={responseDownloadLimit}
                  showDownloadSuccess={successAlertMessage}
                  setShowDownloadSuccess={setShowSuccessAlert}
                  lastEvaluatedKey={lastEvaluatedKey}
                />
              </>
            )}

            {vaultSubmissions.length <= 0 && statusFilter === VaultStatus.NEW && (
              <>
                <Card
                  icon={<Image src="/img/mailbox.svg" alt="" width="200" height="200" />}
                  title={t("downloadResponsesTable.card.noNewResponses")}
                  content={t("downloadResponsesTable.card.noNewResponsesMessage")}
                  headingTag={HeadingLevel.H1}
                  headingStyle="gc-h2 text-[#748094]"
                />
              </>
            )}

            {vaultSubmissions.length <= 0 && statusFilter === VaultStatus.DOWNLOADED && (
              <>
                <Card
                  icon={<Image src="/img/mailbox.svg" alt="" width="200" height="200" />}
                  title={t("downloadResponsesTable.card.noDownloadedResponses")}
                  content={t("downloadResponsesTable.card.noDownloadedResponsesMessage")}
                  headingTag={HeadingLevel.H1}
                  headingStyle="gc-h2 text-[#748094]"
                />
              </>
            )}

            {vaultSubmissions.length <= 0 && statusFilter === VaultStatus.CONFIRMED && (
              <>
                <Card
                  icon={<Image src="/img/mailbox.svg" alt="" width="200" height="200" />}
                  title={t("downloadResponsesTable.card.noDeletedResponses")}
                  content={t("downloadResponsesTable.card.noDeletedResponsesMessage")}
                  headingTag={HeadingLevel.H1}
                  headingStyle="gc-h2 text-[#748094]"
                />
              </>
            )}

            {vaultSubmissions.length <= 0 && statusFilter === VaultStatus.PROBLEM && (
              <>
                <h1 className="visually-hidden">{t("tabs.problemResponses.title")}</h1>
                <Card
                  icon={<Image src="/img/mailbox.svg" alt="" width="200" height="200" />}
                  title={t("downloadResponsesTable.card.noProblemResponses")}
                  content={t("downloadResponsesTable.card.noProblemResponsesMessage")}
                />
              </>
            )}
          </div>
          <div className="mt-8">
            <Link
              onClick={() => setIsShowReportProblemsDialog(true)}
              href={"#"}
              className="text-black visited:text-black focus:text-white-default"
              id="reportProblemButton"
            >
              <WarningIcon className="mr-2 inline-block" />
              {t("responses.reportProblems")}
            </Link>

            <Link
              href={`/form-builder/responses/${formId}/problem`}
              className="ml-12 text-black visited:text-black focus:text-white-default"
            >
              {t("responses.viewAllProblemResponses")}
            </Link>
          </div>
        </>
      )}

      {!isAuthenticated && (
        <>
          <p>
            {t("responses.unauthenticated.toAccessPagePart1")}{" "}
            <Link href={`/${language}/auth/login`}>{t("responses.unauthenticated.signIn")}</Link>{" "}
            {t("responses.unauthenticated.toAccessPagePart2")}
          </p>
          <p className="mt-8">
            {t("responses.unauthenticated.noAccount")}{" "}
            <Link href={`/${language}/signup/register`}>
              {t("responses.unauthenticated.createOne")}
            </Link>
            .
          </p>
        </>
      )}

      <ReportDialog
        isShow={isShowReportProblemsDialog}
        setIsShow={setIsShowReportProblemsDialog}
        apiUrl={`/api/id/${formId}/submission/report`}
        maxEntries={MAX_REPORT_COUNT}
      />

      <ConfirmDialog
        isShow={showConfirmReceiptDialog}
        setIsShow={setShowConfirmReceiptDialog}
        apiUrl={`/api/id/${formId}/submission/confirm`}
        maxEntries={responseDownloadLimit}
        onSuccessfulConfirm={() => {
          router.replace(pathName, { scroll: false });
          setShowSuccessAlert("confirmSuccess");
        }}
      />
    </>
  );
};
