import { logMessage } from "@lib/logger";
import { NextApiRequest, NextApiResponse } from "next";
import { Level } from "pino";
import { middleware, cors, csrfProtected } from "@lib/middleware";

const log = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  try {
    const { msg, level = "info" }: { msg: Record<string, unknown>[]; level: Level } = req.body;
    logMessage[level](`Client Side log: ${JSON.stringify(msg)}`);
  } catch (err) {
    logMessage.error(err);
    return res.status(500).send("Error ocurred when logging client side log on server");
  }
  return res.status(202).send("Log received");
};
export default middleware([cors({ allowedMethods: ["POST"] }), csrfProtected(["POST"])], log);
