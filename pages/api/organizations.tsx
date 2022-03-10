import { crudOrganizations } from "../../lib/integration/crud";
import type { NextApiRequest, NextApiResponse } from "next";
import { logMessage } from "@lib/logger";
import { isAdmin } from "@lib/auth";
import { Session } from "next-auth";

const isAllowed = (session: Session | null, method: string) => {
  switch (method) {
    case "GET":
      return true;
    case "INSERT":
    case "UPDATE":
    case "DELETE":
      return session ? true : false;
    default:
      return false;
  }
};

const organizations = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  try {
    const session = await isAdmin({ req });

    const requestBody = req.body;

    if (isAllowed(session, requestBody.method)) {
      return crudOrganizations({ ...requestBody, session })
        .then((response) => {
          if (response) {
            res.status(200).json(response);
          } else {
            res.status(500).json({ error: "Error on Server Side" });
          }
        })
        .catch((err) => {
          logMessage.error(err);
          res.status(500).json({ error: "Error on Server Side" });
        });
    } else {
      return res.status(403).json({ error: "Forbidden" });
    }
  } catch {
    res.status(500).json({ error: "Malformed API Request" });
  }
};

export default organizations;
