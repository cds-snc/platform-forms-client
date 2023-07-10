import {
  deleteTemplate,
  updateTemplate,
  updateIsPublishedForTemplate,
  updateAssignedUsersForTemplate,
  TemplateAlreadyPublishedError,
  getFullTemplateByID,
  removeDeliveryOption,
  TemplateHasUnprocessedSubmissions,
} from "@lib/templates";

import { middleware, jsonValidator, cors, sessionExists } from "@lib/middleware";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import { NextApiRequest, NextApiResponse } from "next";
import {
  layoutIDValidator,
  subElementsIDValidator,
  uniqueIDValidator,
} from "@lib/middleware/jsonIDValidator";
import {
  MiddlewareProps,
  FormProperties,
  DeliveryOption,
  UserAbility,
  SecurityAttribute,
  WithRequired,
} from "@lib/types";
import { AccessControlError, createAbility } from "@lib/privileges";
import { logMessage } from "@lib/logger";

class MalformedAPIRequest extends Error {}

const templates = async (req: NextApiRequest, res: NextApiResponse, props: MiddlewareProps) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;

    const ability = createAbility(session);

    const response = await route({
      ability: ability,
      method: req.method,
      request: req,
      ...req.body,
    });

    if (!response) throw new Error("Null operation response");

    return res.status(200).json(response);
  } catch (e) {
    const error = e as Error;

    if (e instanceof AccessControlError) {
      return res.status(403).json({ error: "Forbidden" });
    } else if (e instanceof TemplateAlreadyPublishedError) {
      return res.status(409).json({ error: "Can't update published form" });
    } else if (e instanceof TemplateHasUnprocessedSubmissions) {
      return res.status(405).json({ error: "Found unprocessed submissions" });
    } else if (e instanceof MalformedAPIRequest) {
      return res.status(400).json({ error: `Malformed API Request. Reason: ${error.message}.` });
    } else {
      logMessage.error(error);
      return res.status(500).json({ error: `Internal server error. Reason: ${error.message}.` });
    }
  }
};

const route = async ({
  ability,
  method,
  request,
  name,
  formConfig,
  deliveryOption,
  securityAttribute,
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
  securityAttribute?: SecurityAttribute;
  isPublished?: boolean;
  users?: { id: string; action: "add" | "remove" }[];
  sendResponsesToVault?: boolean;
}) => {
  const formID = request.query.formID;

  if (!formID || typeof formID !== "string") {
    throw new MalformedAPIRequest("Invalid or missing formID");
  }

  switch (method) {
    case "GET":
      return getFullTemplateByID(ability, formID);
    case "PUT":
      if (formConfig) {
        return updateTemplate({
          ability: ability,
          formID: formID,
          formConfig: formConfig,
          name: name,
          deliveryOption: deliveryOption,
          securityAttribute: securityAttribute,
        });
      } else if (isPublished !== undefined) {
        return updateIsPublishedForTemplate(ability, formID, isPublished);
      } else if (users) {
        if (!users.length) {
          return { error: true, message: "Must have at least one assigned user" };
        }
        return updateAssignedUsersForTemplate(ability, formID, users);
      } else if (sendResponsesToVault) {
        return removeDeliveryOption(ability, formID);
      }
      throw new MalformedAPIRequest(
        "Missing additional request parameter (formConfig, isPublished, users, sendResponsesToVault)"
      );
    case "DELETE":
      return deleteTemplate(ability, formID);
    default:
      throw new MalformedAPIRequest("Unsupported method");
  }
};

const runValidationCondition = (req: NextApiRequest) => {
  return req.body.formConfig !== undefined;
};

export default middleware(
  [
    cors({ allowedMethods: ["GET", "POST", "PUT", "DELETE"] }),
    sessionExists(),
    jsonValidator(templatesSchema, {
      jsonKey: "formConfig",
      noHTML: true,
      noValidateMethods: ["DELETE"],
    }),
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
