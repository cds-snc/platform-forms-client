import { NextResponse } from "next/server";
import { checkAll } from "@lib/cache/flags";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, sessionExists } from "@lib/middleware";

// Needed because NextJS attempts to cache the response of this route
export const dynamic = "force-dynamic";

export const GET = middleware([sessionExists()], async (_, props) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    const ability = createAbility(session);
    const flags = await checkAll(ability);
    return NextResponse.json(flags);
  } catch (e) {
    if (e instanceof AccessControlError)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
