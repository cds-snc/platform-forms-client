import {
  deleteTemplate,
  updateTemplate,
  updateIsPublishedForTemplate,
  updateAssignedUsersForTemplate,
  TemplateAlreadyPublishedError,
  getFullTemplateByID,
  removeDeliveryOption,
  TemplateHasUnprocessedSubmissions,
  getPublicTemplateByID,
} from "@lib/templates";
import { NextRequest } from "next/server";
import { middleware, jsonValidator, sessionExists } from "@lib/middleware";
import templatesSchema from "@lib/middleware/schemas/templates.schema.json";
import { NextResponse } from "next/server";
import {
  layoutIDValidator,
  subElementsIDValidator,
  uniqueIDValidator,
} from "@lib/middleware/jsonIDValidator";
import { FormProperties, DeliveryOption, SecurityAttribute } from "@lib/types";
import { AccessControlError } from "@lib/auth/errors";
import { logMessage } from "@lib/logger";
import { authCheckAndThrow } from "@lib/actions";

class MalformedAPIRequest extends Error {
  constructor(message?: string) {
    super(message ?? "MalformedAPIRequest");
    Object.setPrototypeOf(this, MalformedAPIRequest.prototype);
  }
}

const runValidationCondition = async (body: Record<string, unknown>) => {
  return body.formConfig !== undefined;
};

export const GET = async (req: NextRequest, props: { params: Promise<Record<string, string>> }) => {
  const params = await props.params;
  try {
    const formID = params?.formID;

    if (!formID || typeof formID !== "string") {
      throw new MalformedAPIRequest("Invalid or missing formID");
    }

    const { session } = await authCheckAndThrow().catch(() => ({
      session: null,
    }));

    if (!session) {
      const response = await getPublicTemplateByID(formID);
      if (response === null) {
        throw new Error(
          `Template API response was null. Request information: method = ${
            req.method
          } ; query = ${JSON.stringify(params)}`
        );
      }
      if (!response.isPublished) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.json(response);
    }

    const response = await getFullTemplateByID(formID);
    if (response === null) {
      throw new Error(
        `Template API response was null. Request information: method = ${
          req.method
        } ; query = ${JSON.stringify(params)}`
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
};

interface PutApiProps {
  name?: string;
  formConfig?: FormProperties;
  deliveryOption?: DeliveryOption;
  securityAttribute?: SecurityAttribute;
  isPublished?: boolean;
  users?: { id: string; action: "add" | "remove" }[];
  sendResponsesToVault?: boolean;
  publishFormType?: string;
  publishDescription?: string;
  publishReason?: string;
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
      const {
        formConfig,
        name,
        deliveryOption,
        securityAttribute,
        isPublished,
        users,
        sendResponsesToVault,
        publishFormType,
        publishDescription,
        publishReason,
      }: PutApiProps = props.body;

      const formID = props.params?.formID;

      if (!formID || typeof formID !== "string") {
        throw new MalformedAPIRequest("Invalid or missing formID");
      }

      let response;

      if (formConfig) {
        response = await updateTemplate({
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
        const response = await updateIsPublishedForTemplate(
          formID,
          isPublished,
          publishReason || "",
          publishFormType || "",
          publishDescription || ""
        );
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
        const response = await updateAssignedUsersForTemplate(formID, users);
        if (!response)
          throw new Error(
            `Template API response was null. Request information: method = ${
              req.method
            } ; query = ${JSON.stringify(props.params)} ; body = ${JSON.stringify(props.body)}`
          );
        return NextResponse.json(response);
      } else if (sendResponsesToVault) {
        const response = await removeDeliveryOption(formID);
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
    const formID = props.params?.formID;

    if (!formID || typeof formID !== "string") {
      throw new MalformedAPIRequest("Invalid or missing formID");
    }
    const response = await deleteTemplate(formID);
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
