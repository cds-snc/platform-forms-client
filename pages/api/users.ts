import { NextApiRequest, NextApiResponse } from "next";
import { middleware, cors, sessionExists } from "@lib/middleware";
import { getUsers, adminRole } from "@lib/users";
import { logAdminActivity } from "@lib/adminLogs";
import { AdminLogAction, AdminLogEvent } from "@lib/adminLogs";
import { Session } from "next-auth";
import { MiddlewareProps } from "@lib/types";
import { logMessage } from "@lib/logger";

const allowedMethods = ["GET", "PUT"];

const getUserAdminStatus = async (res: NextApiResponse) => {
  const users = await getUsers();
  if (users.length === 0) {
    res.status(500).json({ error: "Could not process request" });
  } else {
    res.status(200).json({ users });
  }
};

const updateUserAdminStatus = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session?: Session
) => {
  const { userId, isAdmin } = req.body;
  if (typeof userId === "undefined" || typeof isAdmin === "undefined") {
    return res.status(400).json({ error: "Malformed Request" });
  }
  const [success, userFound] = await adminRole(isAdmin, userId);
  logMessage.info(AdminLogAction.Update);
  if (success && userFound) {
    if (session && session.user.userId) {
      await logAdminActivity(
        session.user.userId,
        AdminLogAction.Update,
        isAdmin ? AdminLogEvent.GrantAdminRole : AdminLogEvent.RevokeAdminRole,
        `Admin role has been ${isAdmin ? "granted" : "revoked"} for user id: ${userId}`
      );
    }
    res.status(200).send("Success");
  } else if (success) {
    res.status(404).json({ error: "User not found" });
  } else {
    res.status(500).json({ error: "Could not process request" });
  }
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  { session }: MiddlewareProps
): Promise<void> => {
  switch (req.method) {
    case "PUT":
      await updateUserAdminStatus(req, res, session);
      break;
    case "GET":
      await getUserAdminStatus(res);
      break;
  }
};

export default middleware([cors({ allowedMethods }), sessionExists()], handler);
