"use client";
import { useState } from "react";
import { useTranslation } from "@i18n/client";
import { FormRecord, VaultSubmissionList } from "@lib/types";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { DownloadTable } from "./DownloadTable";
import { ReportDialog } from "./Dialogs/ReportDialog";
import { NagwareResult } from "@lib/types";
import { Nagware } from "@clientComponents/form-builder/app/Nagware";
import { ClosedBanner } from "@clientComponents/form-builder/app/shared/ClosedBanner";
import { WarningIcon } from "@serverComponents/icons";
import { useRouter, useParams, usePathname } from "next/navigation";

import { ConfirmDialog } from "./Dialogs/ConfirmDialog";
import { Alert } from "@clientComponents/globals";

import { useRehydrate } from "@clientComponents/form-builder/hooks";
import { ucfirst } from "@lib/client/clientHelpers";
import { TitleAndDescription } from "./TitleAndDescription";
import { NoResponses } from "./NoResponses";

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

  const { id, statusFilter: rawStatusFilter } = useParams<{ id: string; statusFilter: string }>();
  const statusFilter = ucfirst(rawStatusFilter);

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
      {isAuthenticated && vaultSubmissions.length > 0 && (
        <TitleAndDescription
          setShowConfirmReceiptDialog={setShowConfirmReceiptDialog}
          statusFilter={statusFilter}
        />
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
            {vaultSubmissions.length <= 0 && <NoResponses statusFilter={statusFilter} />}
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
