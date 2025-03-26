import { useTranslation } from "@i18n/client";

export const OnHold = () => {
  const { t } = useTranslation("admin-recent-signups");
  return <span className="inline-block h-9 bg-violet-50 px-4 py-1">{t("onHold")}</span>;
};
