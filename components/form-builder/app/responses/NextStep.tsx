import React from "react";
import { useTranslation } from "react-i18next";
import { VaultStatus, VaultSubmission, VaultSubmissionList } from "@lib/types";
import { getDaysPassed } from "@lib/clientHelpers";

const enum StatusLevel {
  DEFAULT,
  SUCCESS,
  ERROR,
}
const Status = ({
  primaryMessage,
  secondaryMessage,
  level = StatusLevel.DEFAULT,
}: {
  primaryMessage: string;
  secondaryMessage?: string;
  level?: StatusLevel;
}) => {
  let levelAsClass;
  switch (level) {
    case StatusLevel.SUCCESS:
      levelAsClass = " violet-700 ";
      break;
    case StatusLevel.ERROR:
      levelAsClass = " text-red-700 ";
      break;
    default:
      levelAsClass = "";
  }

  return (
    <div className={levelAsClass}>
      <div className={secondaryMessage ? "font-bold" : ""}>{primaryMessage}</div>
      {secondaryMessage && <div className="mt-1">{secondaryMessage}</div>}
    </div>
  );
};

export const NextStep = ({
  submission,
  overdueAfterDownload,
  overdueAfterDelete,
  escalatedAfter,
}: {
  submission: VaultSubmissionList;
  overdueAfterDownload: string | undefined;
  overdueAfterDelete: string | undefined;
  escalatedAfter: string | undefined;
}) => {
  const { t } = useTranslation("form-builder-responses");

  try {
    // ALL "tabs"
    if (submission.status === VaultStatus.PROBLEM) {
      return (
        <Status
          primaryMessage={t("downloadResponsesTable.problem.supportWill")}
          secondaryMessage={t("downloadResponsesTable.problem.responseReported")}
          level={StatusLevel.ERROR}
        />
      );
    }

    // New "tab"
    if (submission.status === VaultStatus.NEW) {
      const daysPassedCreated = getDaysPassed(submission.createdAt);
      const daysToDownload =
        overdueAfterDownload && parseInt(overdueAfterDownload, 10) - daysPassedCreated;
      const daysToEscalateDownload =
        escalatedAfter && parseInt(escalatedAfter, 10) - daysPassedCreated;

      if (daysToDownload) {
        if (daysToDownload < 0) {
          return (
            <Status
              primaryMessage={t("downloadResponsesTable.downloadOverdue.downloadImeddiately")}
              secondaryMessage={t("downloadResponsesTable.downloadOverdue.accountRestricted", {
                days: daysToEscalateDownload,
              })}
              level={StatusLevel.ERROR}
            />
          );
        }

        return (
          <Status
            primaryMessage={t("downloadResponsesTable.downloadWithin", { days: daysToDownload })}
          />
        );
      }
    }

    // Downloaded "tab"
    if (submission.status === VaultStatus.DOWNLOADED) {
      const daysPassedDownloaded =
        submission.downloadedAt && getDaysPassed(submission.downloadedAt);

      // check needed since downloadedAt can be undefined|number and 0 is a possible value (fasley)
      if (typeof daysPassedDownloaded !== "undefined" && !Number.isNaN(daysPassedDownloaded)) {
        const daysToDelete =
          overdueAfterDelete && parseInt(overdueAfterDelete, 10) - daysPassedDownloaded;

        if (daysToDelete) {
          if (daysToDelete < 0) {
            const daysToEscalateDelete =
              escalatedAfter && parseInt(escalatedAfter, 10) - daysPassedDownloaded;

            if (daysToEscalateDelete) {
              return (
                <Status
                  primaryMessage={t("downloadResponsesTable.deleteOverdue.deleteImmediately")}
                  secondaryMessage={t("downloadResponsesTable.deleteOverdue.accountRestricted", {
                    days: daysToEscalateDelete,
                  })}
                  level={StatusLevel.ERROR}
                />
              );
            }
          }

          return (
            <Status
              primaryMessage={t("downloadResponsesTable.deleteWithin", { days: daysToDelete })}
            />
          );
        }
      }
    }

    // Deleted "tab"
    if (submission.status === VaultStatus.CONFIRMED) {
      // Note: Vault mapping of RemovalDate to removedAt
      const daysToRemove = submission.removedAt && getDaysPassed(submission.removedAt);

      if (daysToRemove) {
        return (
          <Status
            primaryMessage={t("downloadResponsesTable.willBeRemoved", { days: daysToRemove })}
          />
        );
      }
    }

    throw new Error("Response table next step could not be determined");
  } catch (e) {
    // Should never be reached, but just encase something above failed.
    return <Status primaryMessage={t("downloadResponsesTable.unknown")} />; // TODO: maybe a similar contact support message?
  }
};
