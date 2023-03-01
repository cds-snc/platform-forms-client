import { NextApiRequest, NextApiResponse } from "next";
import { middleware, cors, sessionExists } from "@lib/middleware";
import { getAllPrivileges } from "@lib/privileges";
import { Session } from "next-auth";
import { MiddlewareProps, WithRequired, UserAbility } from "@lib/types";
import { logMessage } from "@lib/logger";
import {
  createAbility,
  updatePrivilege as prismaUpdatePrivilege,
  createPrivilege as prismaCreatePrivilege,
} from "@lib/privileges";

const allowedMethods = ["GET", "PUT", "POST"];

const getPrivilegeList = async (ability: UserAbility, res: NextApiResponse) => {
  const privileges = await getAllPrivileges(ability);
  if (privileges.length === 0) {
    res.status(500).json({ error: "Could not process request" });
  } else {
    res.status(200).json([...privileges]);
  }
};

const createPrivilege = async (
  ability: UserAbility,
  req: NextApiRequest,
  res: NextApiResponse,
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
  ability: UserAbility,
  req: NextApiRequest,
  res: NextApiResponse,
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
  props: MiddlewareProps
): Promise<void> => {
  const { session } = props as WithRequired<MiddlewareProps, "session">;
  try {
    const ability = createAbility(session.user.privileges);

    switch (req.method) {
      case "POST":
        await createPrivilege(ability, req, res, session);
        break;
      case "PUT":
        await updatePrivilege(ability, req, res, session);
        break;
      case "GET":
        await getPrivilegeList(ability, res);
        break;
    }
  } catch (error) {
    res.status(500).json({ error: "Could not process request" });
  }
};

export default middleware([cors({ allowedMethods }), sessionExists()], handler);
