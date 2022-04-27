import pino from "pino";
// create pino loggger
export const logMessage = pino({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  browser: {
    asObject: true,
    transmit: {
      level: process.env.NODE_ENV === "production" ? "error" : "info",
      send: (level, logEvent) => {
        const msg = logEvent.messages[0];
        const headers = {
          type: "application/json",
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
