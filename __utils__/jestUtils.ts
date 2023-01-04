/**
 * Checks spied logs for a specific message
 * @param logs Array of logs from logMessage spy
 * @param message String to search logs for
 * @returns boolean of whether message was found in logs
 */
export const checkLogs = (logs: Array<Array<string>>, message: string): boolean => {
  const foundLogs = logs.flat().filter((log) => {
    if (log.includes(message)) {
      return true;
    }
  });

  return foundLogs.length > 0;
};
