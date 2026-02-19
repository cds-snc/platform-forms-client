import pino from "pino";

const pinoLogger = pino({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  browser: {
    asObject: true,
    serialize: true,
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
  ...(process.env.NODE_ENV === "development" && {
    transport: {
      target: "pino-pretty",
    },
  }),

  base: null,
});

/**
 * Type-safe logger that only accepts string messages.
 * DO NOT use pino's object-first syntax: logMessage.error({ error }, "msg")
 * Instead, serialize the error inline: logMessage.error(`msg: ${error.message}`)
 */
export type StringOnlyLogger = {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
};

/**
 * Project logger - only accepts string messages.
 * @example
 * // ✅ Correct
 * logMessage.error(`Failed to load user: ${error.message}`);
 *
 * // ❌ Incorrect (will cause type error)
 * logMessage.error({ error }, "Failed to load user");
 */
export const logMessage: StringOnlyLogger = {
  debug: (message: string) => pinoLogger.debug(message),
  info: (message: string) => pinoLogger.info(message),
  warn: (message: string) => pinoLogger.warn(message),
  error: (message: string) => pinoLogger.error(message),
};
