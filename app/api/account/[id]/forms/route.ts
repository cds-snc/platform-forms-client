import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, sessionExists } from "@lib/middleware";
import { NextResponse } from "next/server";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { getUser } from "@lib/users";
import { getAllTemplatesForUser } from "@lib/templates";

// Needed because NextJS attempts to cache the response of this route
export const dynamic = "force-dynamic";

export const GET = middleware([sessionExists()], async (_, props) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    const ability = createAbility(session);

    const accountId = props.params?.id;

    if (Array.isArray(accountId) || !accountId) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const user = await getUser(ability, accountId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const templates = await getAllTemplatesForUser(ability, accountId, true);

    return NextResponse.json(templates);
  } catch (err) {
    if (err instanceof AccessControlError)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    else
      return NextResponse.json(
        { error: "There was an error. Please try again later." },
        { status: 500 }
      );
  }
});
