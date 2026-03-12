import { NextRequest, NextResponse } from "next/server";
import { middleware, sessionExists } from "@lib/middleware";
import { WithRequired, MiddlewareProps } from "@lib/types";
import {
  acquireEditLock,
  getEditLockStatus,
  heartbeatEditLock,
  releaseEditLock,
  takeoverEditLock,
  TemplateEditLockedError,
} from "@lib/editLocks";
import { authorization } from "@lib/privileges";

type LockAction = "acquire" | "heartbeat" | "release" | "takeover";

export const GET = middleware([sessionExists()], async (_req, props) => {
  const { session } = props as WithRequired<MiddlewareProps, "session">;
  const params = props.params instanceof Promise ? await props.params : props.params;
  const formID = params?.formID;

  if (!formID || typeof formID !== "string") {
    return NextResponse.json({ error: "Invalid or missing formID" }, { status: 400 });
  }

  const status = await getEditLockStatus(formID, session.user.id);
  return NextResponse.json(status);
});

export const POST = middleware([sessionExists()], async (_req: NextRequest, props) => {
  const { session } = props as WithRequired<MiddlewareProps, "session">;
  const params = props.params instanceof Promise ? await props.params : props.params;
  const formID = params?.formID;

  if (!formID || typeof formID !== "string") {
    return NextResponse.json({ error: "Invalid or missing formID" }, { status: 400 });
  }

  const { action, sessionId } = props.body as { action?: LockAction; sessionId?: string };

  try {
    if (action === "acquire") {
      const status = await acquireEditLock({
        templateId: formID,
        userId: session.user.id,
        userName: session.user.name ?? null,
        userEmail: session.user.email ?? null,
        sessionId: sessionId ?? null,
      });
      return NextResponse.json(status);
    }

    if (action === "heartbeat") {
      const status = await heartbeatEditLock({
        templateId: formID,
        userId: session.user.id,
        sessionId: sessionId ?? null,
      });
      return NextResponse.json(status);
    }

    if (action === "release") {
      const result = await releaseEditLock({
        templateId: formID,
        userId: session.user.id,
        sessionId: sessionId ?? null,
      });
      return NextResponse.json(result);
    }

    if (action === "takeover") {
      const canTakeover = await authorization.canManageAllForms().catch(() => null);
      if (!canTakeover) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const status = await takeoverEditLock({
        templateId: formID,
        userId: session.user.id,
        userName: session.user.name ?? null,
        userEmail: session.user.email ?? null,
        sessionId: sessionId ?? null,
      });
      return NextResponse.json(status);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    if (e instanceof TemplateEditLockedError) {
      return NextResponse.json({ error: "editLocked", lock: e.lock }, { status: 423 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
