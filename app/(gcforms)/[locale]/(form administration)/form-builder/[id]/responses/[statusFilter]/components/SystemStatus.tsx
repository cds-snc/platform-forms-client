import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HealthCheckBox } from "@clientComponents/globals/HealthCheckBox/HealthCheckBox";

import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";
import { newResponsesExist } from "../actions";

export const SystemStatus = ({ formId }: { formId: string }) => {
  const { t } = useTranslation("form-builder");
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

  return (
    <div>
      <h3 className="mb-8">{t("systemHealthCheck.title")}</h3>
      {!checkingApiSubmissions && hasApiSubmissions && (
        <HealthCheckBox.Warning titleKey="systemHealth.unconfirmed.title">
          <HealthCheckBox.Text i18nKey="systemHealth.unconfirmed.description" />
        </HealthCheckBox.Warning>
      )}
    </div>
  );
};
