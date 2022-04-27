import { NextApiRequest, NextApiResponse } from "next";
import { disableFlag, checkAll } from "@lib/flags";
import { isAdmin } from "@lib/auth";
import { logAdminActivity } from "@lib/adminLogs";
import { AdminLogAction, AdminLogEvent } from "@lib/types";

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const session = await isAdmin({ req });
  if (session) {
    const key = req.query.key as string;
    await disableFlag(key);
    const flags = await checkAll();

    if (session.user.id) {
      await logAdminActivity(
        session.user.id,
        AdminLogAction.Update,
        AdminLogEvent.DisableFeature,
        `Feature: ${key} has been disabled`
      );
    }

    res.status(200).json(flags);
  } else {
    res.status(403).send("Forbidden");
  }
};
