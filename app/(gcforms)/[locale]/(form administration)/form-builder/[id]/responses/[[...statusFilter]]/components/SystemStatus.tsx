import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  HealthCheckBox,
  NumberCount,
} from "@clientComponents/globals/HealthCheckBox/HealthCheckBox";

import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";
import { newResponsesExist } from "../actions";
import { fetchSubmissions } from "../actions";
import Skeleton from "react-loading-skeleton";
import { VaultStatus, VaultSubmissionList } from "@lib/types";

const ResponsesAvailable = () => {
  const { t } = useTranslation("form-builder-responses");
  return (
    <div className="mb-4 flex gap-4">
      <div className="flex items-center justify-center text-5xl font-bold">
        {t("systemHealth.unconfirmed.new")}
      </div>
      <div className="flex items-center justify-center text-lg font-bold">
        <p className="mb-0 leading-5">
          {t("systemHealth.unconfirmed.responses")} <br /> {t("systemHealth.unconfirmed.available")}
        </p>
      </div>
    </div>
  );
};

export const SystemStatus = ({ formId }: { formId: string }) => {
  const { t } = useTranslation("form-builder");
  const { hasApiKeyId } = useFormBuilderConfig();

  const [checkingApiSubmissions, setCheckingApiSubmissions] = useState(true);
  const [hasApiSubmissions, setHasApiSubmissions] = useState(false);

  const [problemSubmissions, setProblemSubmissions] = useState<{
    loading: boolean;
    submissions: VaultSubmissionList[];
    lastEvaluatedKey: Record<string, string> | null | undefined;
    error: boolean;
  }>({ loading: true, submissions: [], lastEvaluatedKey: null, error: false });

  useEffect(() => {
    const getApiSubmissions = async () => {
      const result = await newResponsesExist(formId);
      if (result === true) {
        setHasApiSubmissions(true);
      }
      setCheckingApiSubmissions(false);
    };
    if (hasApiKeyId) {
      getApiSubmissions();
    }
  }, [hasApiKeyId, formId]);

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

  return (
    <div>
      <h3 className="mb-8">{t("systemHealthCheck.title")}</h3>

      {checkingApiSubmissions && <Skeleton count={1} height={160} className="mb-4 w-[280px]" />}

      <div className="flex gap-4">
        {!checkingApiSubmissions && hasApiSubmissions && (
          <HealthCheckBox.Warning
            titleKey="systemHealth.unconfirmed.title"
            status={<ResponsesAvailable />}
          >
            <HealthCheckBox.Text i18nKey="systemHealth.unconfirmed.description" />
          </HealthCheckBox.Warning>
        )}

        {problemSubmissions.submissions.length > 0 && (
          <HealthCheckBox.Danger
            titleKey="systemHealth.problems.title"
            status={<NumberCount count={problemSubmissions.submissions.length} />}
          >
            <HealthCheckBox.Text i18nKey="systemHealth.problems.description" />
          </HealthCheckBox.Danger>
        )}
      </div>
    </div>
  );
};
