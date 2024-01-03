import { NextResponse } from "next/server";

import { MiddlewareReturn } from "@lib/types";
import { getAppSession } from "@api/auth/authConfig";

/**
 * Checks if the session is authenticated for requested HTTP method
 * @param methods optional array of authenticated HTTP methods.  If not provided checks only for user session.
 * @returns boolean, true if middleware blocked the request
 */

export const sessionExists = () => {
  return async (): Promise<MiddlewareReturn> => {
    // The below work around is needed until we can upgrade to Next-Auth v5
    // Once upgraded we can pass the request object to getServerSession to
    // ensure that cookies are updated on the response object.

    const session = await getAppSession();

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
