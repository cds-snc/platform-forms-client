import pino from "pino";
// create pino loggger
export const logMessage = pino({
  level: process.env.DEBUG ? "debug" : "info",
  browser: {
    asObject: true,
    transmit: {
      level: process.env.NODE_ENV === "production" ? "error" : "info",
      send: (level, logEvent) => {
        const msg = logEvent.messages[0];
        const headers = {
          type: "application/json",
        };
        const blob = new Blob(["Client Side Log: " + JSON.stringify({ msg, level })], headers);
        navigator.sendBeacon("/api/log", blob);
      },
    },
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: null,
  prettyPrint: process.env.DEBUG || process.env.NODE_ENV === "development" ? true : false,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logger = <A extends any[], R>(f: (...a: A) => R) => (...args: A): R => {
  // Add nicer formatting for arguments being passed
  logMessage.debug(`${f.name} function called`);
  let value;
  try {
    value = f(...args);
  } catch (error) {
    logMessage.error(error);
    throw error;
  }
  // Add formatting for value being returned
  logMessage.debug(`${f.name} function returned`);
  return value;
};

export default logger;
