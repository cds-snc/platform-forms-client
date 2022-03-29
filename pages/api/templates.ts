import { crudTemplates, onlyIncludePublicProperties } from "@lib/integration/crud";

import { middleware, jsonValidator, cors, sessionExists } from "@lib/middleware";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import { NextApiRequest, NextApiResponse } from "next";
import { isAdmin } from "@lib/auth";

const allowedMethods = ["GET", "POST", "PUT", "DELETE"];
const authenticatedMethods = ["POST", "PUT", "DELETE"];

const templates = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await isAdmin({ req });
    const response = await crudTemplates({ ...req.body, method: req.method, session });
    if (response) {
      if (req.method === "GET") {
        const publicTemplates = await onlyIncludePublicProperties(response);
        res.status(200).json(publicTemplates);
      } else {
        res.status(200).json(response);
      }
    } else {
      res.status(500).json({ error: "Error on Server Side" });
    }
  } catch (err) {
    res.status(500).json({ error: "Malformed API Request" });
  }
};

export default middleware(
  [
    cors({ allowedMethods }),
    sessionExists(authenticatedMethods),
    jsonValidator(templatesSchema, { jsonKey: "formConfig" }),
  ],
  templates
);
