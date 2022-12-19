import { NextApiRequest, NextApiResponse } from "next";
import { checkAll } from "@lib/cache/flags";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, cors, sessionExists } from "@lib/middleware";

const allowedMethods = ["GET"];

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  props: MiddlewareProps
): Promise<void> => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    const ability = createAbility(session.user.privileges);
    const flags = await checkAll(ability);
    res.status(200).json(flags);
  } catch (e) {
    if (e instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default middleware([cors({ allowedMethods }), sessionExists()], handler);
