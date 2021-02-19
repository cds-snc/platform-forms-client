import { logMessage } from "../../lib/logger";

const log = (req, res) => {
  try {
    const { msg, level = "info" } = req.body;
    logMessage[level](msg);
  } catch (err) {
    logMessage.error(err);
    res.status(500).send("Error ocurred when logging on server");
    return;
  }
  return res.status(202).send("Log received");
};

export default log;
