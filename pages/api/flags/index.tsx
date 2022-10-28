import { NextApiRequest, NextApiResponse } from "next";
import { checkAll } from "@lib/cache/flags";
import { MiddlewareProps } from "@lib/types";
import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, cors, sessionExists } from "@lib/middleware";

const allowedMethods = ["GET"];

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  { session }: MiddlewareProps
): Promise<void> => {
  try {
    if (!session) return res.status(401).send("Unauthorized");
    const ability = createAbility(session.user.privileges);
    const flags = await checkAll(ability);
    res.status(200).json(flags);
  } catch (e) {
    if (e instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default middleware([cors({ allowedMethods }), sessionExists()], handler);
