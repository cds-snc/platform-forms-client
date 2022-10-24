import { NextApiRequest, NextApiResponse } from "next";
import { cors, middleware, csrfProtected, sessionExists } from "@lib/middleware";
import { setAcceptableUse } from "@lib/acceptableUseCache";
import { MiddlewareProps } from "@lib/types";

const acceptableUse = async (
  req: NextApiRequest,
  res: NextApiResponse,
  { session }: MiddlewareProps
) => {
  try {
    if (!session) return res.status(401).json({ error: "Unauthorized" });
    await setAcceptableUse(session.user.id);
    res.status(200).json({});
  } catch (err) {
    res.status(500).json({ error: "Malformed API Request" });
  }
};

export default middleware(
  [cors({ allowedMethods: ["POST"] }), csrfProtected(["POST"]), sessionExists()],
  acceptableUse
);
