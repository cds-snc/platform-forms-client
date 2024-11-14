import React from "react";
import { useTranslation } from "react-i18next";

export const SystemStatus = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <h3 className="mb-8">{t("systemHealthCheck.title")}</h3>
    </div>
  );
};
