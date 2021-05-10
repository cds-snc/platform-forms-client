import pino from "pino";

export default pino({
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
        const blob = new Blob([JSON.stringify({ msg, level })], headers);
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
