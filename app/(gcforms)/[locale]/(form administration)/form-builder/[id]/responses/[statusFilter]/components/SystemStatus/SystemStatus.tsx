import React from "react";
import { useTranslation } from "react-i18next";
import { ResponsesAvailable } from "./ResponsesAvailable";
import { ProblemSubmissions } from "./ProblemSubmissions";

export const SystemStatus = ({ formId }: { formId: string }) => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <h3 className="mb-8">{t("systemHealthCheck.title")}</h3>
      <div className="flex gap-4">
        <ResponsesAvailable formId={formId} />
        <ProblemSubmissions formId={formId} />
      </div>
    </div>
  );
};
