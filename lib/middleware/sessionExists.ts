import { NextResponse } from "next/server";

import { MiddlewareReturn } from "@lib/types";
import { authCheck } from "@lib/actions";

/**
 * Checks if the session is authenticated for requested HTTP method
 * @param methods optional array of authenticated HTTP methods.  If not provided checks only for user session.
 * @returns boolean, true if middleware blocked the request
 */

export const sessionExists = () => {
  return async (): Promise<MiddlewareReturn> => {
    const { session } = await authCheck();

    // If user is not authenticated or has a deactivated account, return 401
    if (!session || session.user.deactivated) {
      return {
        next: false,
        response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }

    return { next: true, props: { session } };
  };
};
