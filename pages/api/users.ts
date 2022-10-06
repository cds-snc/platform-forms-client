import { NextApiRequest, NextApiResponse } from "next";
import { middleware, cors, sessionExists } from "@lib/middleware";
import { getUsers } from "@lib/users";

import { AdminLogAction } from "@lib/adminLogs";
import { Session } from "next-auth";
import { MiddlewareProps } from "@lib/types";
import { logMessage } from "@lib/logger";
import { createAbility, Ability } from "@lib/policyBuilder";
import { updatePrivilegesForUser } from "@lib/privileges";
const allowedMethods = ["GET", "PUT"];

const getUserList = async (res: NextApiResponse, ability: Ability) => {
  const users = await getUsers(ability);
  if (users.length === 0) {
    res.status(500).json({ error: "Could not process request" });
  } else {
    res.status(200).json([...users]);
  }
};

const updatePrivilegeOnUser = async (
  req: NextApiRequest,
  res: NextApiResponse,
  ability: Ability,
  session?: Session
) => {
  const { userID, privileges } = req.body;
  if (
    typeof userID === "undefined" ||
    typeof privileges === "undefined" ||
    !Array.isArray(privileges)
  ) {
    return res.status(400).json({ error: "Malformed Request" });
  }
  const result = await updatePrivilegesForUser(ability, userID, privileges);
  logMessage.info(AdminLogAction.Update);
  if (result) {
    if (session && session.user.id) {
      /*
      await logAdminActivity(
        session.user.id,
        AdminLogAction.Update,
        isAdmin ? AdminLogEvent.GrantAdminRole : AdminLogEvent.RevokeAdminRole,
        `Admin role has been ${isAdmin ? "granted" : "revoked"} for user id: ${userId}`
      );
      */
    }
    res.status(200).send("Success");
  } else {
    res.status(404).json({ error: "User not found" });
  }
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  { session }: MiddlewareProps
): Promise<void> => {
  try {
    if (!session) {
      res.status(403);
      return;
    }
    const ability = createAbility(session.user.privileges);

    switch (req.method) {
      case "PUT":
        await updatePrivilegeOnUser(req, res, ability, session);
        break;
      case "GET":
        await getUserList(res, ability);
        break;
    }
  } catch (error) {
    res.status(500).json({ error: "Could not process request" });
  }
};

export default middleware([cors({ allowedMethods }), sessionExists()], handler);
