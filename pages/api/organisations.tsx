import { crudOrganisations } from "../../lib/dataLayer";
import type { NextApiRequest, NextApiResponse } from "next";
import { logMessage } from "../../lib/logger";
import { getSession } from "next-auth/client";

const isAllowed = (session, method: string) => {
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

const organisations = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  try {
    const session = await getSession({ req });

    const requestBody = JSON.parse(req.body);
    console.log(requestBody);

    if (isAllowed(session, requestBody.method)) {
      return crudOrganisations({ ...requestBody, session })
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

export default organisations;
