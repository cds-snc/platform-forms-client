import { GET, POST } from "@lib/auth";
// import { NextRequest, NextResponse } from "next/server";

// Only allow methods and paths that the application uses for Authjs

// const GET = async (req: NextRequest) => {
//   if (["/api/auth/session", "/api/auth/csrf"].includes(req.nextUrl.pathname)) {
//     return NextGET(req);
//   }
//   return NextResponse.json({ error: "Bad Request" }, { status: 400 });
// };

// const POST = async (req: NextRequest) => {
//   if (["/api/auth/session", "/api/auth/signout"].includes(req.nextUrl.pathname)) {
//     return NextPOST(req);
//   }
//   return NextResponse.json({ error: "Bad Request" }, { status: 400 });
// };

export { GET, POST };
