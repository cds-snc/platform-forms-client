import { AccessControlError, createAbility } from "@lib/privileges";
import { middleware, sessionExists } from "@lib/middleware";
import { NextResponse } from "next/server";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { getUnprocessedSubmissionsForUser } from "@lib/users";

export const GET = middleware([sessionExists()], async (req, props) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;
    const ability = createAbility(session);

    // Get user
    const user = session.user;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const overdue = await getUnprocessedSubmissionsForUser(ability, user.id);

    let hasOverdueSubmissions = false;

    Object.entries(overdue).forEach(([, value]) => {
      if (value.level > 2) {
        hasOverdueSubmissions = true;
        return;
      }
    });

    return NextResponse.json({ hasOverdueSubmissions });
  } catch (err) {
    if (err instanceof AccessControlError)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(
    { error: "There was an error. Please try again later." },
    { status: 500 }
  );
});
