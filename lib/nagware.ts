import { NagwareSubmission, NagwareResult, NagLevel } from "@lib/types";



export function detectOldUnprocessedSubmissions(submissions: NagwareSubmission[]): NagwareResult {
  const results = submissions.reduce(
    (acc, current) => {
      const diffMs = Math.abs(Date.now() - current.createdAt);
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

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

  if (results.numberOfUnsavedSubmissionsOver35Days > 0) {
    return {
      level: NagLevel.UnsavedSubmissionsOver35DaysOld,
      numberOfSubmissions: results.numberOfUnsavedSubmissionsOver35Days,
    };
  } else if (results.numberOfUnconfirmedSubmissionsOver35Days > 0) {
    return {
      level: NagLevel.UnconfirmedSubmissionsOver35DaysOld,
      numberOfSubmissions: results.numberOfUnconfirmedSubmissionsOver35Days,
    };
  } else if (results.numberOfUnsavedSubmissionsOver21Days > 0) {
    return {
      level: NagLevel.UnsavedSubmissionsOver21DaysOld,
      numberOfSubmissions: results.numberOfUnsavedSubmissionsOver21Days,
    };
  } else if (results.numberOfUnconfirmedSubmissionsOver21Days > 0) {
    return {
      level: NagLevel.UnconfirmedSubmissionsOver21DaysOld,
      numberOfSubmissions: results.numberOfUnconfirmedSubmissionsOver21Days,
    };
  } else {
    return { level: NagLevel.None, numberOfSubmissions: 0 };
  }
}
