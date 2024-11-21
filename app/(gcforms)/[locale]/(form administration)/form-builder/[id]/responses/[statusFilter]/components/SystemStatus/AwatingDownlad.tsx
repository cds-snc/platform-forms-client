import { useTranslation } from "react-i18next";

export const AwatingDownlad = () => {
  const { t } = useTranslation("form-builder-responses");
  return (
    <div className="mb-4 flex gap-4">
      <div className="flex items-center justify-center text-5xl font-bold">
        {t("systemHealth.awatingDownlad.new")}
      </div>
      <div className="flex items-center justify-center text-lg font-bold">
        <p className="mb-0 leading-5">
          {t("systemHealth.awatingDownlad.responses")} <br />{" "}
          {t("systemHealth.awatingDownlad.available")}
        </p>
      </div>
    </div>
  );
};
