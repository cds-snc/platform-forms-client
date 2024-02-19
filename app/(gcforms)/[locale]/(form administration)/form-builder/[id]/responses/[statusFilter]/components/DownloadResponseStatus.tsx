import { formatDate } from "@lib/client/clientHelpers";
import { useTranslation } from "@i18n/client";
import { ExclamationText } from "@clientComponents/form-builder/app/shared";
import { getDaysPassed } from "@lib/client/clientHelpers";
import { VaultStatus } from "@lib/types";

export const DownloadResponseStatus = ({
  vaultStatus,
  createdAt,
  downloadedAt,
  overdueAfter,
}: {
  vaultStatus: string;
  createdAt: Date | number;
  downloadedAt?: Date | number;
  overdueAfter?: number;
}) => {
  const { t } = useTranslation("form-builder-responses");
  let status = null;

  if (vaultStatus === VaultStatus.NEW) {
    const daysPassed = getDaysPassed(createdAt);
    if (!overdueAfter) return <>{t("downloadResponsesTable.unknown")}</>;
    const daysLeft = overdueAfter - daysPassed;

    if (daysLeft < 0) {
      status = <ExclamationText text={t("downloadResponsesTable.status.overdue")} />;
    } else {
      status = t("downloadResponsesTable.status.downloadWithinXDays", { daysLeft });
    }
  } else if (downloadedAt) {
    status = formatDate(new Date(downloadedAt));
  } else {
    status = t("downloadResponsesTable.unknown");
  }

  return <>{status}</>;
};
