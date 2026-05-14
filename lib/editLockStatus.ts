export type EditLockPresenceStatus = "active" | "idle" | "away";
export type EditLockVisibilityState = "visible" | "hidden";

export type EditLockStatusPayload = {
  locked: boolean;
  lockedByOther: boolean;
  isOwner: boolean;
  userCount?: number | null;
  pendingUserCount?: number | null;
  lock: {
    templateId: string;
    lockedByUserId: string;
    lockedByName?: string | null;
    lockedByEmail?: string | null;
    lockedAt: string;
    heartbeatAt: string;
    expiresAt: string;
    lastActivityAt?: string | null;
    visibilityState?: EditLockVisibilityState | null;
    presenceStatus?: EditLockPresenceStatus | null;
    sessionId?: string | null;
  } | null;
};

export const isEditLockStatus = (value: unknown): value is EditLockStatusPayload => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<EditLockStatusPayload>;
  return (
    typeof candidate.locked === "boolean" &&
    typeof candidate.lockedByOther === "boolean" &&
    typeof candidate.isOwner === "boolean" &&
    (candidate.lock === null || typeof candidate.lock === "object")
  );
};
