import { useTranslation } from "react-i18next";
import { HealthCheckBox } from "@clientComponents/globals/HealthCheckBox/HealthCheckBox";

export const ResponsesOkay = () => {
  const { t } = useTranslation("form-builder-responses");
  return (
    <HealthCheckBox.Success titleKey="systemHealth.deliveredAndConfirmed.title">
      {t("systemHealth.deliveredAndConfirmed.description")}
    </HealthCheckBox.Success>
  );
};
