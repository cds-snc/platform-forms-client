/**
 * Checks spied logs for a specific message
 * @param logs Array of logs from logMessage spy
 * @param message String to search logs for
 * @returns boolean of whether message was found in logs
 */
export const checkLogs = (logs: Array<Array<string>>, message: string): boolean => {
  const foundLogs = logs.filter((log) => {
    if (log.includes(message)) {
      return true;
    }
  });

  if (foundLogs.flat().length > 0) {
    return true;
  }
  return false;
};
