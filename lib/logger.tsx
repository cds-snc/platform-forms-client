declare global {
  interface Document {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    documentMode?: any;
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let conditionalLogMessage: any;

// Older IE versions don't support "pino" so load it conditionally
(async () => {
  if (!(typeof window !== "undefined" && window.MSInputMethodContext && document.documentMode)) {
    const { default: logMessageModule } = await import("./logMessage");
    conditionalLogMessage = logMessageModule;
  } else {
    const { default: logMessageIEModule } = await import(
      "../public/static/scripts/polyfills/logMessageIEModule"
    );
    conditionalLogMessage = logMessageIEModule;
    console.log("IE logMessage", conditionalLogMessage);
  }
})();

export const logMessage = conditionalLogMessage;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logger = <A extends any[], R>(f: (...a: A) => R) => (...args: A): R => {
  // Add nicer formatting for arguments being passed

  if (logMessage) {
    logMessage.debug(`${f.name} function called`);
  }

  let value;
  try {
    value = f(...args);
  } catch (error) {
    if (logMessage) {
      logMessage.error(error);
    }
    throw error;
  }
  // Add formatting for value being returned
  if (logMessage) {
    logMessage.debug(`${f.name} function returned`);
  }
  return value;
};

export default logger;
