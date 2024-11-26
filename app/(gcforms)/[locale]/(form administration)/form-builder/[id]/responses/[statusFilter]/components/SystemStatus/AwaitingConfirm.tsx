import { useTranslation } from "react-i18next";
import { HealthCheckBox } from "@clientComponents/globals/HealthCheckBox/HealthCheckBox";

export const AwaitingConfirm = () => {
  const { t } = useTranslation("form-builder-responses");
  return (
    <HealthCheckBox.Warning titleKey="systemHealth.awatingConfirm.title">
      {t("systemHealth.awatingConfirm.description")}
    </HealthCheckBox.Warning>
  );
};
