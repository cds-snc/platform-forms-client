import { NextResponse } from "next/server";
import { middleware, sessionExists } from "@lib/middleware";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { authorization } from "@lib/privileges";
import { getEditLockDebugSnapshot } from "@lib/editLockDebug";

export const dynamic = "force-dynamic";

export const GET = middleware([sessionExists()], async (_req, props) => {
  const { session } = props as WithRequired<MiddlewareProps, "session">;
  const params = props.params instanceof Promise ? await props.params : props.params;
  const formID = params?.formID;

  if (!formID || typeof formID !== "string") {
    return NextResponse.json({ error: "Invalid or missing formID" }, { status: 400 });
  }

  const hasAdminAccess = await authorization.hasAdministrationPrivileges().catch(() => null);
  if (!hasAdminAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const snapshot = await getEditLockDebugSnapshot(formID, session.user.id);

  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
});
