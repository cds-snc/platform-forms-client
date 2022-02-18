import { NextApiRequest, NextApiResponse } from "next";

import middleware from "@lib/middleware/middleware";
import { getUsers, adminRole } from "@lib/users";

import isMethodAllowed from "@lib/middleware/httpMethodAllowed";
import isUserSessionExist from "@lib/middleware/HttpSessionExist";

const allowedMethods = ["GET", "POST"];
const authenticatedMethods = ["POST"];

const getMethod = async (res: NextApiResponse) => {
  const users = await getUsers();
  res.status(200).json({ users });
};

const postMethod = async (req: NextApiRequest, res: NextApiResponse) => {
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
    case "POST":
      await postMethod(req, res);
      break;
    case "GET":
      await getMethod(res);
      break;
  }
};

export default middleware(
  [isMethodAllowed(allowedMethods), isUserSessionExist(authenticatedMethods)],
  handler
);
