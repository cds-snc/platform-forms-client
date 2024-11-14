import React from "react";
import { useTranslation } from "react-i18next";
import { HealthCheckBox } from "@clientComponents/globals/HealthCheckBox/HealthCheckBox";

export const SystemStatus = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <h3 className="mb-8">{t("systemHealthCheck.title")}</h3>

      <HealthCheckBox.Success titleKey="systemHealth.contactSupport.title">
        <HealthCheckBox.Text i18nKey="systemHealth.contactSupport.description" />
      </HealthCheckBox.Success>
    </div>
  );
};
