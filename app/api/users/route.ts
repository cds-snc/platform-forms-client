import { NextResponse } from "next/server";
import { middleware, sessionExists } from "@lib/middleware";
import { getUsers, updateActiveStatus } from "@lib/users";
import { MiddlewareProps, WithRequired, UserAbility } from "@lib/types";

import { createAbility, updatePrivilegesForUser, AccessControlError } from "@lib/privileges";

export const GET = middleware([sessionExists()], async (req, props) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;

    const ability = createAbility(session);

    const users = await getUsers(ability);
    if (users.length === 0) {
      return NextResponse.json({ error: "Could not process request" }, { status: 500 });
    } else {
      return NextResponse.json([...users]);
    }
  } catch (error) {
    if (error instanceof AccessControlError)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Could not process request" }, { status: 500 });
  }
});

export const PUT = middleware([sessionExists()], async (req, props) => {
  try {
    const { session } = props as WithRequired<MiddlewareProps, "session">;

    const ability = createAbility(session);

    const reqBody = await req.json();

    // Update active Status

    if ("active" in reqBody) {
      const { userID, active } = reqBody;
      if (typeof userID === "undefined" || typeof active === "undefined") {
        return NextResponse.json({ error: "Malformed Request" }, { status: 400 });
      }

      const result = await updateActiveStatus(ability, userID, active);
      if (result) {
        return NextResponse.json("Success", { status: 200 });
      }
    }

    // Update Privileges
    const { userID, privileges } = reqBody;
    if (
      typeof userID === "undefined" ||
      typeof privileges === "undefined" ||
      !Array.isArray(privileges)
    ) {
      return NextResponse.json({ error: "Malformed Request" }, { status: 400 });
    }

    const result = await updatePrivilegesForUser(ability, userID, privileges);

    if (result) {
      return NextResponse.json("Success", { status: 200 });
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  } catch (error) {
    if (error instanceof AccessControlError)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Could not process request" }, { status: 500 });
  }
});
