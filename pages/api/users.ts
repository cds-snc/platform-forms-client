import { NextApiRequest, NextApiResponse } from "next";

import { middleware, httpMethodAllowed, sessionExists } from "@lib/middleware";
import { getUsers, adminRole } from "@lib/users";

const allowedMethods = ["GET", "PUT"];

const getUserAdminStatus = async (res: NextApiResponse) => {
  const users = await getUsers();
  res.status(200).json({ users });
};

const updateUserAdminStatus = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userID, isAdmin } = req.body;
  if (typeof userID === "undefined" || typeof isAdmin === "undefined") {
    return res.status(400).json({ error: "Malformed Request" });
  }
  const success = await adminRole(isAdmin, userID);

  if (success) {
    res.status(200).send("Success");
  } else {
    res.status(500).json({ error: "Could not process request" });
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  switch (req.method) {
    case "PUT":
      await updateUserAdminStatus(req, res);
      break;
    case "GET":
      await getUserAdminStatus(res);
      break;
  }
};

export default middleware([httpMethodAllowed(allowedMethods), sessionExists()], handler);
