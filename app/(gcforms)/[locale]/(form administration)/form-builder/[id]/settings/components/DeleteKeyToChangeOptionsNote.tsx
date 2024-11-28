import { useTranslation } from "@i18n/client";

export const DeleteKeyToChangeOptionsNote = ({ hasApiKey }: { hasApiKey: boolean }) => {
  const { t } = useTranslation("form-builder");
  if (!hasApiKey) return null;
  return (
    <div className="mb-4 w-3/5 rounded-md bg-indigo-50 p-3">
      <h5 className="font-bold">{t("settings.api.deleteApiKeyToChangeOptions.title")}</h5>
      <p className="text-sm">{t("settings.api.deleteApiKeyToChangeOptions.message")}</p>
    </div>
  );
};
