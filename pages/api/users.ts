import { NextApiRequest, NextApiResponse } from "next";

import { middleware, cors, sessionExists } from "@lib/middleware";
import { getUsers, adminRole } from "@lib/users";
import { logAdminActivity } from "@lib/adminLogs";
import { Session } from "next-auth";
import { MiddlewareProps } from "@lib/types";
import { AdminLogAction, AdminLogEvent } from "@lib/types/utility-types";

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
  const { userID, isAdmin } = req.body;
  if (typeof userID === "undefined" || typeof isAdmin === "undefined") {
    return res.status(400).json({ error: "Malformed Request" });
  }
  const [success, userFound] = await adminRole(isAdmin, userID);

  if (success && userFound) {
    if (session && session.user.id) {
      await logAdminActivity(
        session.user.id,
        AdminLogAction.Update,
        isAdmin ? AdminLogEvent.GrantAdminRole : AdminLogEvent.RevokeAdminRole,
        `Admin role has been ${isAdmin ? "granted" : "revoked"} for user id: ${userID}`
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
