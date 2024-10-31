import { useTranslation } from "@i18n/client";

export const DeleteKeySuccess = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-0 text-xl font-semibold">{t("settings.deleteKeySuccess.title")}</h3>
      <p className="mb-2 text-black">{t("settings.deleteKeySuccess.message")}</p>
    </div>
  );
};
