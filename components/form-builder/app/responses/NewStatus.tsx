import React from "react";
import { useTranslation } from "react-i18next";
import { getDaysPassed } from "@lib/clientHelpers";
import { StatusMessage, StatusMessageLevel } from "./StatusMessage";

export const NewStatus = ({
  createdAt,
  overdueAfter,
  escalatedAfter,
}: {
  createdAt: number;
  overdueAfter: string | undefined;
  escalatedAfter: string | undefined;
}) => {
  const { t } = useTranslation("form-builder-responses");
  const daysPassedCreated = getDaysPassed(createdAt);
  const daysToDownload = overdueAfter && parseInt(overdueAfter, 10) - daysPassedCreated;
  const daysToEscalateDownload = escalatedAfter && parseInt(escalatedAfter, 10) - daysPassedCreated;

  if (daysToDownload && daysToDownload > 0) {
    return (
      <StatusMessage
        primaryMessage={t("downloadResponsesTable.downloadWithin", { days: daysToDownload })}
      />
    );
  }

  if (daysToEscalateDownload && daysToEscalateDownload > 0) {
    return (
      <StatusMessage
        primaryMessage={t("downloadResponsesTable.downloadOverdue.downloadImeddiately")}
        secondaryMessage={t("downloadResponsesTable.downloadOverdue.accountRestricted", {
          days: daysToEscalateDownload,
        })}
        level={StatusMessageLevel.ERROR}
      />
    );
  }

  return <StatusMessage primaryMessage={t("downloadResponsesTable.unknown")} />;
};
