import { crudTemplates } from "@lib/integration/crud";
import isMethodAllowed from "@lib/middleware/httpMethodAllowed";
import jsonValidator from "@lib/middleware/jsonValidator";
import middleware from "@lib/middleware/middleware";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import { NextApiRequest, NextApiResponse } from "next";
import { isAdmin } from "@lib/auth";

const allowedMethods = ["GET", "INSERT", "UPDATE", "DELETE"];

const templates = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await isAdmin({ req });
    const response = await crudTemplates({ ...req.body, session });
    if (response) {
      res.status(200).json(response);
    } else {
      res.status(500).json({ error: "Error on Server Side" });
    }
  } catch (err) {
    res.status(500).json({ error: "Malformed API Request" });
  }
};

export default middleware(
  [isMethodAllowed(allowedMethods), jsonValidator(templatesSchema, { jsonKey: "formConfig" })],
  templates
);
