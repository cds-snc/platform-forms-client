import { crudTemplates } from "../../lib/dataLayer";
import isRequestAllowed from "../../lib/http/allowed";
import validate from "../../lib/jsonValidator/jsonValidator";
import templatesSchema from "../../lib/jsonValidator/schemas/templates.schema.json";
import { logMessage } from "../../lib/logger";
import { getSession } from "next-auth/client";
import { NextApiRequest, NextApiResponse } from "next";

const allowedMethods = ["GET", "INSERT", "UPDATE", "DELETE"];

const templates = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession({ req });
    const requestBody = JSON.parse(req.body);
    const response = await crudTemplates({ ...requestBody, session });
    if (response) {
      res.status(200).json(response);
    } else {
      res.status(500).json({ error: "Error on Server Side" });
    }
  } catch (err) {
    logMessage.error(`${err}`);
    res.status(500).json({ error: "Malformed API Request" });
  }
};

export default isRequestAllowed(allowedMethods, validate(templatesSchema, templates));
