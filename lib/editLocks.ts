import { prisma } from "@gcforms/database";
import { getRedisInstance } from "@lib/integration/redisConnector";
import { allowLockedEditing } from "@lib/utils/form-builder/allowLockedEditing";
import { logMessage } from "@lib/logger";
import { formCache } from "./cache/formCache";
import {
  EDIT_LOCK_PRE_TAKEOVER_SAVE_WAIT_MS,
  EDIT_LOCK_TTL_MS,
  MIN_ASSIGNED_USERS_FOR_EDIT_LOCK,
} from "@root/constants";
export {
  EDIT_LOCK_HEARTBEAT_INTERVAL_MS,
  EDIT_LOCK_STATUS_POLL_INTERVAL_MS,
  EDIT_LOCK_PRE_TAKEOVER_SAVE_WAIT_MS,
  EDIT_LOCK_TTL_MS,
  MIN_ASSIGNED_USERS_FOR_EDIT_LOCK,
} from "@root/constants";

const EDIT_LOCK_KEY_PREFIX = "edit-lock";
const EDIT_LOCK_STREAM_PREFIX = "edit-lock-stream";
const EDIT_LOCK_TAKEOVER_SAVE_ACK_PREFIX = "edit-lock-takeover-save";
const EDIT_LOCK_ASSIGNED_USERS_CACHE_PREFIX = "edit-lock-assigned-users-threshold";
const EDIT_LOCK_ASSIGNED_USERS_COUNT_CACHE_PREFIX = "edit-lock-assigned-users-count";
const EDIT_LOCK_ASSIGNED_PENDING_USERS_COUNT_CACHE_PREFIX =
  "edit-lock-assigned-pending-users-count";
const EDIT_LOCK_TAKEOVER_SAVE_ACK_POLL_MS = 100;
const EDIT_LOCK_ASSIGNED_USERS_CACHE_TTL_SECONDS = 300;

export type EditLockPresenceStatus = "active" | "idle" | "away";
export type EditLockVisibilityState = "visible" | "hidden";

export type EditLockPresenceInput = {
  lastActivityAt?: Date | null;
  visibilityState?: EditLockVisibilityState | null;
  presenceStatus?: EditLockPresenceStatus | null;
};

export type EditLockInfo = {
  templateId: string;
  lockedByUserId: string;
  lockedByName?: string | null;
  lockedByEmail?: string | null;
  lockedAt: Date;
  heartbeatAt: Date;
  expiresAt: Date;
  lastActivityAt?: Date | null;
  visibilityState?: EditLockVisibilityState | null;
  presenceStatus?: EditLockPresenceStatus | null;
  sessionId?: string | null;
};

export type EditLockStatus = {
  locked: boolean;
  lockedByOther: boolean;
  isOwner: boolean;
  lock: EditLockInfo | null;
};

export type EditLockEvent = {
  type: "updated" | "takeover-requested" | "published";
};

export class TemplateEditLockedError extends Error {
  lock: EditLockInfo | null;
  constructor(message: string, lock: EditLockInfo | null) {
    super(message);
    this.lock = lock;
    Object.setPrototypeOf(this, TemplateEditLockedError.prototype);
  }
}

type EditLockStore = Map<string, EditLockInfo>;
type StoredEditLockInfo = Omit<
  EditLockInfo,
  "lockedAt" | "heartbeatAt" | "expiresAt" | "lastActivityAt"
> & {
  lockedAt: string;
  heartbeatAt: string;
  expiresAt: string;
  lastActivityAt?: string | null;
};

type EditLockGlobal = typeof globalThis & {
  __editLockStore?: EditLockStore;
  __editLockTakeoverSaveAcks?: Map<string, number>;
};

const getEditLockStore = (): EditLockStore => {
  const globalWithStore = globalThis as EditLockGlobal;
  if (!globalWithStore.__editLockStore) {
    globalWithStore.__editLockStore = new Map();
  }
  return globalWithStore.__editLockStore;
};

const getEditLockTakeoverSaveAcks = (): Map<string, number> => {
  const globalWithStore = globalThis as EditLockGlobal;
  if (!globalWithStore.__editLockTakeoverSaveAcks) {
    globalWithStore.__editLockTakeoverSaveAcks = new Map();
  }
  return globalWithStore.__editLockTakeoverSaveAcks;
};

const redisEnabled = () => Boolean(process.env.REDIS_URL);

const getEditLockKey = (templateId: string) => `${EDIT_LOCK_KEY_PREFIX}:${templateId}`;
const getEditLockStreamKey = (templateId: string) => `${EDIT_LOCK_STREAM_PREFIX}:${templateId}`;
const getEditLockTakeoverSaveAckKey = (templateId: string, sessionId: string) =>
  `${EDIT_LOCK_TAKEOVER_SAVE_ACK_PREFIX}:${templateId}:${sessionId}`;
const getEditLockAssignedUsersCacheKey = (templateId: string) =>
  `${EDIT_LOCK_ASSIGNED_USERS_CACHE_PREFIX}:${templateId}`;
export const getEditLockAssignedUsersCountCacheKey = (templateId: string) =>
  `${EDIT_LOCK_ASSIGNED_USERS_COUNT_CACHE_PREFIX}:${templateId}`;
export const getEditLockAssignedPendingUsersCountCacheKey = (templateId: string) =>
  `${EDIT_LOCK_ASSIGNED_PENDING_USERS_COUNT_CACHE_PREFIX}:${templateId}`;
const editLockTtlSeconds = Math.ceil(EDIT_LOCK_TTL_MS / 1000);
const updatedEvent: EditLockEvent = { type: "updated" };
const wait = async (timeMs: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, timeMs);
  });

const describeLockActor = (lock: Pick<EditLockInfo, "lockedByUserId" | "lockedByEmail"> | null) => {
  if (!lock) {
    return "none";
  }

  return [`userId=${lock.lockedByUserId}`, `email=${lock.lockedByEmail ?? "unknown"}`].join(" ");
};

const describeActionActor = ({
  userId,
  userEmail,
}: {
  userId: string;
  userEmail?: string | null;
}) => [`userId=${userId}`, `email=${userEmail ?? "unknown"}`].join(" ");

const logEditLockAction = ({
  action,
  templateId,
  actor,
  owner,
  result,
}: {
  action: "acquire" | "takeover" | "release";
  templateId: string;
  actor: string;
  owner?: Pick<EditLockInfo, "lockedByUserId" | "lockedByEmail"> | null;
  result: string;
}) => {
  const parts = [
    "edit-lock",
    `action=${action}`,
    `templateId=${templateId}`,
    `actor={${actor}}`,
    `owner={${describeLockActor(owner ?? null)}}`,
    `result=${result}`,
  ];

  logMessage.info(parts.join(" "));
};

const toStoredEditLockInfo = (lock: EditLockInfo): StoredEditLockInfo => ({
  ...lock,
  lockedAt: lock.lockedAt.toISOString(),
  heartbeatAt: lock.heartbeatAt.toISOString(),
  expiresAt: lock.expiresAt.toISOString(),
  lastActivityAt: lock.lastActivityAt?.toISOString() ?? null,
  lockedByName: lock.lockedByName ?? null,
  lockedByEmail: lock.lockedByEmail ?? null,
  visibilityState: lock.visibilityState ?? null,
  presenceStatus: lock.presenceStatus ?? null,
  sessionId: lock.sessionId ?? null,
});

const fromStoredEditLockInfo = (raw: string | null): EditLockInfo | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredEditLockInfo;
    return {
      ...parsed,
      lockedByName: parsed.lockedByName ?? null,
      lockedByEmail: parsed.lockedByEmail ?? null,
      visibilityState: parsed.visibilityState ?? null,
      presenceStatus: parsed.presenceStatus ?? null,
      sessionId: parsed.sessionId ?? null,
      lockedAt: new Date(parsed.lockedAt),
      heartbeatAt: new Date(parsed.heartbeatAt),
      expiresAt: new Date(parsed.expiresAt),
      lastActivityAt: parsed.lastActivityAt ? new Date(parsed.lastActivityAt) : null,
    };
  } catch {
    return null;
  }
};

const buildStatus = (lock: EditLockInfo | null, userId?: string): EditLockStatus => {
  if (!lock) {
    return { locked: false, lockedByOther: false, isOwner: false, lock: null };
  }

  const normalized = toEditLockInfo(lock);
  const isOwner = !!userId && normalized.lockedByUserId === userId;

  return {
    locked: true,
    lockedByOther: !isOwner,
    isOwner,
    lock: normalized,
  };
};

const readMemoryLock = (templateId: string) => {
  const now = new Date();
  const store = getEditLockStore();
  const lock = store.get(templateId);

  if (!lock) {
    return null;
  }

  const normalized = toEditLockInfo(lock);
  if (isExpired(normalized, now)) {
    store.delete(templateId);
    return null;
  }

  return normalized;
};

const readRedisLock = async (templateId: string) => {
  const redis = await getRedisInstance();
  const lock = fromStoredEditLockInfo(await redis.get(getEditLockKey(templateId)));

  if (!lock) {
    return null;
  }

  if (isExpired(lock, new Date())) {
    await redis.del(getEditLockKey(templateId));
    return null;
  }

  return toEditLockInfo(lock);
};

const publishEditLockEvent = async (templateId: string, event: EditLockEvent = updatedEvent) => {
  if (!redisEnabled()) {
    return;
  }

  const redis = await getRedisInstance();
  const streamKey = getEditLockStreamKey(templateId);
  // Append the event to the per-template stream.  The stream TTL is reset on
  // every write so it stays alive as long as the lock itself is active.
  // Note: XADD API params: key, MAXLEN ~ count (cap stream to ~100 entries lazily), * (auto-generate entry ID), ...field-value pairs
  await redis.xadd(
    streamKey,
    "MAXLEN",
    "~",
    100,
    "*",
    "type",
    event.type,
    "templateId",
    templateId
  );
  await redis.expire(streamKey, editLockTtlSeconds * 2);
};

export const publishEditLockPublishedEvent = async (templateId: string) => {
  await publishEditLockEvent(templateId, { type: "published" });
};

const storeRedisLock = async (lock: EditLockInfo) => {
  const redis = await getRedisInstance();
  await redis.set(
    getEditLockKey(lock.templateId),
    JSON.stringify(toStoredEditLockInfo(lock)),
    "EX",
    editLockTtlSeconds
  );
};

const withRedisWatch = async <T>(
  templateId: string,
  operation: (
    current: EditLockInfo | null,
    redis: Awaited<ReturnType<typeof getRedisInstance>>
  ) => Promise<T | null>
): Promise<T> => {
  const key = getEditLockKey(templateId);
  const redis = await getRedisInstance();

  const execute = async (attempt: number): Promise<T> => {
    await redis.watch(key);
    const current = fromStoredEditLockInfo(await redis.get(key));
    const result = await operation(current ? toEditLockInfo(current) : null, redis);
    if (result !== null) {
      await redis.unwatch();
      return result;
    }

    await redis.unwatch();

    if (attempt >= 2) {
      throw new Error(`Failed to update edit lock for ${templateId}`);
    }

    return execute(attempt + 1);
  };

  return execute(0);
};

export const requestEditLockTakeoverSave = async (templateId: string) => {
  await publishEditLockEvent(templateId, { type: "takeover-requested" });
};

export const clearEditLockTakeoverSaveAcknowledgement = async ({
  templateId,
  sessionId,
}: {
  templateId: string;
  sessionId?: string | null;
}) => {
  if (!sessionId) {
    return;
  }

  const key = getEditLockTakeoverSaveAckKey(templateId, sessionId);

  if (redisEnabled()) {
    const redis = await getRedisInstance();
    await redis.del(key);
    return;
  }

  getEditLockTakeoverSaveAcks().delete(key);
};

export const acknowledgeEditLockTakeoverSave = async ({
  templateId,
  userId,
  sessionId,
}: {
  templateId: string;
  userId: string;
  sessionId?: string | null;
}) => {
  if (!sessionId) {
    return false;
  }

  const currentLock = redisEnabled() ? await readRedisLock(templateId) : readMemoryLock(templateId);
  if (
    !currentLock ||
    currentLock.lockedByUserId !== userId ||
    currentLock.sessionId !== sessionId
  ) {
    return false;
  }

  const key = getEditLockTakeoverSaveAckKey(templateId, sessionId);

  if (redisEnabled()) {
    const redis = await getRedisInstance();
    await redis.set(key, "1", "PX", EDIT_LOCK_PRE_TAKEOVER_SAVE_WAIT_MS);
    return true;
  }

  getEditLockTakeoverSaveAcks().set(key, Date.now() + EDIT_LOCK_PRE_TAKEOVER_SAVE_WAIT_MS);
  return true;
};

const hasEditLockTakeoverSaveAcknowledgement = async ({
  templateId,
  sessionId,
}: {
  templateId: string;
  sessionId?: string | null;
}) => {
  if (!sessionId) {
    return false;
  }

  const key = getEditLockTakeoverSaveAckKey(templateId, sessionId);

  if (redisEnabled()) {
    const redis = await getRedisInstance();
    return (await redis.get(key)) === "1";
  }

  const expiresAt = getEditLockTakeoverSaveAcks().get(key);
  if (!expiresAt) {
    return false;
  }

  if (expiresAt <= Date.now()) {
    getEditLockTakeoverSaveAcks().delete(key);
    return false;
  }

  return true;
};

export const waitForEditLockTakeoverSaveAcknowledgement = async ({
  templateId,
  sessionId,
  timeoutMs,
}: {
  templateId: string;
  sessionId?: string | null;
  timeoutMs: number;
}) => {
  if (!sessionId) {
    return false;
  }

  const deadline = Date.now() + timeoutMs;

  const poll = async (): Promise<boolean> => {
    if (await hasEditLockTakeoverSaveAcknowledgement({ templateId, sessionId })) {
      await clearEditLockTakeoverSaveAcknowledgement({ templateId, sessionId });
      return true;
    }

    if (Date.now() >= deadline) {
      await clearEditLockTakeoverSaveAcknowledgement({ templateId, sessionId });
      return false;
    }

    await wait(EDIT_LOCK_TAKEOVER_SAVE_ACK_POLL_MS);
    return poll();
  };

  return poll();
};

const isExpired = (lock: EditLockInfo, now: Date) => lock.expiresAt.getTime() <= now.getTime();

const toEditLockInfo = (lock: EditLockInfo): Required<EditLockInfo> => ({
  ...lock,
  lockedByName: lock.lockedByName ?? null,
  lockedByEmail: lock.lockedByEmail ?? null,
  lastActivityAt: lock.lastActivityAt ?? null,
  visibilityState: lock.visibilityState ?? null,
  presenceStatus: lock.presenceStatus ?? null,
  sessionId: lock.sessionId ?? null,
});

const getPresenceSnapshot = (
  presence: EditLockPresenceInput | undefined
): Required<EditLockPresenceInput> => ({
  lastActivityAt: presence?.lastActivityAt ?? null,
  visibilityState: presence?.visibilityState ?? null,
  presenceStatus: presence?.presenceStatus ?? null,
});

export const getEditLockDisabledStatus = (): EditLockStatus => ({
  locked: false,
  lockedByOther: false,
  isOwner: true,
  lock: null,
});

export const shouldEnableTemplateEditLock = ({
  allowLockedEditing,
  templateId,
  isPublished,
  assignedUserCount,
}: {
  allowLockedEditing: boolean;
  templateId: string | null | undefined;
  isPublished: boolean;
  assignedUserCount: number;
}): boolean =>
  Boolean(
    allowLockedEditing &&
    templateId &&
    templateId !== "0000" &&
    !isPublished &&
    assignedUserCount >= MIN_ASSIGNED_USERS_FOR_EDIT_LOCK
  );

export const invalidateTemplateEditLockUserCountCache = async (
  templateId: string
): Promise<void> => {
  if (process.env.APP_ENV === "test" || !redisEnabled()) {
    return;
  }
  const redis = await getRedisInstance();
  await Promise.all([
    redis.del(getEditLockAssignedUsersCacheKey(templateId)),
    redis.del(getEditLockAssignedUsersCountCacheKey(templateId)),
    redis.del(getEditLockAssignedPendingUsersCountCacheKey(templateId)),
  ]);
};

/**
 * Fetches edit lock data and updates the Redis cache.
 */
const fetchAndCacheUserData = async (
  templateId: string,
  useRedisCache: boolean
): Promise<{
  isPublished: boolean;
  userCount: number;
  pendingUserCount: number;
  hasEnoughUsers: boolean;
} | null> => {
  const template = await prisma.template
    .findUnique({
      where: { id: templateId },
      select: {
        isPublished: true,
        _count: {
          select: {
            users: true,
            invitations: { where: { expires: { gt: new Date() } } },
          },
        },
      },
    })
    .catch(() => null);

  if (!template) {
    return null;
  }

  const userCount = template._count.users;
  const pendingUserCount = template._count.invitations;
  const hasEnoughUsers =
    template._count.users + template._count.invitations >= MIN_ASSIGNED_USERS_FOR_EDIT_LOCK;

  if (useRedisCache) {
    const redis = await getRedisInstance();
    await Promise.all([
      redis.setex(
        getEditLockAssignedUsersCacheKey(templateId),
        EDIT_LOCK_ASSIGNED_USERS_CACHE_TTL_SECONDS,
        hasEnoughUsers ? "1" : "0"
      ),
      redis.setex(
        getEditLockAssignedUsersCountCacheKey(templateId),
        EDIT_LOCK_ASSIGNED_USERS_CACHE_TTL_SECONDS,
        String(userCount)
      ),
      redis.setex(
        getEditLockAssignedPendingUsersCountCacheKey(templateId),
        EDIT_LOCK_ASSIGNED_USERS_CACHE_TTL_SECONDS,
        String(pendingUserCount)
      ),
    ]);
  }

  return { isPublished: template.isPublished, userCount, pendingUserCount, hasEnoughUsers };
};

/**
 * Get the users and pending users count on this template. The Redis cache is used when
 * available and falls back to a DB query when not, which also populates the cache for
 * future calls.
 */
export const getTemplateCollaboratorCount = async (
  templateId: string
): Promise<{ userCount: number | null; pendingUserCount: number | null }> => {
  const useRedisCache = process.env.APP_ENV !== "test" && redisEnabled();
  if (useRedisCache) {
    const redis = await getRedisInstance();
    const userCountCacheKey = getEditLockAssignedUsersCountCacheKey(templateId);
    const pendingUserCountCacheKey = getEditLockAssignedPendingUsersCountCacheKey(templateId);
    const cachedUserCount = await redis.get(userCountCacheKey);
    const cachedPendingUserCount = await redis.get(pendingUserCountCacheKey);
    if (cachedUserCount !== null && cachedPendingUserCount !== null) {
      const parsedUserCount = Number(cachedUserCount);
      const parsedPendingUserCount = Number(cachedPendingUserCount);
      if (
        Number.isSafeInteger(parsedUserCount) &&
        parsedUserCount >= 0 &&
        Number.isSafeInteger(parsedPendingUserCount) &&
        parsedPendingUserCount >= 0
      ) {
        return { userCount: parsedUserCount, pendingUserCount: parsedPendingUserCount };
      }

      await Promise.all([redis.del(userCountCacheKey), redis.del(pendingUserCountCacheKey)]);
    }
  }

  const data = await fetchAndCacheUserData(templateId, useRedisCache);
  return { userCount: data?.userCount ?? null, pendingUserCount: data?.pendingUserCount ?? null };
};

const shouldEnforceTemplateEditLockInternal = async (
  templateId: string,
  {
    userId,
    revalidateAssignedUserCount = false,
  }: {
    userId?: string;
    revalidateAssignedUserCount?: boolean;
  } = {}
): Promise<boolean> => {
  if (!(await allowLockedEditing(userId))) {
    return false;
  }

  const useRedisCache = process.env.APP_ENV !== "test" && redisEnabled();

  // Check the cache first

  const cachedTemplate = formCache.cacheAvailable
    ? await formCache.check(templateId).catch(() => null)
    : null;
  const cachedIsPublished = cachedTemplate?.isPublished ?? null;

  let cachedHasEnoughUsers: boolean | null = null;

  if (useRedisCache) {
    const redis = await getRedisInstance();
    const cachedValue = await redis.get(getEditLockAssignedUsersCacheKey(templateId));
    if (cachedValue === "1") cachedHasEnoughUsers = true;
    else if (cachedValue === "0") cachedHasEnoughUsers = false;
  }

  // Cache found, use these values

  if (
    cachedIsPublished !== null &&
    cachedHasEnoughUsers !== null &&
    // A cached "single-user" or "published" result is safe to trust because it disables
    // locking. When we are about to enforce locking, re-check the assigned-user count so a
    // stale "multi-user" cache cannot keep single-user forms in a lockable state.
    (!revalidateAssignedUserCount || cachedIsPublished || !cachedHasEnoughUsers)
  ) {
    return !cachedIsPublished && cachedHasEnoughUsers;
  }

  // Cache not found, fetch values from DB and update cache

  const data = await fetchAndCacheUserData(templateId, useRedisCache);

  if (!data) {
    // Default to enforcing the lock when template state cannot be determined so we do not
    // accidentally allow unlocked editing for a template that should still be protected.
    return true;
  }

  return !data.isPublished && data.hasEnoughUsers;
};

export const shouldEnforceTemplateEditLock = async (
  templateId: string,
  userId?: string
): Promise<boolean> => shouldEnforceTemplateEditLockInternal(templateId, { userId });

// Use this on page-entry or mutation paths where a stale cached multi-user threshold would be
// user-visible. It re-checks assigned-user count before enforcing edit locking.
export const shouldEnforceTemplateEditLockWithVerifiedUserCount = async (
  templateId: string,
  userId?: string
): Promise<boolean> =>
  shouldEnforceTemplateEditLockInternal(templateId, {
    userId,
    revalidateAssignedUserCount: true,
  });

export const getEditLockStatus = async (
  templateId: string,
  userId?: string
): Promise<EditLockStatus> => {
  const lock = redisEnabled() ? await readRedisLock(templateId) : readMemoryLock(templateId);
  return buildStatus(lock, userId);
};

export const acquireEditLock = async ({
  templateId,
  userId,
  userName,
  userEmail,
  sessionId,
  presence,
}: {
  templateId: string;
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  sessionId?: string | null;
  presence?: EditLockPresenceInput;
}): Promise<EditLockStatus> => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + EDIT_LOCK_TTL_MS);
  const presenceSnapshot = getPresenceSnapshot(presence);
  const actor = describeActionActor({ userId, userEmail });

  const updated: EditLockInfo = {
    templateId,
    lockedByUserId: userId,
    lockedByName: userName ?? null,
    lockedByEmail: userEmail ?? null,
    lockedAt: now,
    heartbeatAt: now,
    expiresAt,
    lastActivityAt: presenceSnapshot.lastActivityAt,
    visibilityState: presenceSnapshot.visibilityState,
    presenceStatus: presenceSnapshot.presenceStatus,
    sessionId: sessionId ?? null,
  };

  if (redisEnabled()) {
    const redis = await getRedisInstance();
    const existing = await readRedisLock(templateId);

    if (existing && existing.lockedByUserId !== userId) {
      logEditLockAction({
        action: "acquire",
        templateId,
        actor,
        owner: existing,
        result: "blocked-by-other-owner",
      });
      return buildStatus(existing, userId);
    }

    if (!existing) {
      const created = await redis.set(
        getEditLockKey(templateId),
        JSON.stringify(toStoredEditLockInfo(updated)),
        "EX",
        editLockTtlSeconds,
        "NX"
      );

      if (created === null) {
        logEditLockAction({
          action: "acquire",
          templateId,
          actor,
          result: "lost-race-retrying-status",
        });
        return getEditLockStatus(templateId, userId);
      }

      logEditLockAction({
        action: "acquire",
        templateId,
        actor,
        result: "created-lock",
      });
    } else {
      await storeRedisLock(updated);
      logEditLockAction({
        action: "acquire",
        templateId,
        actor,
        owner: existing,
        result: "refreshed-existing-owner-lock",
      });
    }

    await publishEditLockEvent(templateId);
    return buildStatus(updated, userId);
  }

  const store = getEditLockStore();
  const existing = store.get(templateId);

  if (existing) {
    const normalized = toEditLockInfo(existing);
    if (!isExpired(normalized, now) && normalized.lockedByUserId !== userId) {
      logEditLockAction({
        action: "acquire",
        templateId,
        actor,
        owner: normalized,
        result: "blocked-by-other-owner",
      });
      return buildStatus(normalized, userId);
    }
  }

  store.set(templateId, updated);
  logEditLockAction({
    action: "acquire",
    templateId,
    actor,
    owner: existing ? toEditLockInfo(existing) : null,
    result: existing ? "replaced-expired-lock" : "created-lock",
  });
  await publishEditLockEvent(templateId);
  return buildStatus(updated, userId);
};

export const takeoverEditLock = async ({
  templateId,
  userId,
  userName,
  userEmail,
  sessionId,
  presence,
}: {
  templateId: string;
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  sessionId?: string | null;
  presence?: EditLockPresenceInput;
}): Promise<EditLockStatus> => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + EDIT_LOCK_TTL_MS);
  const presenceSnapshot = getPresenceSnapshot(presence);
  const actor = describeActionActor({ userId, userEmail });
  const existing = redisEnabled() ? await readRedisLock(templateId) : readMemoryLock(templateId);
  const updated: EditLockInfo = {
    templateId,
    lockedByUserId: userId,
    lockedByName: userName ?? null,
    lockedByEmail: userEmail ?? null,
    lockedAt: now,
    heartbeatAt: now,
    expiresAt,
    lastActivityAt: presenceSnapshot.lastActivityAt,
    visibilityState: presenceSnapshot.visibilityState,
    presenceStatus: presenceSnapshot.presenceStatus,
    sessionId: sessionId ?? null,
  };

  if (redisEnabled()) {
    await storeRedisLock(updated);
    logEditLockAction({
      action: "takeover",
      templateId,
      actor,
      owner: existing,
      result: existing ? "set-lock-to-new-owner" : "set-lock-without-existing-owner",
    });
    await publishEditLockEvent(templateId);
    return buildStatus(updated, userId);
  }

  const store = getEditLockStore();
  store.set(templateId, updated);
  logEditLockAction({
    action: "takeover",
    templateId,
    actor,
    owner: existing,
    result: existing ? "set-lock-to-new-owner" : "set-lock-without-existing-owner",
  });
  await publishEditLockEvent(templateId);
  return buildStatus(updated, userId);
};

export const heartbeatEditLock = async ({
  templateId,
  userId,
  sessionId,
  presence,
}: {
  templateId: string;
  userId: string;
  sessionId?: string | null;
  presence?: EditLockPresenceInput;
}): Promise<EditLockStatus> => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + EDIT_LOCK_TTL_MS);
  const presenceSnapshot = getPresenceSnapshot(presence);

  if (redisEnabled()) {
    return withRedisWatch(templateId, async (current, redis) => {
      if (!current) {
        const unlocked = buildStatus(null, userId);
        const execResult = await redis.multi().exec();
        return execResult ? unlocked : null;
      }

      if (current.lockedByUserId !== userId || (sessionId && current.sessionId !== sessionId)) {
        const locked = buildStatus(current, userId);
        const execResult = await redis.multi().exec();
        return execResult ? locked : null;
      }

      const updated: EditLockInfo = {
        ...current,
        heartbeatAt: now,
        expiresAt,
        lastActivityAt: presenceSnapshot.lastActivityAt,
        visibilityState: presenceSnapshot.visibilityState,
        presenceStatus: presenceSnapshot.presenceStatus,
      };

      const execResult = await redis
        .multi()
        .set(
          getEditLockKey(templateId),
          JSON.stringify(toStoredEditLockInfo(updated)),
          "EX",
          editLockTtlSeconds
        )
        .exec();

      return execResult ? buildStatus(updated, userId) : null;
    });
  }

  const store = getEditLockStore();
  const existing = store.get(templateId);
  if (!existing) {
    return buildStatus(null, userId);
  }

  const normalized = toEditLockInfo(existing);
  if (normalized.lockedByUserId !== userId || (sessionId && normalized.sessionId !== sessionId)) {
    return buildStatus(normalized, userId);
  }

  const updated: EditLockInfo = {
    ...normalized,
    heartbeatAt: now,
    expiresAt,
    lastActivityAt: presenceSnapshot.lastActivityAt,
    visibilityState: presenceSnapshot.visibilityState,
    presenceStatus: presenceSnapshot.presenceStatus,
  };
  store.set(templateId, updated);
  return buildStatus(updated, userId);
};

export const releaseEditLock = async ({
  templateId,
  userId,
  sessionId,
}: {
  templateId: string;
  userId: string;
  sessionId?: string | null;
}): Promise<{ released: boolean }> => {
  const actor = describeActionActor({ userId });

  if (redisEnabled()) {
    return withRedisWatch(templateId, async (current, redis) => {
      if (!current) {
        logEditLockAction({
          action: "release",
          templateId,
          actor,
          result: "no-lock-present",
        });
        const execResult = await redis.multi().exec();
        return execResult ? { released: false } : null;
      }

      if (current.lockedByUserId !== userId || (sessionId && current.sessionId !== sessionId)) {
        logEditLockAction({
          action: "release",
          templateId,
          actor,
          owner: current,
          result: "denied-not-owner",
        });
        const execResult = await redis.multi().exec();
        return execResult ? { released: false } : null;
      }

      const execResult = await redis.multi().del(getEditLockKey(templateId)).exec();
      if (!execResult) {
        return null;
      }

      logEditLockAction({
        action: "release",
        templateId,
        actor,
        owner: current,
        result: "released-lock",
      });
      await publishEditLockEvent(templateId);
      return { released: true };
    });
  }

  const store = getEditLockStore();
  const existing = store.get(templateId);
  if (!existing) {
    logEditLockAction({
      action: "release",
      templateId,
      actor,
      result: "no-lock-present",
    });
    return { released: false };
  }

  const normalized = toEditLockInfo(existing);
  if (normalized.lockedByUserId !== userId || (sessionId && normalized.sessionId !== sessionId)) {
    logEditLockAction({
      action: "release",
      templateId,
      actor,
      owner: normalized,
      result: "denied-not-owner",
    });
    return { released: false };
  }

  store.delete(templateId);
  logEditLockAction({
    action: "release",
    templateId,
    actor,
    owner: normalized,
    result: "released-lock",
  });
  await publishEditLockEvent(templateId);
  return { released: true };
};

export const assertTemplateEditLock = async ({
  templateId,
  userId,
}: {
  templateId: string;
  userId: string;
}) => {
  const status = await getEditLockStatus(templateId, userId);
  if (!status.isOwner) {
    const name = status.lock?.lockedByName || status.lock?.lockedByEmail || "another user";
    const message = status.lock
      ? `Form is locked for editing by ${name}.`
      : "Form is locked for editing until you acquire the lock.";
    throw new TemplateEditLockedError(message, status.lock);
  }
};
