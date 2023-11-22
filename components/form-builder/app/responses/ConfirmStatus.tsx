import React from "react";
import { useTranslation } from "react-i18next";
import { getDaysPassed } from "@lib/clientHelpers";
import { StatusMessage } from "./StatusMessage";

export const ConfirmStatus = ({ removedAt }: { removedAt: number | undefined }) => {
  const { t } = useTranslation("form-builder-responses");

  // Note: Vault mapping of RemovalDate to removedAt
  const daysToRemove = removedAt && getDaysPassed(removedAt);

  if (daysToRemove && daysToRemove > 0) {
    return (
      <StatusMessage
        primaryMessage={t("downloadResponsesTable.willBeRemoved", { days: daysToRemove })}
      />
    );
  }

  return <StatusMessage primaryMessage={t("downloadResponsesTable.unknown")} />;
};
