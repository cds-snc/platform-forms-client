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
 * Type-safe logger for the app.
 * Messages should be strings or serialized objects (for debug).
 * Errors can accept any value from catch blocks (unknown) and handles them appropriately.
 */
export type AppLogger = {
  debug(message: string | Record<string, unknown>): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: unknown): void;
};

/**
 * App logger instance.
 * @example
 * // ✅ Correct - string message
 * logMessage.error(`Failed to load user: ${error.message}`);
 * logMessage.info("User loaded successfully");
 *
 * // ✅ Correct - Error object with error method
 * logMessage.error(error); // Automatically extracts error.message
 *
 * // ✅ Correct - unknown from catch blocks
 * logMessage.error(e); // Handles Error, string, or other types
 *
 * // ✅ Correct - serialized object with debug
 * logMessage.debug({ userId: 123, action: "login" });
 *
 * // ❌ Incorrect - objects not allowed for info/warn/error
 * logMessage.info({ user }); // Type error
 * logMessage.error({ error }, "msg"); // Type error
 */
export const logMessage: AppLogger = {
  debug: (message: string | Record<string, unknown>) => {
    pinoLogger.debug(message);
  },
  info: (message: string) => pinoLogger.info(message),
  warn: (message: string) => pinoLogger.warn(message),
  error: (message: unknown) => {
    if (message instanceof Error) {
      pinoLogger.error(message.message);
    } else if (typeof message === "string") {
      pinoLogger.error(message);
    } else {
      pinoLogger.error(JSON.stringify(message));
    }
  },
};
