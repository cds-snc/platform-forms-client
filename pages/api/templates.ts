import {
  onlyIncludePublicProperties,
  getAllTemplates,
  getTemplateByID,
  deleteTemplate,
  createTemplate,
  updateTemplate,
} from "@lib/templates";
import { FormRecord } from "@lib/types/form-types";

import { middleware, jsonValidator, cors, sessionExists } from "@lib/middleware";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import { NextApiRequest, NextApiResponse } from "next";
import { logAdminActivity, AdminLogAction, AdminLogEvent } from "@lib/adminLogs";
import {
  layoutIDValidator,
  subElementsIDValidator,
  uniqueIDValidator,
} from "@lib/middleware/jsonIDValidator";
import { Session } from "next-auth";
import { BetterOmit } from "@lib/types";
import { MiddlewareProps } from "@lib/types";
import { Ability, createAbility } from "@lib/policyBuilder";

const allowedMethods = ["GET", "POST", "PUT", "DELETE"];
const authenticatedMethods = ["POST", "PUT", "DELETE"];

const templates = async (
  req: NextApiRequest,
  res: NextApiResponse,
  { session }: MiddlewareProps
) => {
  try {
    if (!session) {
      res.status(403);
      return;
    }

    const ability = createAbility(session.user.privileges);

    const response = await templateCRUD({
      ability: ability,
      user: session?.user,
      method: req.method,
      ...req.body,
    });

    if (!response) return res.status(500).json({ error: "Error on Server Side" });

    if (session && session.user.id && ["POST", "PUT", "DELETE"].includes(req.method as string)) {
      if (req.method === "POST") {
        await logAdminActivity(
          session.user.id,
          AdminLogAction.Create,
          AdminLogEvent.UploadForm,
          `Form id: ${(response as FormRecord).id} has been uploaded`
        );
      }
      if (req.method === "PUT") {
        await logAdminActivity(
          session.user.id,
          AdminLogAction.Update,
          AdminLogEvent.UpdateForm,
          `Form id: ${req.body.formID} has been updated`
        );
      }
      if (req.method === "DELETE") {
        await logAdminActivity(
          session.user.id,
          AdminLogAction.Delete,
          AdminLogEvent.DeleteForm,
          `Form id: ${req.body.formID} has been deleted`
        );
      }
    }

    if (req.method === "GET") {
      if (Array.isArray(response)) {
        const publicTemplates = response.map((template) => onlyIncludePublicProperties(template));
        return res.status(200).json(publicTemplates);
      } else {
        const publicTemplate = onlyIncludePublicProperties(response);
        return res.status(200).json(publicTemplate);
      }
    }
    // If not GET then we're authenticated and can safely return the complete Form Record.
    return res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ error: "Malformed API Request" });
  }
};

const templateCRUD = async ({
  ability,
  method,
  user,
  formID,
  formConfig,
}: {
  ability: Ability;
  method: string;
  user: Session["user"];
  formID?: string;
  formConfig?: BetterOmit<FormRecord, "id" | "bearerToken">;
}) => {
  switch (method) {
    case "GET":
      if (formID) return await getTemplateByID(formID);
      return getAllTemplates(ability);
    case "POST":
      if (formConfig) return await createTemplate(ability, user.id, formConfig);
      throw new Error("Missing Form Configuration");
    case "PUT":
      if (formID && formConfig) return await updateTemplate(ability, formID, formConfig);
      throw new Error("Missing formID and/or formConfig");
    case "DELETE":
      if (formID) return await deleteTemplate(ability, formID);
      throw new Error("Missing formID");
    default:
      throw new Error("Unsupported Method");
  }
};

export default middleware(
  [
    cors({ allowedMethods }),
    sessionExists(authenticatedMethods),
    jsonValidator(templatesSchema, { jsonKey: "formConfig" }),
    uniqueIDValidator({ jsonKey: "formConfig" }),
    layoutIDValidator({ jsonKey: "formConfig" }),
    subElementsIDValidator({ jsonKey: "formConfig" }),
  ],
  templates
);
