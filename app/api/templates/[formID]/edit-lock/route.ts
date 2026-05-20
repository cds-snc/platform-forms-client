import { NextRequest, NextResponse } from "next/server";
import { middleware, sessionExists } from "@lib/middleware";
import { WithRequired, MiddlewareProps } from "@lib/types";
import {
  acknowledgeEditLockTakeoverSave,
  EDIT_LOCK_PRE_TAKEOVER_SAVE_WAIT_MS,
  acquireEditLock,
  clearEditLockTakeoverSaveAcknowledgement,
  EditLockPresenceInput,
  EditLockPresenceStatus,
  EditLockVisibilityState,
  getEditLockDisabledStatus,
  getEditLockStatus,
  getTemplateCollaboratorCount,
  heartbeatEditLock,
  requestEditLockTakeoverSave,
  releaseEditLock,
  shouldEnforceTemplateEditLock,
  shouldEnforceTemplateEditLockWithVerifiedUserCount,
  takeoverEditLock,
  TemplateEditLockedError,
  waitForEditLockTakeoverSaveAcknowledgement,
} from "@lib/editLocks";
import { authorization } from "@lib/privileges";

type LockAction = "acquire" | "heartbeat" | "release" | "takeover" | "takeover-save-complete";

const shouldSkipPreTakeoverSave = () => process.env.PLAYWRIGHT_TEST === "true";

const wait = async (timeMs: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, timeMs);
  });

const isPresenceStatus = (value: unknown): value is EditLockPresenceStatus =>
  value === "active" || value === "idle" || value === "away";

const isVisibilityState = (value: unknown): value is EditLockVisibilityState =>
  value === "visible" || value === "hidden";

const parsePresence = (value: unknown): EditLockPresenceInput | undefined => {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const activity = value as {
    lastActivityAt?: string;
    visibilityState?: string;
    presenceStatus?: string;
  };

  const lastActivityAt = activity.lastActivityAt ? new Date(activity.lastActivityAt) : undefined;

  return {
    lastActivityAt:
      lastActivityAt && !Number.isNaN(lastActivityAt.getTime()) ? lastActivityAt : undefined,
    visibilityState: isVisibilityState(activity.visibilityState)
      ? activity.visibilityState
      : undefined,
    presenceStatus: isPresenceStatus(activity.presenceStatus) ? activity.presenceStatus : undefined,
  };
};

export const GET = middleware([sessionExists()], async (req, props) => {
  const { session } = props as WithRequired<MiddlewareProps, "session">;
  const params = props.params instanceof Promise ? await props.params : props.params;
  const formID = params?.formID;
  const requestType = req.nextUrl.searchParams.get("requestType");

  if (!formID || typeof formID !== "string") {
    return NextResponse.json({ error: "Invalid or missing formID" }, { status: 400 });
  }

  const canEditForm = await authorization.canEditForm(formID).catch(() => null);
  if (!canEditForm) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const shouldEnforceEditLock =
    requestType !== "lock-status-poll"
      ? await shouldEnforceTemplateEditLockWithVerifiedUserCount(formID, session.user.id)
      : await shouldEnforceTemplateEditLock(formID, session.user.id);

  if (!shouldEnforceEditLock) {
    return NextResponse.json(getEditLockDisabledStatus());
  }

  const status = await getEditLockStatus(formID, session.user.id);
  const collaboratorCounts =
    requestType !== "lock-status-poll" && (status.locked || status.lockedByOther)
      ? await getTemplateCollaboratorCount(formID)
      : null;

  return NextResponse.json({ ...status, ...(collaboratorCounts ?? {}) });
});

export const POST = middleware([sessionExists()], async (_req: NextRequest, props) => {
  const { session } = props as WithRequired<MiddlewareProps, "session">;
  const params = props.params instanceof Promise ? await props.params : props.params;
  const formID = params?.formID;

  if (!formID || typeof formID !== "string") {
    return NextResponse.json({ error: "Invalid or missing formID" }, { status: 400 });
  }

  const canEditForm = await authorization.canEditForm(formID).catch(() => null);
  if (!canEditForm) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action, sessionId, activity } = props.body as {
    action?: LockAction;
    sessionId?: string;
    activity?: {
      lastActivityAt?: string;
      visibilityState?: string;
      presenceStatus?: string;
    };
  };

  const shouldEnforceEditLock =
    action !== "heartbeat"
      ? await shouldEnforceTemplateEditLockWithVerifiedUserCount(formID, session.user.id)
      : await shouldEnforceTemplateEditLock(formID, session.user.id);

  if (!shouldEnforceEditLock) {
    if (action === "release") {
      return NextResponse.json({ released: false });
    }

    return NextResponse.json(getEditLockDisabledStatus());
  }

  const presence = parsePresence(activity);

  try {
    if (action === "acquire") {
      const status = await acquireEditLock({
        templateId: formID,
        userId: session.user.id,
        userName: session.user.name ?? null,
        userEmail: session.user.email ?? null,
        sessionId: sessionId ?? null,
        presence,
      });
      return NextResponse.json(status);
    }

    if (action === "heartbeat") {
      const status = await heartbeatEditLock({
        templateId: formID,
        userId: session.user.id,
        sessionId: sessionId ?? null,
        presence,
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

    if (action === "takeover-save-complete") {
      const acknowledged = await acknowledgeEditLockTakeoverSave({
        templateId: formID,
        userId: session.user.id,
        sessionId: sessionId ?? null,
      });
      return NextResponse.json({ acknowledged });
    }

    if (action === "takeover") {
      const currentStatus = await getEditLockStatus(formID, session.user.id);

      if (!shouldSkipPreTakeoverSave() && currentStatus.locked && !currentStatus.isOwner) {
        await clearEditLockTakeoverSaveAcknowledgement({
          templateId: formID,
          sessionId: currentStatus.lock?.sessionId ?? null,
        });
        await requestEditLockTakeoverSave(formID);

        if (currentStatus.lock?.sessionId) {
          await waitForEditLockTakeoverSaveAcknowledgement({
            templateId: formID,
            sessionId: currentStatus.lock.sessionId,
            timeoutMs: EDIT_LOCK_PRE_TAKEOVER_SAVE_WAIT_MS,
          });
        } else {
          await wait(EDIT_LOCK_PRE_TAKEOVER_SAVE_WAIT_MS);
        }
      }

      const status = await takeoverEditLock({
        templateId: formID,
        userId: session.user.id,
        userName: session.user.name ?? null,
        userEmail: session.user.email ?? null,
        sessionId: sessionId ?? null,
        presence,
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
