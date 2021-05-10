declare global {
  interface Document {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    documentMode?: any;
  }
}

// Default logger relies on console functions, for browsers that don't support pino
export const logMessageDefault = {
  level: process.env.DEBUG ? "debug" : process.env.NODE_ENV === "production" ? "error" : "info",
  levels: {},
  silent: console.info,
  trace: console.log,
  error: console.error,
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  fatal: console.error,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let logMessageAsync: any = null;
const isOlderIE =
  typeof window !== "undefined" && window.MSInputMethodContext && window.document.documentMode;
if (!isOlderIE) {
  const asyncExample = async () => {
    const pino = await import("./pinoLogger");
    return pino.default;
  };
  (async () => {
    logMessageAsync = await asyncExample();
  })();
}

export const logMessage = logMessageAsync ? logMessageAsync : logMessageDefault;

/**
 * The logger function that the app utilizes
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logger = <A extends any[], R>(f: (...a: A) => R) => (...args: A): R => {
  const logMessageObject = logMessageAsync ? logMessageAsync : logMessage;

  // Add nicer formatting for arguments being passed
  logMessageObject.debug(`${f.name} function called`);

  let value;
  try {
    value = f(...args);
  } catch (error) {
    logMessageObject.error(error);

    throw error;
  }
  // Add formatting for value being returned

  logMessageObject.debug(`${f.name} function returned`);

  return value;
};

export default logger;
