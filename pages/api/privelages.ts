import { NextApiRequest, NextApiResponse } from "next";
import { middleware, cors, sessionExists } from "@lib/middleware";
import { getAllPriveleges } from "@lib/priveleges";

import { AdminLogAction } from "@lib/adminLogs";
import { Session } from "next-auth";
import { MiddlewareProps } from "@lib/types";
import { logMessage } from "@lib/logger";
import { createAbility, Ability } from "@lib/policyBuilder";
import {
  updatePrivelege as prismaUpdatePrivelege,
  createPrivelege as prismaCreatePrivelege,
} from "@lib/priveleges";
const allowedMethods = ["GET", "PUT", "POST"];

const getPrivelegeList = async (res: NextApiResponse, ability: Ability) => {
  const priveleges = await getAllPriveleges(ability);
  if (priveleges.length === 0) {
    res.status(500).json({ error: "Could not process request" });
  } else {
    res.status(200).json([...priveleges]);
  }
};

const createPrivelege = async (
  req: NextApiRequest,
  res: NextApiResponse,
  ability: Ability,
  session?: Session
) => {
  const { privelege } = req.body;
  if (typeof privelege === "undefined" || privelege.id) {
    return res.status(400).json({ error: "Malformed Request" });
  }
  // Need to parse serialized permissions from form response
  privelege.permissions = JSON.parse(privelege.permissions);

  const result = await prismaCreatePrivelege(ability, privelege);
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
    res.status(404).json({ error: "Privelege not found" });
  }
};

const updatePrivelege = async (
  req: NextApiRequest,
  res: NextApiResponse,
  ability: Ability,
  session?: Session
) => {
  const { privelege } = req.body;
  if (typeof privelege === "undefined" || !privelege.id) {
    return res.status(400).json({ error: "Malformed Request" });
  }
  // Need to parse serialized permissions from form response
  privelege.permissions = JSON.parse(privelege.permissions);

  const result = await prismaUpdatePrivelege(ability, privelege);

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
    res.status(404).json({ error: "Privelege not found" });
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
    const ability = createAbility(session.user.priveleges);

    switch (req.method) {
      case "POST":
        await createPrivelege(req, res, ability, session);
        break;
      case "PUT":
        await updatePrivelege(req, res, ability, session);
        break;
      case "GET":
        await getPrivelegeList(res, ability);
        break;
    }
  } catch (error) {
    res.status(500).json({ error: "Could not process request" });
  }
};

export default middleware([cors({ allowedMethods }), sessionExists()], handler);
