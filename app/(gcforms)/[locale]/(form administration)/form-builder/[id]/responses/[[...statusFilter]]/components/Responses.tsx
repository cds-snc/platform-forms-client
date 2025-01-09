"use client";
import { useState, useEffect } from "react";
import { Nagware } from "@formBuilder/components/Nagware";
import { ClosedBanner } from "@formBuilder/components/shared/ClosedBanner";
import { useTranslation } from "@i18n/client";
import { ucfirst } from "@lib/client/clientHelpers";
import { useSearchParams } from "next/navigation";
import { DownloadTable } from "./DownloadTable";
import { NoResponses } from "./NoResponses";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { TitleAndDescription } from "./TitleAndDescription";
import { NagLevel, StartFromExclusiveResponse, VaultSubmissionOverview } from "@lib/types";
import { RetrievalError } from "./RetrievalError";
import { fetchSubmissions } from "../actions";
import { StatusFilter } from "../types";
import { SystemStatus } from "../../[statusFilter]/components/SystemStatus/SystemStatus";

export interface ResponsesProps {
  hasOverdue: boolean;
  responseDownloadLimit: number;
  overdueAfter: number;
  statusFilter: StatusFilter;
  isApiRetrieval?: boolean;
}

export const Responses = ({
  hasOverdue,
  responseDownloadLimit,
  overdueAfter,
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

  const [forceRefresh, setForceRefresh] = useState(Date.now());

  const [state, setState] = useState<{
    loading: boolean;
    submissions: VaultSubmissionOverview[];
    startFromExclusiveResponse: StartFromExclusiveResponse | null;
    error: boolean;
  }>({ loading: true, submissions: [], startFromExclusiveResponse: null, error: false });

  useEffect(() => {
    fetchSubmissions({
      formId,
      status: statusFilter,
      lastKey,
    })
      .then(({ submissions, startFromExclusiveResponse, error }) => {
        setState({
          loading: false,
          submissions,
          startFromExclusiveResponse: startFromExclusiveResponse ?? null,
          error: Boolean(error),
        });
      })
      .catch(() =>
        setState({ loading: false, submissions: [], startFromExclusiveResponse: null, error: true })
      );
  }, [formId, lastKey, statusFilter, forceRefresh]);

  const formName = name ? name : language === "fr" ? initialForm.titleFr : initialForm.titleEn;

  // The nagware will be refactored during the database optimiztion work.
  const nagwareResult = { level: NagLevel.None, numberOfSubmissions: 0 };

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
                formName={formName}
                formId={formId}
                nagwareResult={nagwareResult}
                responseDownloadLimit={responseDownloadLimit}
                startFromExclusiveResponse={state.startFromExclusiveResponse}
                overdueAfter={overdueAfter}
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

      <Nagware nagwareResult={nagwareResult} />
      <div aria-live="polite">
        <ClosedBanner id={formId} />
        {state.submissions.length > 0 ? (
          <>
            <DownloadTable
              statusFilter={statusFilter}
              vaultSubmissions={state.submissions}
              formName={formName}
              formId={formId}
              nagwareResult={nagwareResult}
              responseDownloadLimit={responseDownloadLimit}
              startFromExclusiveResponse={state.startFromExclusiveResponse}
              overdueAfter={overdueAfter}
            />
          </>
        ) : (
          <NoResponses formId={formId} statusFilter={statusFilter} />
        )}
      </div>
    </>
  );
};
