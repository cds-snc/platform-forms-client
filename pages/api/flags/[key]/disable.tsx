import { NextApiRequest, NextApiResponse } from "next";
import { disableFlag, checkAll } from "@lib/cache/flags";
import { middleware, cors, sessionExists } from "@lib/middleware";
import { logActivity, AdminLogAction, AdminLogEvent } from "@lib/auditLogs";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { AccessControlError, createAbility } from "@lib/privileges";

const allowedMethods = ["GET"];

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  props: MiddlewareProps
): Promise<void> => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    const key = req.query.key as string;
    if (Array.isArray(key) || !key)
      return res.status(400).json({ error: "Malformed API Request Flag Key is not defined" });
    const ability = createAbility(session);

    await disableFlag(ability, key);
    const flags = await checkAll(ability);

    if (session.user.id) {
      await logActivity(
        session.user.id,
        AdminLogAction.Update,
        AdminLogEvent.DisableFeature,
        `Feature: ${key} has been disabled`
      );
    }

    res.status(200).json(flags);
  } catch (e) {
    if (e instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default middleware([cors({ allowedMethods }), sessionExists()], handler);
