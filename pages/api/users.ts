import { NextApiRequest, NextApiResponse } from "next";

import { middleware, cors, sessionExists } from "@lib/middleware";
import { getUsers, adminRole } from "@lib/users";

const allowedMethods = ["GET", "PUT"];

const getUserAdminStatus = async (res: NextApiResponse) => {
  const users = await getUsers();
  if (users.length === 0) {
    res.status(500).json({ error: "Could not process request" });
  } else {
    res.status(200).json({ users });
  }
};

const updateUserAdminStatus = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userID, isAdmin } = req.body;
  if (typeof userID === "undefined" || typeof isAdmin === "undefined") {
    return res.status(400).json({ error: "Malformed Request" });
  }
  const [success, userFound] = await adminRole(isAdmin, userID);

  if (success && userFound) {
    res.status(200).send("Success");
  } else if (success) {
    res.status(404).json({ error: "User not found" });
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

export default middleware([cors({ allowedMethods }), sessionExists()], handler);
