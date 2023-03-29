import { NagwareSubmission, NagwareResult, NagLevel } from "@lib/types";

export function detectOldUnprocessedSubmissions(submissions: NagwareSubmission[]): NagwareResult {
  const currentDate = Date.now();

  const results = submissions
    .filter((submission) => ["New", "Downloaded"].includes(submission.status))
    .reduce(
      (acc, current) => {
        const diffMs = Math.abs(currentDate - current.createdAt);

        // 86400000 milliseconds = 1 Day
        const diffDays = Math.ceil(diffMs / 86400000);

        if (current.status === "New") {
          if (diffDays > 35) {
            acc.numberOfUnsavedSubmissionsOver35Days++;
          } else if (diffDays > 21) {
            acc.numberOfUnsavedSubmissionsOver21Days++;
          }
        } else if (current.status === "Downloaded") {
          if (diffDays > 35) {
            acc.numberOfUnconfirmedSubmissionsOver35Days++;
          } else if (diffDays > 21) {
            acc.numberOfUnconfirmedSubmissionsOver21Days++;
          }
        }

        return acc;
      },
      {
        numberOfUnsavedSubmissionsOver21Days: 0,
        numberOfUnconfirmedSubmissionsOver21Days: 0,
        numberOfUnsavedSubmissionsOver35Days: 0,
        numberOfUnconfirmedSubmissionsOver35Days: 0,
      }
    );

  if (results.numberOfUnsavedSubmissionsOver35Days) {
    return {
      level: NagLevel.UnsavedSubmissionsOver35DaysOld,
      numberOfSubmissions: results.numberOfUnsavedSubmissionsOver35Days,
    };
  } else if (results.numberOfUnconfirmedSubmissionsOver35Days) {
    return {
      level: NagLevel.UnconfirmedSubmissionsOver35DaysOld,
      numberOfSubmissions: results.numberOfUnconfirmedSubmissionsOver35Days,
    };
  } else if (results.numberOfUnsavedSubmissionsOver21Days) {
    return {
      level: NagLevel.UnsavedSubmissionsOver21DaysOld,
      numberOfSubmissions: results.numberOfUnsavedSubmissionsOver21Days,
    };
  } else if (results.numberOfUnconfirmedSubmissionsOver21Days) {
    return {
      level: NagLevel.UnconfirmedSubmissionsOver21DaysOld,
      numberOfSubmissions: results.numberOfUnconfirmedSubmissionsOver21Days,
    };
  } else {
    return { level: NagLevel.None, numberOfSubmissions: 0 };
  }
}
