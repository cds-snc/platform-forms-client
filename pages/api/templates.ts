import {
  onlyIncludePublicProperties,
  getAllTemplates,
  getTemplateByID,
  deleteTemplate,
  createTemplate,
  updateTemplate,
  updateIsPublishedForTemplate,
  updateAssignedUsersForTemplate,
} from "@lib/templates";

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
import { BetterOmit, MiddlewareProps, FormRecord } from "@lib/types";
import { AccessControlError, createAbility } from "@lib/privileges";
import { MongoAbility } from "@casl/ability";

const allowedMethods = ["GET", "POST", "PUT", "DELETE"];
const authenticatedMethods = ["POST", "PUT", "DELETE"];

const templates = async (
  req: NextApiRequest,
  res: NextApiResponse,
  { session }: MiddlewareProps
) => {
  try {
    if (!session) return res.status(401).json({ error: "Unauthorized" });

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
          req.body.isPublished !== undefined
            ? `Form id: ${req.body.formID} 'isPublished' value has been updated`
            : `Form id: ${req.body.formID} has been updated`
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
    if (err instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    res.status(500).json({ error: "Malformed API Request" });
  }
};

const templateCRUD = async ({
  ability,
  method,
  user,
  formID,
  formConfig,
  isPublished,
  users,
}: {
  ability: MongoAbility;
  method: string;
  user: Session["user"];
  formID?: string;
  formConfig?: BetterOmit<FormRecord, "id" | "bearerToken">;
  isPublished: boolean;
  users: { id: string; action: "add" | "remove" }[];
}) => {
  switch (method) {
    case "GET":
      if (formID) return await getTemplateByID(formID);
      return getAllTemplates(ability, user.id);
    case "POST":
      if (formConfig) return await createTemplate(ability, user.id, formConfig);
      throw new Error("Missing Form Configuration");
    case "PUT":
      if (formID && formConfig) {
        return await updateTemplate(ability, formID, formConfig);
      } else if (formID && isPublished !== undefined) {
        return await updateIsPublishedForTemplate(ability, formID, isPublished);
      } else if (formID && users) {
        return await updateAssignedUsersForTemplate(ability, formID, users);
      }
      throw new Error("Missing formID and/or formConfig");
    case "DELETE":
      if (formID) return await deleteTemplate(ability, formID);
      throw new Error("Missing formID");
    default:
      throw new Error("Unsupported Method");
  }
};

const runValidationCondition = (req: NextApiRequest) => {
  return req.body.formConfig !== undefined;
};

export default middleware(
  [
    cors({ allowedMethods }),
    sessionExists(authenticatedMethods),
    jsonValidator(templatesSchema, { jsonKey: "formConfig" }),
    uniqueIDValidator({
      runValidationIf: runValidationCondition,
      jsonKey: "formConfig",
    }),
    layoutIDValidator({
      runValidationIf: runValidationCondition,
      jsonKey: "formConfig",
    }),
    subElementsIDValidator({
      runValidationIf: runValidationCondition,
      jsonKey: "formConfig",
    }),
  ],
  templates
);
