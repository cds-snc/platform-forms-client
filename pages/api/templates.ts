import { crudTemplates } from "../../lib/integration/crud";
import isRequestAllowed from "../../lib/middleware/httpRequestAllowed";
import validate from "../../lib/middleware/jsonValidator";
import templatesSchema from "../../lib/middleware/schemas/templates.schema.json";
import { getSession } from "next-auth/client";
import { NextApiRequest, NextApiResponse } from "next";

const allowedMethods = ["GET", "POST", "PUT", "DELETE"];

const templates = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession({ req });
    const response = await crudTemplates({ ...req.body, method: req.method, session });
    if (response) {
      res.status(200).json(response);
    } else {
      res.status(500).json({ error: "Error on Server Side" });
    }
  } catch (err) {
    res.status(500).json({ error: "Malformed API Request" });
  }
};

export default isRequestAllowed(
  allowedMethods,
  validate(templatesSchema, templates, { jsonKey: "formConfig" })
);
