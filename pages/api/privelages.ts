import { NextApiRequest, NextApiResponse } from "next";
import { middleware, cors, sessionExists } from "@lib/middleware";
import { getAllPrivelages } from "@lib/privelages";

import { AdminLogAction } from "@lib/adminLogs";
import { Session } from "next-auth";
import { MiddlewareProps } from "@lib/types";
import { logMessage } from "@lib/logger";
import { createAbility, Ability } from "@lib/policyBuilder";
import {
  updatePrivelage as prismaUpdatePrivelage,
  createPrivelage as prismaCreatePrivelage,
} from "@lib/privelages";
const allowedMethods = ["GET", "PUT", "POST"];

const getPrivelageList = async (res: NextApiResponse, ability: Ability) => {
  const privelages = await getAllPrivelages(ability);
  if (privelages.length === 0) {
    res.status(500).json({ error: "Could not process request" });
  } else {
    res.status(200).json([...privelages]);
  }
};

const createPrivelage = async (
  req: NextApiRequest,
  res: NextApiResponse,
  ability: Ability,
  session?: Session
) => {
  const { privelage } = req.body;
  if (typeof privelage === "undefined" || privelage.id) {
    return res.status(400).json({ error: "Malformed Request" });
  }
  // Need to parse serialized permissions from form response
  privelage.permissions = JSON.parse(privelage.permissions);

  const result = await prismaCreatePrivelage(ability, privelage);
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
    res.status(404).json({ error: "Privelage not found" });
  }
};

const updatePrivelage = async (
  req: NextApiRequest,
  res: NextApiResponse,
  ability: Ability,
  session?: Session
) => {
  const { privelage } = req.body;
  if (typeof privelage === "undefined" || !privelage.id) {
    return res.status(400).json({ error: "Malformed Request" });
  }
  // Need to parse serialized permissions from form response
  privelage.permissions = JSON.parse(privelage.permissions);

  const result = await prismaUpdatePrivelage(ability, privelage);

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
    res.status(404).json({ error: "Privelage not found" });
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
    const ability = createAbility(session.user.privelages);

    switch (req.method) {
      case "POST":
        await createPrivelage(req, res, ability, session);
        break;
      case "PUT":
        await updatePrivelage(req, res, ability, session);
        break;
      case "GET":
        await getPrivelageList(res, ability);
        break;
    }
  } catch (error) {
    res.status(500).json({ error: "Could not process request" });
  }
};

export default middleware([cors({ allowedMethods }), sessionExists()], handler);
