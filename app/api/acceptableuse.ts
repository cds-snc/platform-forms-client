import { NextResponse } from "next/server";
import { middleware, csrfProtected, sessionExists } from "@lib/middleware";
import { setAcceptableUse } from "@lib/cache/acceptableUseCache";
import { MiddlewareProps, WithRequired } from "@lib/types";

export const POST = middleware([sessionExists(), csrfProtected()], async (req, props) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    await setAcceptableUse(session.user.id);
    return NextResponse.json({});
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
