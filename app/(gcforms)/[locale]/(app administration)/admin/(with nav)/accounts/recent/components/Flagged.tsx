import { useTranslation } from "@i18n/client";
import { WarningIcon } from "@serverComponents/icons";

export const Flagged = () => {
  const { t } = useTranslation("admin-recent-signups");
  return (
    <span className="mb-2 flex h-9 flex-row">
      <span className="inline-block bg-yellow-500 p-1">
        <WarningIcon className="size-6" />
      </span>
      <span className="inline-block bg-yellow-50 px-4 py-1">{t("flagged")}</span>
    </span>
  );
};
