"use client";
import { useState, useEffect } from "react";
import { ClosedBanner } from "@formBuilder/components/shared/ClosedBanner";
import { useTranslation } from "@i18n/client";
import { ucfirst } from "@lib/client/clientHelpers";
import { useSearchParams } from "next/navigation";
import { DownloadTable } from "./DownloadTable";
import { NoResponses } from "./NoResponses";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { TitleAndDescription } from "./TitleAndDescription";
import { StartFromExclusiveResponse, VaultSubmissionOverview } from "@lib/types";
import { RetrievalError } from "./RetrievalError";
import { fetchSubmissions } from "../actions";
import { StatusFilter } from "../types";
import { SystemStatus } from "../../[statusFilter]/components/SystemStatus/SystemStatus";
import { useFeatureDetect } from "@lib/hooks/useFeatureDetect";
import { v4 as uuid } from "uuid";

export interface ResponsesProps {
  hasOverdue: boolean;
  responseDownloadLimit: number;
  responsesDownloadZipMaxSizeMB: number;
  overdueAfter: number;
  nagwarePromptAfter: number;
  nagwareWarnAfter: number;
  nagwareEnabled: boolean;
  statusFilter: StatusFilter;
  isApiRetrieval?: boolean;
}

export const Responses = ({
  hasOverdue,
  responseDownloadLimit,
  responsesDownloadZipMaxSizeMB,
  overdueAfter,
  nagwarePromptAfter,
  nagwareWarnAfter,
  nagwareEnabled,
  statusFilter,
  isApiRetrieval = false,
}: ResponsesProps) => {
  const {
    i18n: { language },
  } = useTranslation("form-builder-responses");

  const searchParams = useSearchParams();
  const lastKey = searchParams.get("lastKey");

  const { initialForm, name, formId } = useTemplateStore((s) => ({
    initialForm: s.form,
    name: s.name,
    formId: s.id,
  }));

  useFeatureDetect({ formId });

  const [forceRefresh, setForceRefresh] = useState(uuid());

  const [state, setState] = useState<{
    loading: boolean;
    submissions: VaultSubmissionOverview[];
    startFromExclusiveResponse: StartFromExclusiveResponse | null;
    oldestDownloadedCreatedAt: number | null;
    error: boolean;
  }>({
    loading: true,
    submissions: [],
    startFromExclusiveResponse: null,
    oldestDownloadedCreatedAt: null,
    error: false,
  });

  useEffect(() => {
    fetchSubmissions({
      formId,
      status: statusFilter,
      lastKey,
    })
      .then(({ submissions, startFromExclusiveResponse, oldestDownloadedCreatedAt, error }) => {
        setState({
          loading: false,
          submissions,
          startFromExclusiveResponse: startFromExclusiveResponse ?? null,
          oldestDownloadedCreatedAt: oldestDownloadedCreatedAt ?? null,
          error: Boolean(error),
        });
      })
      .catch(() =>
        setState({
          loading: false,
          submissions: [],
          startFromExclusiveResponse: null,
          oldestDownloadedCreatedAt: null,
          error: true,
        })
      );
  }, [formId, lastKey, statusFilter, forceRefresh]);

  const formName = name ? name : language === "fr" ? initialForm.titleFr : initialForm.titleEn;

  if (state.loading) {
    return null;
  }
  if (state.error) {
    return <RetrievalError />;
  }

  if (isApiRetrieval) {
    return (
      <>
        <div aria-live="polite">
          {state.submissions.length > 0 ? (
            <>
              <SystemStatus formId={formId} hasOverdue={hasOverdue} />
              <DownloadTable
                statusFilter={statusFilter}
                vaultSubmissions={state.submissions}
                oldestDownloadedCreatedAt={state.oldestDownloadedCreatedAt}
                formName={formName}
                formId={formId}
                responseDownloadLimit={responseDownloadLimit}
                responsesDownloadZipMaxSizeMB={responsesDownloadZipMaxSizeMB}
                startFromExclusiveResponse={state.startFromExclusiveResponse}
                overdueAfter={overdueAfter}
                nagwarePromptAfter={nagwarePromptAfter}
                nagwareWarnAfter={nagwareWarnAfter}
                nagwareEnabled={nagwareEnabled}
              />
            </>
          ) : (
            <NoResponses formId={formId} statusFilter={statusFilter} />
          )}
        </div>
      </>
    );
  }

  return (
    <>
      {state.submissions.length > 0 && (
        <TitleAndDescription
          statusFilter={ucfirst(statusFilter)}
          formId={formId}
          responseDownloadLimit={responseDownloadLimit}
          setForceRefresh={setForceRefresh}
        />
      )}

      <div aria-live="polite">
        <ClosedBanner id={formId} />
        {state.submissions.length > 0 ? (
          <>
            <DownloadTable
              statusFilter={statusFilter}
              vaultSubmissions={state.submissions}
              oldestDownloadedCreatedAt={state.oldestDownloadedCreatedAt}
              formName={formName}
              formId={formId}
              responseDownloadLimit={responseDownloadLimit}
              responsesDownloadZipMaxSizeMB={responsesDownloadZipMaxSizeMB}
              startFromExclusiveResponse={state.startFromExclusiveResponse}
              overdueAfter={overdueAfter}
              nagwarePromptAfter={nagwarePromptAfter}
              nagwareWarnAfter={nagwareWarnAfter}
              nagwareEnabled={nagwareEnabled}
            />
          </>
        ) : (
          <NoResponses formId={formId} statusFilter={statusFilter} />
        )}
      </div>
    </>
  );
};
