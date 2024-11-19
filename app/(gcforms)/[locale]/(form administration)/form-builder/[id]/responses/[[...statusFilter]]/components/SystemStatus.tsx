import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HealthCheckBox } from "@clientComponents/globals/HealthCheckBox/HealthCheckBox";
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

    getApiSubmissions();
  }, [formId]);

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
