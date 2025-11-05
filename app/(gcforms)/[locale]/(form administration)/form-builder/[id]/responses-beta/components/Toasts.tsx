import { useTranslation } from "@root/i18n/client";

export const CsvDetected = () => {
  const { t } = useTranslation("response-api");
  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-0 text-xl font-semibold">{t("locationPage.csvDetected.title")}</h3>
      <p className="mb-2 text-black">{t("locationPage.csvDetected.message")}</p>
    </div>
  );
};

export const TemplateFailed = () => {
  const { t } = useTranslation("response-api");
  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-0 text-xl font-semibold">
        {t("locationPage.getTemplateFailed.title")}
      </h3>
      <p className="mb-2 text-black">{t("locationPage.getTemplateFailed.message")}</p>
    </div>
  );
};
