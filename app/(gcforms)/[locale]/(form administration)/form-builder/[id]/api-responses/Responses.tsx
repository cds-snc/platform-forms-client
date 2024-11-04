"use client";
import { useState, useEffect } from "react";
import { ClosedBanner } from "@formBuilder/components/shared/ClosedBanner";
import { useTranslation } from "@i18n/client";
import { useParams, useSearchParams } from "next/navigation";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { DownloadTable } from "../responses/[statusFilter]/components/DownloadTable";
import { NagLevel, VaultSubmissionList } from "@lib/types";
import { fetchSubmissions } from "./actions";
import { RetrievalError } from "../responses/[statusFilter]/components/RetrievalError";
import { Card, HeadingLevel } from "@clientComponents/globals/card/Card";
import Image from "next/image";

export interface ResponsesProps {
  responseDownloadLimit: number;
  overdueAfter: number;
}

export const Responses = ({ responseDownloadLimit, overdueAfter }: ResponsesProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("form-builder-responses");
  const statusFilter = useParams<{ statusFilter: string }>();
  const searchParams = useSearchParams();
  const lastKey = searchParams?.get("lastKey");

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
      // status: statusFilter,
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

  const nagwareResult = { level: NagLevel.None, numberOfSubmissions: 0 };

  if (state.loading) {
    return null;
  }
  if (state.error) {
    return <RetrievalError />;
  }

  return (
    <>
      {/* TODO do something about aria-live so high in the tree */}
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
          // TODO update strings
          <Card
            icon={<Image src="/img/mailbox.svg" alt="" width="200" height="200" />}
            title={t("downloadResponsesTable.card.noDeletedResponses")}
            content={t("downloadResponsesTable.card.noDeletedResponsesMessage")}
            headingTag={HeadingLevel.H1}
            headingStyle="gc-h2 text-[#748094]"
          />
        )}
      </div>
    </>
  );
};
