import {
  deleteTemplate,
  updateTemplate,
  updateIsPublishedForTemplate,
  updateAssignedUsersForTemplate,
  TemplateAlreadyPublishedError,
  getFullTemplateByID,
  removeDeliveryOption,
  TemplateHasUnprocessedSubmissions,
  updateClosingDateForTemplate,
  getPublicTemplateByID,
} from "@lib/templates";

import { middleware, jsonValidator, sessionExists } from "@lib/middleware";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import { NextResponse } from "next/server";
import {
  layoutIDValidator,
  subElementsIDValidator,
  uniqueIDValidator,
} from "@lib/middleware/jsonIDValidator";
import {
  MiddlewareProps,
  FormProperties,
  DeliveryOption,
  SecurityAttribute,
  WithRequired,
} from "@lib/types";
import { AccessControlError, createAbility } from "@lib/privileges";
import { logMessage } from "@lib/logger";
import { auth } from "@lib/auth";

class MalformedAPIRequest extends Error {}

const runValidationCondition = async (body: Record<string, unknown>) => {
  return body.formConfig !== undefined;
};

export const GET = middleware(
  [
    jsonValidator(templatesSchema, {
      jsonKey: "formConfig",
      noHTML: true,
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
  async (req, props) => {
    try {
      const formID = props.params?.formID;

      if (!formID || typeof formID !== "string") {
        throw new MalformedAPIRequest("Invalid or missing formID");
      }

      const session = await auth();

      if (!session) {
        const response = await getPublicTemplateByID(formID);
        if (response === null) {
          throw new Error(
            `Template API response was null. Request information: method = ${
              req.method
            } ; query = ${JSON.stringify(props.params)} ; body = ${JSON.stringify(props.body)}`
          );
        }
        if (!response.isPublished) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.json(response);
      }

      const ability = createAbility(session);

      const response = await getFullTemplateByID(ability, formID);
      if (response === null) {
        throw new Error(
          `Template API response was null. Request information: method = ${
            req.method
          } ; query = ${JSON.stringify(props.params)} ; body = ${JSON.stringify(props.body)}`
        );
      }
      return NextResponse.json(response);
    } catch (e) {
      const error = e as Error;
      if (e instanceof AccessControlError) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      } else if (e instanceof MalformedAPIRequest) {
        return NextResponse.json(
          { error: `Malformed API Request. Reason: ${error.message}.` },
          { status: 400 }
        );
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

interface PutApiProps {
  name?: string;
  formConfig?: FormProperties;
  deliveryOption?: DeliveryOption;
  securityAttribute?: SecurityAttribute;
  isPublished?: boolean;
  closingDate?: string;
  users?: { id: string; action: "add" | "remove" }[];
  sendResponsesToVault?: boolean;
}

export const PUT = middleware(
  [
    sessionExists(),
    jsonValidator(templatesSchema, {
      jsonKey: "formConfig",
      noHTML: true,
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
  async (req, props) => {
    try {
      const { session } = props as WithRequired<MiddlewareProps, "session">;

      const ability = createAbility(session);
      const {
        formConfig,
        name,
        deliveryOption,
        securityAttribute,
        isPublished,
        closingDate,
        users,
        sendResponsesToVault,
      }: PutApiProps = props.body;

      const formID = props.params?.formID;

      if (!formID || typeof formID !== "string") {
        throw new MalformedAPIRequest("Invalid or missing formID");
      }

      let response;

      if (formConfig) {
        response = await updateTemplate({
          ability: ability,
          formID: formID,
          formConfig: formConfig,
          name: name,
          deliveryOption: deliveryOption,
          securityAttribute: securityAttribute,
        });
        if (!response)
          throw new Error(
            `Template API response was null. Request information: method = ${
              req.method
            } ; query = ${JSON.stringify(props.params)} ; body = ${JSON.stringify(props.body)}`
          );
        return NextResponse.json(response);
      } else if (isPublished !== undefined) {
        const response = await updateIsPublishedForTemplate(ability, formID, isPublished);
        if (!response)
          throw new Error(
            `Template API response was null. Request information: method = ${
              req.method
            } ; query = ${JSON.stringify(props.params)} ; body = ${JSON.stringify(props.body)}`
          );
        return NextResponse.json(response);
      } else if (closingDate) {
        const response = await updateClosingDateForTemplate(ability, formID, closingDate);
        if (!response)
          throw new Error(
            `Template API response was null. Request information: method = ${
              req.method
            } ; query = ${JSON.stringify(props.params)} ; body = ${JSON.stringify(props.body)}`
          );
        return NextResponse.json(response);
      } else if (users) {
        if (!users.length) {
          return NextResponse.json({ error: true, message: "mustHaveAtLeastOneUser" });
        }
        const response = await updateAssignedUsersForTemplate(ability, formID, users);
        if (!response)
          throw new Error(
            `Template API response was null. Request information: method = ${
              req.method
            } ; query = ${JSON.stringify(props.params)} ; body = ${JSON.stringify(props.body)}`
          );
        return NextResponse.json(response);
      } else if (sendResponsesToVault) {
        const response = await removeDeliveryOption(ability, formID);
        if (!response)
          throw new Error(
            `Template API response was null. Request information: method = ${
              req.method
            } ; query = ${JSON.stringify(props.params)} ; body = ${JSON.stringify(props.body)}`
          );
        return NextResponse.json(response);
      }
      throw new MalformedAPIRequest(
        "Missing additional request parameter (formConfig, isPublished, users, sendResponsesToVault)"
      );
    } catch (e) {
      const error = e as Error;

      if (e instanceof AccessControlError) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      } else if (e instanceof TemplateAlreadyPublishedError) {
        return NextResponse.json({ error: "Can't update published form" }, { status: 409 });
      } else if (e instanceof MalformedAPIRequest) {
        return NextResponse.json(
          { error: `Malformed API Request. Reason: ${error.message}.` },
          { status: 400 }
        );
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

export const DELETE = middleware([sessionExists()], async (req, props) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;

    const ability = createAbility(session);
    const formID = props.params?.formID;

    if (!formID || typeof formID !== "string") {
      throw new MalformedAPIRequest("Invalid or missing formID");
    }
    const response = await deleteTemplate(ability, formID);
    if (!response)
      throw new Error(
        `Template API response was null. Request information: method = ${
          req.method
        } ; query = ${JSON.stringify(props.params)} ; body = ${JSON.stringify(props.body)}`
      );
    return NextResponse.json(response);
  } catch (e) {
    const error = e as Error;
    if (e instanceof AccessControlError) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    } else if (e instanceof TemplateHasUnprocessedSubmissions) {
      return NextResponse.json({ error: "Found unprocessed submissions" }, { status: 405 });
    } else if (e instanceof MalformedAPIRequest) {
      return NextResponse.json(
        { error: `Malformed API Request. Reason: ${error.message}.` },
        { status: 400 }
      );
    } else {
      logMessage.error(error);
      return NextResponse.json(
        { error: `Internal server error. Reason: ${error.message}.` },
        { status: 500 }
      );
    }
  }
});
