/**
 * The logger "pino" isn't supported by older IEs. In that case map its functionality to console.log
 * @param value
 */

const consoleFunction = (value: string): void => {
  console.log("logMessage", value);
};

export const logMessage = {
  level: "info",
  levels: {},
  silent: consoleFunction,
  trace: consoleFunction,
  error: consoleFunction,
  debug: consoleFunction,
  info: consoleFunction,
  warn: consoleFunction,
  fatal: consoleFunction,  
};

export default logMessage;
