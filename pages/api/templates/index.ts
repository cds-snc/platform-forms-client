import { createAbility } from "@lib/privileges";
import { middleware, cors, sessionExists, jsonValidator } from "@lib/middleware";
import { createTemplate, getAllTemplates, onlyIncludePublicProperties } from "@lib/templates";
import { BetterOmit, FormRecord, MiddlewareProps } from "@lib/types";
import type { NextApiRequest, NextApiResponse } from "next";
import { MongoAbility } from "@casl/ability";
import { Session } from "next-auth";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import {
  layoutIDValidator,
  subElementsIDValidator,
  uniqueIDValidator,
} from "@lib/middleware/jsonIDValidator";
import { AdminLogAction, AdminLogEvent, logAdminActivity } from "@lib/adminLogs";

const allowedMethods = ["GET", "POST"];
const authenticatedMethods = ["POST"];

const templates = async (
  req: NextApiRequest,
  res: NextApiResponse,
  { session }: MiddlewareProps
) => {
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const ability = createAbility(session.user.privileges);
  const user = session.user;

  const response = await route({ ability: ability, user: user, method: req.method, ...req.body });

  if (!response) return res.status(500).json({ error: "Error on Server Side" });
  
  if (req.method === "POST") {
    await logAdminActivity(
      session.user.id,
      AdminLogAction.Create,
      AdminLogEvent.UploadForm,
      `Form id: ${(response as FormRecord).id} has been uploaded`
    );
  }

  if (req.method === "GET") {
    if (Array.isArray(response)) {
      const publicTemplates = response.map((template) => onlyIncludePublicProperties(template));
      return res.status(200).json(publicTemplates);
    }
  }

  return res.status(200).json(response);
};

const route = async ({
  ability,
  user,
  method,
  formConfig,
}: {
  ability: MongoAbility;
  user: Session["user"];
  method: string;
  formConfig?: BetterOmit<FormRecord, "id" | "bearerToken">;
}) => {
  switch (method) {
    case "GET":
      return getAllTemplates(ability, user.id);
      break;
    case "POST":
      if (formConfig) return await createTemplate(ability, user.id, formConfig);
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
