import { AccessControlError } from "@lib/privileges";
import { middleware, cors, sessionExists } from "@lib/middleware";
import { MiddlewareProps } from "@lib/types";
import type { NextApiRequest, NextApiResponse } from "next";

const settings = async (
  req: NextApiRequest,
  res: NextApiResponse,
  { session }: MiddlewareProps
) => {
  try {
    if (!session) return res.status(401).json({ error: "Unauthorized" });
    const data = { hello: "world" };
    return res.status(200).json(data);
  } catch (err) {
    if (err instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    else return res.status(500).json({ error: "Malformed API Request" });
  }
};

export default middleware([cors({ allowedMethods: ["POST"] }), sessionExists()], settings);
