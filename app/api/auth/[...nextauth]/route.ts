import { GET as NextGET, POST as NextPOST } from "@lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { logMessage } from "@root/lib/logger";

// Only allow methods and paths that the application uses for Authjs
const enableAuthCallbackDiagnostics = process.env.AUTH_CALLBACK_DIAGNOSTICS === "true";

const GET = async (req: NextRequest) => {
  if (enableAuthCallbackDiagnostics && req.nextUrl.pathname === "/api/auth/callback/gcForms") {
    const callbackError = req.nextUrl.searchParams.get("error");
    logMessage.info(
      `[auth-callback][GET] hasCode=${req.nextUrl.searchParams.has("code")} hasState=${req.nextUrl.searchParams.has("state")} error=${callbackError ?? "none"}`
    );
  }

  if (
    [
      "/api/auth/error",
      "/api/auth/session",
      "/api/auth/csrf",
      "/api/auth/providers",
      "/api/auth/callback/gcForms",
    ].includes(req.nextUrl.pathname)
  ) {
    return NextGET(req);
  }
  logMessage.error(`Attempted GET URL: ${req.nextUrl.pathname}`);
  return NextResponse.json({ error: "Bad Request" }, { status: 400 });
};

const POST = async (req: NextRequest) => {
  if (
    ["/api/auth/session", "/api/auth/signout", "/api/auth/signin/gcForms"].includes(
      req.nextUrl.pathname
    )
  ) {
    return NextPOST(req);
  }
  logMessage.error(`Attempted POST URL: ${req.nextUrl.pathname}`);
  return NextResponse.json({ error: "Bad Request" }, { status: 400 });
};

export { GET, POST };
