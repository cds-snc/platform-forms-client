import { crudTemplates } from "../../lib/dataLayer";
import { logMessage } from "../../lib/logger";
import { getSession } from "next-auth/client";

const isAllowed = (session, method) => {
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

const templates = async (req, res) => {
  try {
    const session = await getSession({ req });

    const requestBody = JSON.parse(req.body);

    if (isAllowed(session, requestBody.method)) {
      return crudTemplates({ ...requestBody, session })
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

export default templates;
