import { useTranslation } from "@i18n/client";
import { getDaysPassed } from "@lib/client/clientHelpers";
import { VaultSubmissionOverview } from "@lib/types";
import { ExclamationIcon } from "@serverComponents/icons";
import React, { useEffect, useState } from "react";
import { StatusFilter } from "../types";
import Skeleton from "react-loading-skeleton";
import { getSubmissionRemovalDate } from "../actions";

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

const RemovalDateLabel = ({ submission }: { submission: VaultSubmissionOverview }) => {
  const { t } = useTranslation("form-builder-responses");
  const [label, setLabel] = useState<string | null>(null);

  const getRemovalByMessage = (removalAt?: Date | number) => {
    const daysLeft = removalAt && getDaysPassed(removalAt);
    if (daysLeft && daysLeft > 0) {
      return t("downloadResponsesTable.status.removeWithinXDays", { daysLeft });
    }
    return "";
  };

  useEffect(() => {
    getSubmissionRemovalDate(submission.formID, submission.name).then((value) => {
      if (typeof value === "number") {
        setLabel(getRemovalByMessage(value));
      } else {
        setLabel("-");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (label === null) {
    return <Skeleton count={1} className="my-4 ml-4 w-[300px]" />;
  }

  return <p>{label}</p>;
};

export const NextStep = ({
  statusFilter,
  submission,
  overdueAfter,
  removedRows,
}: {
  statusFilter: StatusFilter;
  submission: VaultSubmissionOverview;
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

  return (
    <>
      {statusFilter === StatusFilter.NEW && (
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
      {statusFilter === StatusFilter.DOWNLOADED && (
        <p>{getSignOffByMessage(daysPassed, overdueAfter)}</p>
      )}
      {statusFilter === StatusFilter.CONFIRMED && <RemovalDateLabel submission={submission} />}
      {statusFilter === StatusFilter.PROBLEM && (
        <p className="text-red">
          <strong>{t("supportWillContact")}</strong>
          <br />
          {t("reportedAsProblem")}
        </p>
      )}
    </>
  );
};
