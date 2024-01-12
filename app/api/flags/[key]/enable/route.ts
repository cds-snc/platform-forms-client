import { NextResponse } from "next/server";
import { enableFlag, checkAll } from "@lib/cache/flags";
import { middleware, sessionExists } from "@lib/middleware";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { AccessControlError, createAbility } from "@lib/privileges";

// Needed because NextJS attempts to cache the response of this route
export const dynamic = "force-dynamic";

export const GET = middleware([sessionExists()], async (req, props) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    const key = props.context?.params?.key;

    if (Array.isArray(key) || !key) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
    const ability = createAbility(session);
    await enableFlag(ability, key);
    const flags = await checkAll(ability);
    return NextResponse.json(flags);
  } catch (e) {
    if (e instanceof AccessControlError)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
