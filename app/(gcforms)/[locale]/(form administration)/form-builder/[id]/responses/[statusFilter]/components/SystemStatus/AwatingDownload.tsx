import { useTranslation } from "react-i18next";
import { HealthCheckBox } from "@clientComponents/globals/HealthCheckBox/HealthCheckBox";

export const AwatingDownload = () => {
  return (
    <HealthCheckBox.Warning
      titleKey="systemHealth.awatingDownload.title"
      status={<StatusContent />}
    >
      <HealthCheckBox.Text i18nKey="systemHealth.awatingDownload.description" />
    </HealthCheckBox.Warning>
  );
};

export const StatusContent = () => {
  const { t } = useTranslation("form-builder-responses");
  return (
    <div className="mb-4 flex gap-4">
      <div className="flex items-center justify-center text-5xl font-bold">
        {t("systemHealth.awatingDownload.new")}
      </div>
      <div className="flex items-center justify-center text-lg font-bold">
        <p className="mb-0 leading-5">
          {t("systemHealth.awatingDownload.responses")} <br />{" "}
          {t("systemHealth.awatingDownload.available")}
        </p>
      </div>
    </div>
  );
};
