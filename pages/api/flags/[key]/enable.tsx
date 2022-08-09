import { NextApiRequest, NextApiResponse } from "next";
import { isAdmin } from "@lib/auth";
import { enableFlag, checkAll } from "@lib/flags";
import { logAdminActivity, AdminLogAction, AdminLogEvent } from "@lib/adminLogs";

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const session = await isAdmin({ req, res });
  if (session) {
    const key = req.query.key as string;
    await enableFlag(key);
    const flags = await checkAll();

    if (session.user.userId) {
      await logAdminActivity(
        session.user.userId,
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
