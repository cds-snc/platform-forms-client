import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";

import { fetchSubmissions } from "@formBuilder/[id]/responses/[[...statusFilter]]/actions";

import { VaultStatus, VaultSubmissionOverview } from "@lib/types";
import {
  HealthCheckBox,
  NumberCount,
} from "@clientComponents/globals/HealthCheckBox/HealthCheckBox";

export const ProblemsReported = ({ formId }: { formId: string }) => {
  const [problemSubmissions, setProblemSubmissions] = useState<{
    loading: boolean;
    submissions: VaultSubmissionOverview[];
    lastEvaluatedKey: Record<string, string> | null | undefined;
    error: boolean;
  }>({ loading: true, submissions: [], lastEvaluatedKey: null, error: false });

  useEffect(() => {
    fetchSubmissions({
      formId,
      lastKey: null,
      status: VaultStatus.PROBLEM,
    })
      .then(({ submissions, error }) => {
        setProblemSubmissions({
          loading: false,
          lastEvaluatedKey: null,
          submissions,
          error: Boolean(error),
        });
      })
      .catch(() =>
        setProblemSubmissions({
          loading: false,
          submissions: [],
          lastEvaluatedKey: null,
          error: true,
        })
      );
  }, [formId]);

  if (problemSubmissions.loading) {
    return <Skeleton count={1} height={148} className="mb-4 w-[290px]" />;
  }

  if (problemSubmissions.submissions.length > 0) {
    return (
      <HealthCheckBox.Danger
        titleKey="systemHealth.problemsReported.title"
        status={<NumberCount count={problemSubmissions.submissions.length} />}
      >
        <HealthCheckBox.Text i18nKey="systemHealth.problemsReported.description" />
      </HealthCheckBox.Danger>
    );
  }

  return null;
};
