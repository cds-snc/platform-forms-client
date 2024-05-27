import { NagwareSubmission, NagwareResult, NagLevel, VaultStatus } from "@lib/types";
import { getAppSetting } from "./appSettings";
import { logMessage } from "./logger";

export async function detectOldUnprocessedSubmissions(
  submissions: NagwareSubmission[],
  promptPhaseDays?: string | null,
  warnPhaseDays?: string | null
): Promise<NagwareResult> {
  try {
    if (!promptPhaseDays || !warnPhaseDays) {
      promptPhaseDays = await getAppSetting("nagwarePhasePrompted");
      warnPhaseDays = await getAppSetting("nagwarePhaseWarned");
    }

    const currentDate = Date.now();

    if (!promptPhaseDays || !warnPhaseDays) {
      logMessage.error("Nagware settings are not configured");
      return { level: NagLevel.None, numberOfSubmissions: 0 };
    }

    const promptDays = parseInt(promptPhaseDays);
    const warnDays = parseInt(warnPhaseDays);

    const results = submissions
      .filter((submission) => [VaultStatus.NEW, VaultStatus.DOWNLOADED].includes(submission.status))
      .reduce(
        (acc, current) => {
          const diffMs = Math.abs(currentDate - current.createdAt);

          // 86400000 milliseconds = 1 Day
          const diffDays = Math.floor(diffMs / 86400000);

          if (current.status === VaultStatus.NEW) {
            if (diffDays > warnDays) {
              acc.numberOfUnsavedSubmissionsForWarn++;
            } else if (diffDays > promptDays) {
              acc.numberOfUnsavedSubmissionsForPrompt++;
            }
          } else if (current.status === VaultStatus.DOWNLOADED) {
            if (diffDays > warnDays) {
              acc.numberOfUnconfirmedSubmissionsForWarn++;
            } else if (diffDays > promptDays) {
              acc.numberOfUnconfirmedSubmissionsForPrompt++;
            }
          }

          return acc;
        },
        {
          numberOfUnsavedSubmissionsForPrompt: 0,
          numberOfUnconfirmedSubmissionsForPrompt: 0,
          numberOfUnsavedSubmissionsForWarn: 0,
          numberOfUnconfirmedSubmissionsForWarn: 0,
        }
      );

    if (results.numberOfUnsavedSubmissionsForWarn) {
      return {
        level: NagLevel.UnsavedSubmissionsOver35DaysOld,
        numberOfSubmissions: results.numberOfUnsavedSubmissionsForWarn,
      };
    } else if (results.numberOfUnconfirmedSubmissionsForWarn) {
      return {
        level: NagLevel.UnconfirmedSubmissionsOver35DaysOld,
        numberOfSubmissions: results.numberOfUnconfirmedSubmissionsForWarn,
      };
    } else if (results.numberOfUnsavedSubmissionsForPrompt) {
      return {
        level: NagLevel.UnsavedSubmissionsOver21DaysOld,
        numberOfSubmissions: results.numberOfUnsavedSubmissionsForPrompt,
      };
    } else if (results.numberOfUnconfirmedSubmissionsForPrompt) {
      return {
        level: NagLevel.UnconfirmedSubmissionsOver21DaysOld,
        numberOfSubmissions: results.numberOfUnconfirmedSubmissionsForPrompt,
      };
    } else {
      return { level: NagLevel.None, numberOfSubmissions: 0 };
    }
  } catch (e) {
    logMessage.error(e);
    return { level: NagLevel.None, numberOfSubmissions: 0 };
  }
}
