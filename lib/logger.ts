import pino from "pino";

export const logMessage = pino({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  browser: {
    asObject: true,
    serialize: true,
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: null,
  ...((process.env.DEBUG || process.env.NODE_ENV === "development") && {
    transport: { target: "pino-pretty" },
  }),
});
