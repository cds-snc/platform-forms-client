import { useTranslation } from "react-i18next";
import { HealthCheckBox } from "@clientComponents/globals/HealthCheckBox/HealthCheckBox";

export const ResponsesOkay = () => {
  const { t } = useTranslation("form-builder-responses");
  return (
    <HealthCheckBox.Success titleKey="systemHealth.okay.title">
      {t("systemHealth.okay.description")}
    </HealthCheckBox.Success>
  );
};
