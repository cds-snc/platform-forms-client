import { useTranslation } from "@i18n/client";
import { getDaysPassed } from "@lib/client/clientHelpers";
import { TypeOmit, VaultStatus, VaultSubmission } from "@lib/types";
import { ExclamationIcon } from "@serverComponents/icons";
import React from "react";

const ExclamationText = ({
  text,
  className = "flex items-center",
  isShowIcon = true,
}: {
  text: string;
  className?: string;
  isShowIcon?: boolean;
}) => {
  return (
    <div className={className}>
      {isShowIcon && <ExclamationIcon className="mr-1" />}
      <span className="font-bold text-[#bc3332]">{text}</span>
    </div>
  );
};

export const NextStep = ({
  statusFilter,
  submission,
  overdueAfter,
  removedRows,
}: {
  statusFilter: VaultStatus;
  submission: TypeOmit<VaultSubmission, "formSubmission" | "submissionID" | "confirmationCode">;
  overdueAfter: number | undefined;
  removedRows: string[];
}) => {
  const { t } = useTranslation("form-builder-responses");

  const daysPassed = getDaysPassed(submission.createdAt);

  const getDownloadByMessage = (daysPassed: number) => {
    if (!overdueAfter) return <>{t("downloadResponsesTable.unknown")}</>;
    const daysLeft = overdueAfter - daysPassed;

    if (daysLeft < 0) {
      return <ExclamationText text={t("downloadResponsesTable.status.overdue")} />;
    }

    return t("downloadResponsesTable.status.downloadWithinXDays", { daysLeft });
  };

  const getSignOffByMessage = (daysPassed: number, overdueAfter?: number) => {
    if (!overdueAfter) return t("downloadResponsesTable.unknown");
    const daysLeft = overdueAfter - daysPassed;

    if (daysLeft < 0) {
      return <ExclamationText text={t("downloadResponsesTable.status.overdue")} />;
    }

    return t("downloadResponsesTable.status.confirmWithinXDays", { daysLeft });
  };

  const getRemovalByMessage = (removalAt?: Date | number) => {
    const daysLeft = removalAt && getDaysPassed(removalAt);
    if (daysLeft && daysLeft > 0) {
      return t("downloadResponsesTable.status.removeWithinXDays", { daysLeft });
    }
    return "";
  };

  return (
    <>
      {statusFilter === VaultStatus.NEW && (
        <>
          {removedRows.includes(submission.name) ? (
            <p>
              {getSignOffByMessage(daysPassed, overdueAfter)}
              <br />
              {t("downloadResponsesTable.movedToDownloaded")}
            </p>
          ) : (
            <p>{getDownloadByMessage(daysPassed)}</p>
          )}
        </>
      )}
      {statusFilter === VaultStatus.DOWNLOADED && (
        <p>{getSignOffByMessage(daysPassed, overdueAfter)}</p>
      )}
      {statusFilter === VaultStatus.CONFIRMED && <p>{getRemovalByMessage(submission.removedAt)}</p>}
      {statusFilter === VaultStatus.PROBLEM && (
        <p className="text-red">
          <strong>{t("supportWillContact")}</strong>
          <br />
          {t("reportedAsProblem")}
        </p>
      )}
    </>
  );
};
