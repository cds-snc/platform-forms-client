import { logMessage } from "@lib/logger";
import { type NextRequest, NextResponse } from "next/server";
import { MiddlewareProps, MiddlewareRequest } from "@lib/types";

/**
 * Middleware function that iterates through middleware resolvers
 * @param middlewareArray Array of middleware resolvers
 * @param handler Api handler function
 * @returns
 */
export const middleware = (
  middlewareArray: Array<MiddlewareRequest>,
  handler: (req: NextRequest, props: MiddlewareProps) => Promise<NextResponse>
) => {
  return async (
    req: NextRequest,
    context: { params: Record<string, string | string[]> }
  ): Promise<NextResponse> => {
    try {
      let props = {};
      const reqBody = (await req.json().catch(() => ({}))) as Record<string, unknown>;

      for (const middlewareLayer of middlewareArray) {
        const {
          next: pass,
          props: middlewareProps,
          response: layerResponse,
          // Middleware is run sequentially
          // eslint-disable-next-line no-await-in-loop
        } = await middlewareLayer(req, reqBody);
        if (!pass) {
          if (layerResponse) {
            return layerResponse;
          } else {
            return NextResponse.json({ error: "Middleware Error" }, { status: 401 });
          }
        }

        props = { ...props, ...middlewareProps };
      }
      return handler(req, { ...props, body: reqBody, context });
    } catch (e) {
      logMessage.error(e as Error);
      return NextResponse.json({ error: "Server Middleware Error" }, { status: 500 });
    }
  };
};
