"use client";
import { Nagware } from "@clientComponents/form-builder/app/Nagware";
import { ClosedBanner } from "@clientComponents/form-builder/app/shared/ClosedBanner";
import { useRehydrate } from "@clientComponents/form-builder/hooks";
import { useTranslation } from "@i18n/client";
import { ucfirst } from "@lib/client/clientHelpers";
import { FormRecord, NagwareResult, VaultSubmissionList } from "@lib/types";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ReportDialog } from "./Dialogs/ReportDialog";
import { DownloadTable } from "./DownloadTable";
import { NoResponses } from "./NoResponses";

export interface ResponsesProps {
  initialForm: FormRecord | null;
  vaultSubmissions: VaultSubmissionList[];
  nagwareResult: NagwareResult | null;
  responseDownloadLimit: number;
  lastEvaluatedKey: Record<string, string> | null | undefined;
  overdueAfter: number;
}

// TODO: move to an app setting variable
const MAX_REPORT_COUNT = 20;

export const Responses = ({
  initialForm,
  vaultSubmissions,
  nagwareResult,
  responseDownloadLimit,
  lastEvaluatedKey,
  overdueAfter,
}: ResponsesProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("form-builder-responses");
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const { id, statusFilter: rawStatusFilter } = useParams<{ id: string; statusFilter: string }>();
  const statusFilter = ucfirst(rawStatusFilter);

  const formId = id;

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
                  lastEvaluatedKey={lastEvaluatedKey}
                  overdueAfter={overdueAfter}
                />
              </>
            )}
            {vaultSubmissions.length <= 0 && <NoResponses statusFilter={statusFilter} />}
          </div>
          <div className="mt-8">
            <ReportDialog
              apiUrl={`/api/id/${formId}/submission/report`}
              maxEntries={MAX_REPORT_COUNT}
            />
            <Link
              href={`/form-builder/${formId}/responses/problem`}
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
    </>
  );
};
