import { logMessage } from "../../lib/logger";

const log = (req, res) => {
  try {
    const { msg, level = "info" } = req.body;
    logMessage[level](msg);
  } catch (err) {
    logMessage.error(err);
    res.statusCode = 500;
    res.send("error ocurred when logging on server");
  }
  res.statusCode = 200;
  res.send("message logged on server");
};

export default log;
