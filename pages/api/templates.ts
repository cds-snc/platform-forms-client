import { crudTemplates, onlyIncludePublicProperties, getForms } from "@lib/integration/crud";

import { middleware, jsonValidator, cors, sessionExists } from "@lib/middleware";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import { NextApiRequest, NextApiResponse } from "next";
import { isAdmin } from "@lib/auth";
import { logAdminActivity } from "@lib/adminLogs";
import { AdminLogAction, AdminLogEvent } from "@lib/types";

const allowedMethods = ["GET", "POST", "PUT", "DELETE"];
const authenticatedMethods = ["POST", "PUT", "DELETE"];

const templates = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await isAdmin({ req });
    const response =
      req.method === "GET"
        ? await getForms()
        : await crudTemplates({ ...req.body, method: req.method, session });
    if (response) {
      if (session && session.user.id && ["POST", "PUT", "DELETE"].includes(req.method as string)) {
        const formId = response.data.records ? response.data.records[0].formID : req.body.formID;
        if (req.method === "POST") {
          await logAdminActivity(
            session.user.id,
            AdminLogAction.Create,
            AdminLogEvent.UploadForm,
            `Form id: ${formId} has been uploaded`
          );
        }
        if (req.method === "PUT") {
          await logAdminActivity(
            session.user.id,
            AdminLogAction.Update,
            AdminLogEvent.UpdateForm,
            `Form id: ${formId} has been updated`
          );
        }
        if (req.method === "DELETE") {
          await logAdminActivity(
            session.user.id,
            AdminLogAction.Delete,
            AdminLogEvent.DeleteForm,
            `Form id: ${formId} has been deleted`
          );
        }
      }

      if (req.method === "GET") {
        const publicTemplates = onlyIncludePublicProperties(response);
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
