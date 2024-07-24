"use client";
import { useState, useEffect } from "react";
import { Nagware } from "@formBuilder/components/Nagware";
import { ClosedBanner } from "@formBuilder/components/shared/ClosedBanner";
import { useTranslation } from "@i18n/client";
import { ucfirst } from "@lib/client/clientHelpers";
import { useParams, useSearchParams } from "next/navigation";
import { DownloadTable } from "./DownloadTable";
import { NoResponses } from "./NoResponses";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { TitleAndDescription } from "./TitleAndDescription";
import { NagLevel, VaultSubmissionList } from "@lib/types";
import { RetrievalError } from "./RetrievalError";
import { fetchSubmissions } from "../actions";

export interface ResponsesProps {
  responseDownloadLimit: number;
  overdueAfter: number;
}

export const Responses = ({ responseDownloadLimit, overdueAfter }: ResponsesProps) => {
  const {
    i18n: { language },
  } = useTranslation("form-builder-responses");
  const { statusFilter } = useParams<{ statusFilter: string }>();
  const searchParams = useSearchParams();
  const lastKey = searchParams.get("lastKey");

  const { initialForm, name, formId } = useTemplateStore((s) => ({
    initialForm: s.form,
    name: s.name,
    formId: s.id,
  }));
  const [state, setState] = useState<{
    loading: boolean;
    submissions: VaultSubmissionList[];
    lastEvaluatedKey: Record<string, string> | null | undefined;
    error: boolean;
  }>({ loading: true, submissions: [], lastEvaluatedKey: null, error: false });

  useEffect(() => {
    fetchSubmissions({
      formId,
      lastKey,
      status: statusFilter,
    })
      .then(({ submissions, lastEvaluatedKey, error }) => {
        setState({
          loading: false,
          submissions,
          lastEvaluatedKey: lastEvaluatedKey,
          error: Boolean(error),
        });
      })
      .catch(() =>
        setState({ loading: false, submissions: [], lastEvaluatedKey: null, error: true })
      );
  }, [formId, lastKey, statusFilter]);

  const formName = name ? name : language === "fr" ? initialForm.titleFr : initialForm.titleEn;

  // The nagware will be refactored during the database optimiztion work.
  const nagwareResult = { level: NagLevel.None, numberOfSubmissions: 0 };

  if (state.loading) {
    return null;
  }
  if (state.error) {
    return <RetrievalError />;
  }

  return (
    <>
      {state.submissions.length > 0 && (
        <TitleAndDescription
          statusFilter={ucfirst(statusFilter)}
          formId={formId}
          responseDownloadLimit={responseDownloadLimit}
        />
      )}

      <Nagware nagwareResult={nagwareResult} />
      <div aria-live="polite">
        <ClosedBanner id={formId} />
        {state.submissions.length > 0 ? (
          <>
            <DownloadTable
              vaultSubmissions={state.submissions}
              formName={formName}
              formId={formId}
              nagwareResult={nagwareResult}
              responseDownloadLimit={responseDownloadLimit}
              lastEvaluatedKey={state.lastEvaluatedKey}
              overdueAfter={overdueAfter}
            />
          </>
        ) : (
          <NoResponses statusFilter={ucfirst(statusFilter)} />
        )}
      </div>
    </>
  );
};
