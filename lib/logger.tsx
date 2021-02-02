import pino from "pino";
// create pino loggger
const logger = pino({
  level: "info",
  browser: { asObject: true },
});

export default logger;
