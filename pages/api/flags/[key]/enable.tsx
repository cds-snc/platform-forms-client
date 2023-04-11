import { NextApiRequest, NextApiResponse } from "next";
import { isAdmin } from "@lib/auth";
import { enableFlag, checkAll } from "@lib/flags";
import { logAdminActivity } from "@lib/adminLogs";
import { AdminLogAction, AdminLogEvent } from "@lib/types";

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const session = await isAdmin({ req });
  if (session) {
    const key = req.query.key as string;
    await enableFlag(key);
    const flags = await checkAll();

    if (session.user.id) {
      await logAdminActivity(
        session.user.id,
        AdminLogAction.Update,
        AdminLogEvent.EnableFeature,
        `Feature: ${key} has been enabled`
      );
    }

    res.status(200).json(flags);
  } else {
    res.status(403).send("Forbidden");
  }
};
