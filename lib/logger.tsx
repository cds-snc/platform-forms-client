import pino from "pino";
// create pino loggger
export const logMessage = pino({
  level: "info",
  browser: { asObject: true },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logger = <A extends any[], R>(f: (...a: A) => R) => (
  ...args: A
): R => {
  let value;
  try {
    value = f(...args);
  } catch (error) {
    logMessage.error(error);
    throw error;
  }
  return value;
};

export default logger;
