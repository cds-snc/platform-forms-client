import { MiddlewareReturn } from "@lib/types";
import { type NextRequest, NextResponse } from "next/server";
import { validateTemplateSize } from "@lib/utils/validateTemplateSize";

/**
 * Checks if the template size is within the limits
 * @param methods optional array of authenticated HTTP methods.  If not provided checks only for user session.
 * @returns boolean, true if middleware blocked the request
 */

export const templateSizeValidator = () => {
  return async (req: NextRequest, reqBody: Record<string, unknown>): Promise<MiddlewareReturn> => {
    const formConfig = reqBody.formConfig;
    if (!formConfig) {
      return {
        next: true,
      };
    }

    const isValid = validateTemplateSize(JSON.stringify(formConfig));

    if (!isValid) {
      return {
        next: false,
        response: NextResponse.json({ error: `Template size exceeds the limit` }, { status: 400 }),
      };
    }
    return { next: true };
  };
};
