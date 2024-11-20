import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HealthCheckBox } from "@clientComponents/globals/HealthCheckBox/HealthCheckBox";
import { useParams } from "next/navigation";

import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";
import { newResponsesExist } from "../actions";

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
  const { statusFilter } = useParams<{ statusFilter: string }>();
  const { hasApiKeyId } = useFormBuilderConfig();

  const [checkingApiSubmissions, setCheckingApiSubmissions] = useState(true);
  const [hasApiSubmissions, setHasApiSubmissions] = useState(false);

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

  if (statusFilter !== "confirmed") {
    return null;
  }

  return (
    <div>
      <h3 className="mb-8">{t("systemHealthCheck.title")}</h3>
      {!checkingApiSubmissions && hasApiSubmissions && (
        <HealthCheckBox.Warning
          titleKey="systemHealth.unconfirmed.title"
          status={<ResponsesAvailable />}
        >
          <HealthCheckBox.Text i18nKey="systemHealth.unconfirmed.description" />
        </HealthCheckBox.Warning>
      )}
    </div>
  );
};