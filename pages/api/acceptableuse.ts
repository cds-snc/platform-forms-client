import { NextApiRequest, NextApiResponse } from "next";
import { cors, middleware } from "@lib/middleware";
import { acceptableUseCache } from "@lib/cache";

const acceptableUse = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userID } = req.body;
    if (!userID) return res.status(404).json({ error: "Bad request" });
    acceptableUseCache.set(userID);
    res.status(200);
  } catch (err) {
    res.status(500).json({ error: "Malformed API Request" });
  }
};

export default middleware([cors({ allowedMethods: ["POST"] })], acceptableUse);
