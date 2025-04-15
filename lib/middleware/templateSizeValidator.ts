import { MiddlewareReturn } from "@lib/types";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Checks if the template size is within the limits
 * @param methods optional array of authenticated HTTP methods.  If not provided checks only for user session.
 * @returns boolean, true if middleware blocked the request
 */

export const templateSizeValidator = () => {
  return async (req: NextRequest, reqBody: Record<string, unknown>): Promise<MiddlewareReturn> => {
    const maxPayloadSize = 1;

    // const maxPayloadSize = 5 * 1024 * 1024; // 5 MB
    const formConfig = reqBody.formConfig;

    if (!formConfig) {
      return {
        next: true,
      };
    }

    const formConfigSize = JSON.stringify(formConfig).length;
    if (formConfigSize > maxPayloadSize) {
      return {
        next: false,
        response: NextResponse.json(
          { error: `Template size exceeds the limit of ${maxPayloadSize} bytes` },
          { status: 400 }
        ),
      };
    }
    return { next: true };
  };
};
