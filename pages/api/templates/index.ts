import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, cors, sessionExists, jsonValidator } from "@lib/middleware";
import { createTemplate, getAllTemplates, onlyIncludePublicProperties } from "@lib/templates";
import { DeliveryOption, FormProperties, MiddlewareProps, UserAbility } from "@lib/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import {
  layoutIDValidator,
  subElementsIDValidator,
  uniqueIDValidator,
} from "@lib/middleware/jsonIDValidator";

const allowedMethods = ["GET", "POST"];
const authenticatedMethods = ["POST"];

const templates = async (
  req: NextApiRequest,
  res: NextApiResponse,
  { session }: MiddlewareProps
) => {
  try {
    if (!session) return res.status(401).json({ error: "Unauthorized" });

    const ability = createAbility(session);
    const user = session.user;

    const response = await route({ ability: ability, user: user, method: req.method, ...req.body });

    if (!response) return res.status(500).json({ error: "Error on Server Side" });

    if (req.method === "GET") {
      if (Array.isArray(response)) {
        const publicTemplates = response.map((template) => onlyIncludePublicProperties(template));
        return res.status(200).json(publicTemplates);
      }
    }

    return res.status(200).json(response);
  } catch (err) {
    if (err instanceof AccessControlError) return res.status(403).json({ error: "Forbidden" });
    else return res.status(500).json({ error: "Malformed API Request" });
  }
};

const route = async ({
  ability,
  user,
  method,
  name,
  formConfig,
  deliveryOption,
}: {
  ability: UserAbility;
  user: Session["user"];
  method: string;
  name?: string;
  formConfig?: FormProperties;
  deliveryOption?: DeliveryOption;
}) => {
  switch (method) {
    case "GET":
      return getAllTemplates(ability, user.id);
    case "POST":
      if (formConfig)
        return await createTemplate(ability, user.id, formConfig, name, deliveryOption);
      throw new Error("Missing Form Configuration");
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
