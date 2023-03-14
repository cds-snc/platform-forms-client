import {
  deleteTemplate,
  updateTemplate,
  updateIsPublishedForTemplate,
  updateAssignedUsersForTemplate,
  onlyIncludePublicProperties,
  TemplateAlreadyPublishedError,
  getFullTemplateByID,
  removeDeliveryOption,
} from "@lib/templates";

import { middleware, jsonValidator, cors, sessionExists } from "@lib/middleware";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import { NextApiRequest, NextApiResponse } from "next";
import {
  layoutIDValidator,
  subElementsIDValidator,
  uniqueIDValidator,
} from "@lib/middleware/jsonIDValidator";
import { MiddlewareProps, FormProperties, DeliveryOption, UserAbility } from "@lib/types";
import { AccessControlError, createAbility } from "@lib/privileges";

const allowedMethods = ["GET", "POST", "PUT", "DELETE"];
const authenticatedMethods = ["POST", "PUT", "DELETE"];

const templates = async (
  req: NextApiRequest,
  res: NextApiResponse,
  { session }: MiddlewareProps
) => {
  try {
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const ability = createAbility(session);

    const response = await templateCRUD({
      ability: ability,
      method: req.method,
      request: req,
      ...req.body,
    });

    if (!response) return res.status(500).json({ error: "Error on Server Side" });

    if (req.method === "GET") {
      if (Array.isArray(response)) {
        const publicTemplates = response.map((template) => onlyIncludePublicProperties(template));
        return res.status(200).json(publicTemplates);
      }
    }

    // If not GET then we're authenticated and can safely return the complete Form Record.
    return res.status(200).json(response);
  } catch (err) {
    if (err instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    else if (err instanceof TemplateAlreadyPublishedError)
      return res.status(500).json({ error: "Can't update published form" });
    else return res.status(500).json({ error: "Malformed API Request" });
  }
};

const templateCRUD = async ({
  ability,
  method,
  request,
  name,
  formConfig,
  deliveryOption,
  isPublished,
  users,
  sendResponsesToVault,
}: {
  ability: UserAbility;
  method: string;
  request: NextApiRequest;
  name?: string;
  formConfig?: FormProperties;
  deliveryOption?: DeliveryOption;
  isPublished?: boolean;
  users?: { id: string; action: "add" | "remove" }[];
  sendResponsesToVault?: boolean;
}) => {
  const formID = request.query.formID as string;
  switch (method) {
    case "GET":
      if (formID) return await getFullTemplateByID(ability, formID);
      break;
    case "PUT":
      if (formID && formConfig) {
        return await updateTemplate(ability, formID, formConfig, name, deliveryOption);
      } else if (formID && isPublished) {
        return await updateIsPublishedForTemplate(ability, formID, isPublished);
      } else if (formID && users) {
        return await updateAssignedUsersForTemplate(ability, formID, users);
      } else if (formID && sendResponsesToVault) {
        return await removeDeliveryOption(ability, formID);
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
    jsonValidator(templatesSchema, { jsonKey: "formConfig", noHTML: true }),
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
