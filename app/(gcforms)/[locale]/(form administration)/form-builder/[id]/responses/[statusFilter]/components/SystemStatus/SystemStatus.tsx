import React from "react";
import { useTranslation } from "react-i18next";
import { ResponsesAvailable } from "./ResponsesAvailable";
import { ProblemsReported } from "./ProblemsReported";
import { OverdueResponses } from "./OverdueResponses";

export const SystemStatus = ({ formId }: { formId: string }) => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <h3 className="mb-8">{t("systemHealthCheck.title")}</h3>
      <div className="flex gap-4">
        <ResponsesAvailable formId={formId} />
        <ProblemsReported formId={formId} />
        <OverdueResponses formId={formId} />
      </div>
    </div>
  );
};
