import { NextApiRequest, NextApiResponse } from "next";
import { middleware, cors, sessionExists } from "@lib/middleware";
import { getAllPrivileges } from "@lib/privileges";

import { AdminLogAction } from "@lib/adminLogs";
import { Session } from "next-auth";
import { MiddlewareProps } from "@lib/types";
import { logMessage } from "@lib/logger";
import { createAbility, Ability } from "@lib/policyBuilder";
import {
  updatePrivilege as prismaUpdatePrivilege,
  createPrivilege as prismaCreatePrivilege,
} from "@lib/privileges";
const allowedMethods = ["GET", "PUT", "POST"];

const getPrivilegeList = async (res: NextApiResponse, ability: Ability) => {
  const privileges = await getAllPrivileges(ability);
  if (privileges.length === 0) {
    res.status(500).json({ error: "Could not process request" });
  } else {
    res.status(200).json([...privileges]);
  }
};

const createPrivilege = async (
  req: NextApiRequest,
  res: NextApiResponse,
  ability: Ability,
  session?: Session
) => {
  const { privilege } = req.body;
  if (typeof privilege === "undefined" || privilege.id) {
    return res.status(400).json({ error: "Malformed Request" });
  }
  // Need to parse serialized permissions from form response
  privilege.permissions = JSON.parse(privilege.permissions);

  const result = await prismaCreatePrivilege(ability, privilege);
  logMessage.info(AdminLogAction.Update);
  if (result) {
    if (session && session.user.id) {
      /*
      await logAdminActivity(
        session.user.id,
      );
      */
    }
    res.status(200).send("Success");
  } else {
    res.status(404).json({ error: "Privilege not found" });
  }
};

const updatePrivilege = async (
  req: NextApiRequest,
  res: NextApiResponse,
  ability: Ability,
  session?: Session
) => {
  const { privilege } = req.body;
  if (typeof privilege === "undefined" || !privilege.id) {
    return res.status(400).json({ error: "Malformed Request" });
  }
  // Need to parse serialized permissions from form response
  privilege.permissions = JSON.parse(privilege.permissions);

  const result = await prismaUpdatePrivilege(ability, privilege);

  logMessage.info(AdminLogAction.Update);
  if (result) {
    if (session && session.user.id) {
      /*
      await logAdminActivity(
        session.user.id,
      );
      */
    }
    res.status(200).send("Success");
  } else {
    res.status(404).json({ error: "Privilege not found" });
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
      case "POST":
        await createPrivilege(req, res, ability, session);
        break;
      case "PUT":
        await updatePrivilege(req, res, ability, session);
        break;
      case "GET":
        await getPrivilegeList(res, ability);
        break;
    }
  } catch (error) {
    res.status(500).json({ error: "Could not process request" });
  }
};

export default middleware([cors({ allowedMethods }), sessionExists()], handler);
