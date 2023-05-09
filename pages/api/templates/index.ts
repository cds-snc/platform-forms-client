import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, cors, sessionExists, jsonValidator } from "@lib/middleware";
import { createTemplate, getAllTemplates, onlyIncludePublicProperties } from "@lib/templates";
import {
  DeliveryOption,
  FormProperties,
  MiddlewareProps,
  SecurityAttribute,
  UserAbility,
  WithRequired,
} from "@lib/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import {
  layoutIDValidator,
  subElementsIDValidator,
  uniqueIDValidator,
} from "@lib/middleware/jsonIDValidator";
import { logMessage } from "@lib/logger";

class MalformedAPIRequest extends Error {}

const templates = async (req: NextApiRequest, res: NextApiResponse, props: MiddlewareProps) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;

    const ability = createAbility(session);

    const response = await route({
      ability: ability,
      user: session.user,
      method: req.method,
      ...req.body,
    });

    if (!response) throw new Error("Null operation response");

    return res.status(200).json(response);
  } catch (e) {
    const error = e as Error;
    if (error instanceof AccessControlError) {
      return res.status(403).json({ error: "Forbidden" });
    } else if (error instanceof MalformedAPIRequest) {
      return res.status(400).json({ error: `Malformed API Request. Reason: ${error.message}.` });
    } else {
      logMessage.error(error);
      return res.status(500).json({ error: `Internal server error. Reason: ${error.message}.` });
    }
  }
};

const route = async ({
  ability,
  user,
  method,
  name,
  formConfig,
  deliveryOption,
  securityAttribute,
}: {
  ability: UserAbility;
  user: Session["user"];
  method: string;
  name?: string;
  formConfig?: FormProperties;
  deliveryOption?: DeliveryOption;
  securityAttribute?: SecurityAttribute;
}) => {
  switch (method) {
    case "GET": {
      const templates = await getAllTemplates(ability, user.id);
      return templates.map((template) => onlyIncludePublicProperties(template));
    }
    case "POST":
      if (formConfig) {
        return await createTemplate({
          ability: ability,
          userID: user.id,
          formConfig: formConfig,
          name: name,
          deliveryOption: deliveryOption,
          securityAttribute: securityAttribute,
        });
      } else {
        throw new MalformedAPIRequest("Missing formConfig");
      }
    default:
      throw new MalformedAPIRequest("Unsupported method");
  }
};

const runValidationCondition = (req: NextApiRequest) => {
  return req.body.formConfig !== undefined;
};

export default middleware(
  [
    cors({ allowedMethods: ["GET", "POST"] }),
    sessionExists(),
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
