import { NextApiRequest, NextApiResponse } from "next";
import { cors, middleware, csrfProtected } from "@lib/middleware";
import { setAcceptableUse } from "@lib/acceptableUseCache";

const acceptableUse = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userID } = req.body;
    if (!userID) return res.status(404).json({ error: "Bad request" });
    await setAcceptableUse(userID);
    res.status(200).json({});
  } catch (err) {
    res.status(500).json({ error: "Malformed API Request" });
  }
};

export default middleware(
  [cors({ allowedMethods: ["POST"] }), csrfProtected(["POST"])],
  acceptableUse
);
