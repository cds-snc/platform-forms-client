import pino from "pino";
import Axios from "axios";
import { getCsrfToken } from "next-auth/client";
// create pino loggger
export const logMessage = pino({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  browser: {
    asObject: true,
    transmit: {
      level: process.env.NODE_ENV === "production" ? "error" : "info",
      send: async (level, logEvent) => {
        const token = await getCsrfToken();
        const msg = sanitizeErrorObject(
          Array.isArray(logEvent.messages) ? logEvent.messages[0] : logEvent.messages
        );
        const headers = {
          type: "application/json",
          "X-CSRF-Token": token,
        };
        const blob = new Blob([JSON.stringify({ msg, level })], headers);
        navigator.sendBeacon("/api/log", blob);
      },
    },
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: null,
  ...((process.env.DEBUG || process.env.NODE_ENV === "development") && {
    transport: { target: "pino-pretty" },
  }),
});

const sanitizeErrorObject = (log: unknown) => {
  if (Axios.isAxiosError(log)) {
    // If it's an axios error delete the data key that can
    // potentially contain form data
    delete log.config.data;
    delete log.request.data;
  }
  return log;
};

export const logger =
  <A extends unknown[], R>(f: (...a: A) => R) =>
  (...args: A): R => {
    // Add nicer formatting for arguments being passed
    logMessage.debug(`${f.name} function called`);
    let value;
    try {
      value = f(...args);
    } catch (error) {
      logMessage.error(error as Error);
      throw error;
    }
    // Add formatting for value being returned
    logMessage.debug(`${f.name} function returned`);
    return value;
  };

export default logger;
