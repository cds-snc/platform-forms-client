import { NextResponse } from "next/server";
import { disableFlag, checkAll } from "@lib/cache/flags";
import { middleware, sessionExists } from "@lib/middleware";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { AccessControlError, createAbility } from "@lib/privileges";

export const GET = middleware([sessionExists()], async (req, props) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    const key = props.context?.params?.key;

    if (Array.isArray(key) || !key) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
    if (Array.isArray(key) || !key)
      return NextResponse.json(
        { error: "Malformed API Request Flag Key is not defined" },
        { status: 400 }
      );
    const ability = createAbility(session);

    await disableFlag(ability, key);
    const flags = await checkAll(ability);
    return NextResponse.json(flags);
  } catch (e) {
    if (e instanceof AccessControlError)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
