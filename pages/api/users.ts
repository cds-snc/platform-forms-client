import { NextApiRequest, NextApiResponse } from "next";
import { middleware, cors, sessionExists } from "@lib/middleware";
import { getUsers } from "@lib/users";

import { AdminLogAction } from "@lib/auditLogs";
import { Session } from "next-auth";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { logMessage } from "@lib/logger";
import { createAbility, updatePrivilegesForUser, AccessControlError } from "@lib/privileges";
import { MongoAbility } from "@casl/ability";

const allowedMethods = ["GET", "PUT"];

const getUserList = async (ability: MongoAbility, res: NextApiResponse) => {
  const users = await getUsers(ability);
  if (users.length === 0) {
    res.status(500).json({ error: "Could not process request" });
  } else {
    res.status(200).json([...users]);
  }
};

const updatePrivilegeOnUser = async (
  ability: MongoAbility,
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
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
  if (result && session && session.user.id) {
    /*
      await logAdminActivity(
        session.user.id,
        AdminLogAction.Update,
        isAdmin ? AdminLogEvent.GrantAdminRole : AdminLogEvent.RevokeAdminRole,
        `Admin role has been ${isAdmin ? "granted" : "revoked"} for user id: ${userId}`
      );
      */

    return res.status(200).send("Success");
  } else {
    return res.status(404).json({ error: "User not found" });
  }
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  props: MiddlewareProps
): Promise<void> => {
  const { session } = props as WithRequired<MiddlewareProps, "session">;
  try {
    const ability = createAbility(session.user.privileges);

    switch (req.method) {
      case "GET":
        await getUserList(ability, res);
        break;
      case "PUT":
        await updatePrivilegeOnUser(ability, req, res, session);
        break;
    }
  } catch (error) {
    if (error instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    res.status(500).json({ error: "Could not process request" });
  }
};

export default middleware([cors({ allowedMethods }), sessionExists()], handler);
