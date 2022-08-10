import { NextApiRequest, NextApiResponse } from "next";
import { cors, middleware } from "@lib/middleware";
import { formCache } from "@lib/cache";

const acceptableUse = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userID } = req.body;
    if (userID) {
      formCache.acceptableUse.set(userID);
      res.status(200);
    } else {
      res.status(404).json({ error: "Bad request" });
    }
  } catch (err) {
    res.status(500).json({ error: "Malformed API Request" });
  }
};

export default middleware([cors({ allowedMethods: ["POST"] })], acceptableUse);
