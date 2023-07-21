import { NextApiRequest, NextApiResponse } from "next";
import { middleware, cors, sessionExists } from "@lib/middleware";
import { getUsers, updateActiveStatus } from "@lib/users";
import { MiddlewareProps, WithRequired, UserAbility } from "@lib/types";

import { createAbility, updatePrivilegesForUser, AccessControlError } from "@lib/privileges";

const allowedMethods = ["GET", "PUT"];

const getUserList = async (ability: UserAbility, res: NextApiResponse) => {
  const users = await getUsers(ability);
  if (users.length === 0) {
    res.status(500).json({ error: "Could not process request" });
  } else {
    res.status(200).json([...users]);
  }
};

const updateActiveStatusOnUser = async (
  ability: UserAbility,
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { userID, active } = req.body;
  if (typeof userID === "undefined" || typeof active === "undefined") {
    return res.status(400).json({ error: "Malformed Request" });
  }

  const result = await updateActiveStatus(ability, userID, active);
  if (result) {
    return res.status(200).send("Success");
  }
};

const updatePrivilegeOnUser = async (
  ability: UserAbility,
  req: NextApiRequest,
  res: NextApiResponse
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

  if (result) {
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
    const ability = createAbility(session);

    switch (req.method) {
      case "GET":
        await getUserList(ability, res);
        break;
      case "PUT":
        if ("active" in req.body) {
          await updateActiveStatusOnUser(ability, req, res);
          break;
        }
        await updatePrivilegeOnUser(ability, req, res);
        break;
    }
  } catch (error) {
    if (error instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    res.status(500).json({ error: "Could not process request" });
  }
};

export default middleware([cors({ allowedMethods }), sessionExists()], handler);
