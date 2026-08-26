import { getPublicTemplateByID } from "@lib/templates/queries/getPublicTemplateByID";
import { getFullTemplateByID } from "@lib/templates/queries/getFullTemplateByID";
import { NextRequest, NextResponse } from "next/server";
import { AccessControlError } from "@lib/auth/errors";
import { logMessage } from "@lib/logger";
import { authCheckAndThrow } from "@lib/actions";

class MalformedAPIRequest extends Error {
  constructor(message?: string) {
    super(message ?? "MalformedAPIRequest");
    Object.setPrototypeOf(this, MalformedAPIRequest.prototype);
  }
}

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
