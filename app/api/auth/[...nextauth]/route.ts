import { GET as NextGET, POST as NextPOST } from "@lib/auth";
import { NextRequest } from "next/server";

// Only allow methods and paths that the application uses for Authjs

const GET = async (req: NextRequest) => {
  // if (
  //   ["/api/auth/session", "/api/auth/csrf", "api/auth/providers"].includes(req.nextUrl.pathname)
  // ) {
  //   return NextGET(req);
  // }
  // return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  return NextGET(req);
};

const POST = async (req: NextRequest) => {
  // if (["/api/auth/session", "/api/auth/signout"].includes(req.nextUrl.pathname)) {
  //   return NextPOST(req);
  // }
  // return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  return NextPOST(req);
};

export { GET, POST };
