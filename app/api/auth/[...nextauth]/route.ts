import { GET as NextGET, POST as NextPOST } from "@lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { logMessage } from "@root/lib/logger";

// Only allow methods and paths that the application uses for Authjs

const GET = async (req: NextRequest) => {
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
