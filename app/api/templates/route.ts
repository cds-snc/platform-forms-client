import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, sessionExists, jsonValidator } from "@lib/middleware";
import {
  createTemplate,
  getAllTemplatesForUser,
  onlyIncludePublicProperties,
} from "@lib/templates";
import {
  DeliveryOption,
  FormProperties,
  MiddlewareProps,
  SecurityAttribute,
  WithRequired,
} from "@lib/types";
import { NextResponse } from "next/server";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import {
  layoutIDValidator,
  subElementsIDValidator,
  uniqueIDValidator,
} from "@lib/middleware/jsonIDValidator";
import { logMessage } from "@lib/logger";

class MalformedAPIRequest extends Error {}

const runValidationCondition = async (body: Record<string, unknown>) => {
  return body.formConfig !== undefined;
};

export const GET = middleware(
  [
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
  async (req, props) => {
    try {
      const { session } = props as WithRequired<MiddlewareProps, "session">;

      const ability = createAbility(session);
      const templates = await getAllTemplatesForUser(ability);
      const response = templates.map((template) => onlyIncludePublicProperties(template));

      if (!response)
        throw new Error(
          `Template API response was null. Request information: method = ${
            req.method
          } ; query = ${JSON.stringify(props.params)} ; body = ${JSON.stringify(props.body)}`
        );
      return NextResponse.json(response);
    } catch (e) {
      const error = e as Error;
      if (error instanceof AccessControlError) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      } else {
        logMessage.error(error);
        return NextResponse.json(
          { error: `Internal server error. Reason: ${error.message}.` },
          { status: 500 }
        );
      }
    }
  }
);

interface PostApiProps {
  formConfig?: FormProperties;
  name?: string;
  deliveryOption?: DeliveryOption;
  securityAttribute?: SecurityAttribute;
}

export const POST = middleware(
  [
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
  async (req, props) => {
    try {
      const { session } = props as WithRequired<MiddlewareProps, "session">;

      const ability = createAbility(session);

      const { formConfig, name, deliveryOption, securityAttribute }: PostApiProps = props.body;

      if (formConfig) {
        const response = await createTemplate({
          ability: ability,
          userID: session.user.id,
          formConfig: formConfig,
          name: name,
          deliveryOption: deliveryOption,
          securityAttribute: securityAttribute,
        });
        if (!response) {
          throw new Error(
            `Template API response was null. Request information: method = ${
              req.method
            } ; query = ${JSON.stringify(props.params)} ; body = ${JSON.stringify(props.body)}`
          );
        }
        return NextResponse.json(response);
      } else {
        throw new MalformedAPIRequest("Missing formConfig");
      }
    } catch (e) {
      const error = e as Error;
      if (error instanceof AccessControlError) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      } else {
        logMessage.error(error);
        return NextResponse.json(
          { error: `Internal server error. Reason: ${error.message}.` },
          { status: 500 }
        );
      }
    }
  }
);
