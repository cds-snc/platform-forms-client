import { useTranslation } from "@i18n/client";

export const Note = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <p className="font-bold">{t("settings.api.dialog.text1")}</p>
      <p>{t("settings.api.dialog.text2")}</p>
    </div>
  );
};
