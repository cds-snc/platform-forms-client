import pino from "pino";
import Axios from "axios";
import { getCsrfToken } from "next-auth/react";
// create pino loggger
export const logMessage = pino({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  browser: {
    asObject: true,
    transmit: {
      level: process.env.NODE_ENV === "production" ? "error" : "info",
      send: async (level, logEvent) => {
        const token = await getCsrfToken();
        const msg = logEvent.messages.map((message) => sanitizeErrorObject(message));
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

/**
 * Sanitizes error objects to ensure potential personal data is not transmitted
 * from the browser to the server
 * @param log Error object
 * @returns Error object
 */
const sanitizeErrorObject = (log: unknown) => {
  if (Axios.isAxiosError(log)) {
    // If it's an axios error delete the data key that can
    // potentially contain form data
    delete log.config.data;
    delete log.request.data;
  }
  return log;
};
