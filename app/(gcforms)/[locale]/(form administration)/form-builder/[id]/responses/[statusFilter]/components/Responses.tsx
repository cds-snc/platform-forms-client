"use client";
import { Nagware } from "@formBuilder/components/Nagware";
import { ClosedBanner } from "@formBuilder/components/shared/ClosedBanner";
import { useRehydrate } from "@lib/hooks/form-builder";
import { useTranslation } from "@i18n/client";
import { ucfirst } from "@lib/client/clientHelpers";
import { FormRecord, NagwareResult, VaultSubmissionList } from "@lib/types";
import { useParams } from "next/navigation";
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

export const Responses = ({
  initialForm,
  vaultSubmissions,
  nagwareResult,
  responseDownloadLimit,
  lastEvaluatedKey,
  overdueAfter,
}: ResponsesProps) => {
  const {
    i18n: { language },
  } = useTranslation("form-builder-responses");
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
    </>
  );
};
