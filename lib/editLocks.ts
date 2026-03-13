import { getRedisInstance } from "@lib/integration/redisConnector";

export const EDIT_LOCK_TTL_MS = 60_000;
export const EDIT_LOCK_HEARTBEAT_MS = 15_000;
const EDIT_LOCK_KEY_PREFIX = "edit-lock";
const EDIT_LOCK_CHANNEL_PREFIX = "edit-lock-events";

export type EditLockInfo = {
  templateId: string;
  lockedByUserId: string;
  lockedByName?: string | null;
  lockedByEmail?: string | null;
  lockedAt: Date;
  heartbeatAt: Date;
  expiresAt: Date;
  sessionId?: string | null;
};

export type EditLockStatus = {
  locked: boolean;
  lockedByOther: boolean;
  isOwner: boolean;
  lock: EditLockInfo | null;
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
type EditLockSubscriber = () => void;
type EditLockSubscriberStore = Map<string, Set<EditLockSubscriber>>;
type StoredEditLockInfo = Omit<EditLockInfo, "lockedAt" | "heartbeatAt" | "expiresAt"> & {
  lockedAt: string;
  heartbeatAt: string;
  expiresAt: string;
};

type EditLockGlobal = typeof globalThis & {
  __editLockStore?: EditLockStore;
  __editLockSubscribers?: EditLockSubscriberStore;
};

const getEditLockStore = (): EditLockStore => {
  const globalWithStore = globalThis as EditLockGlobal;
  if (!globalWithStore.__editLockStore) {
    globalWithStore.__editLockStore = new Map();
  }
  return globalWithStore.__editLockStore;
};

const getEditLockSubscribers = (): EditLockSubscriberStore => {
  const globalWithStore = globalThis as EditLockGlobal;
  if (!globalWithStore.__editLockSubscribers) {
    globalWithStore.__editLockSubscribers = new Map();
  }
  return globalWithStore.__editLockSubscribers;
};

const redisEnabled = () => Boolean(process.env.REDIS_URL);

const getEditLockKey = (templateId: string) => `${EDIT_LOCK_KEY_PREFIX}:${templateId}`;
const getEditLockChannel = (templateId: string) => `${EDIT_LOCK_CHANNEL_PREFIX}:${templateId}`;
const editLockTtlSeconds = Math.ceil(EDIT_LOCK_TTL_MS / 1000);

const toStoredEditLockInfo = (lock: EditLockInfo): StoredEditLockInfo => ({
  ...lock,
  lockedAt: lock.lockedAt.toISOString(),
  heartbeatAt: lock.heartbeatAt.toISOString(),
  expiresAt: lock.expiresAt.toISOString(),
  lockedByName: lock.lockedByName ?? null,
  lockedByEmail: lock.lockedByEmail ?? null,
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
      sessionId: parsed.sessionId ?? null,
      lockedAt: new Date(parsed.lockedAt),
      heartbeatAt: new Date(parsed.heartbeatAt),
      expiresAt: new Date(parsed.expiresAt),
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
    notifyEditLockSubscribers(templateId);
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

const publishEditLockEvent = async (templateId: string) => {
  if (redisEnabled()) {
    const redis = await getRedisInstance();
    await redis.publish(getEditLockChannel(templateId), JSON.stringify({ type: "updated" }));
    return;
  }

  notifyEditLockSubscribers(templateId);
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

const notifyEditLockSubscribers = (templateId: string) => {
  const subscribers = getEditLockSubscribers().get(templateId);
  if (!subscribers) {
    return;
  }

  subscribers.forEach((subscriber) => subscriber());
};

export const subscribeToEditLockEvents = (templateId: string, subscriber: EditLockSubscriber) => {
  const subscriberStore = getEditLockSubscribers();
  const subscribers = subscriberStore.get(templateId) ?? new Set<EditLockSubscriber>();
  subscribers.add(subscriber);
  subscriberStore.set(templateId, subscribers);

  return () => {
    const currentSubscribers = subscriberStore.get(templateId);
    if (!currentSubscribers) {
      return;
    }

    currentSubscribers.delete(subscriber);
    if (currentSubscribers.size === 0) {
      subscriberStore.delete(templateId);
    }
  };
};

const isExpired = (lock: EditLockInfo, now: Date) => lock.expiresAt.getTime() <= now.getTime();

const toEditLockInfo = (lock: EditLockInfo): EditLockInfo => ({
  ...lock,
  lockedByName: lock.lockedByName ?? null,
  lockedByEmail: lock.lockedByEmail ?? null,
  sessionId: lock.sessionId ?? null,
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
}: {
  templateId: string;
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  sessionId?: string | null;
}): Promise<EditLockStatus> => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + EDIT_LOCK_TTL_MS);

  const updated: EditLockInfo = {
    templateId,
    lockedByUserId: userId,
    lockedByName: userName ?? null,
    lockedByEmail: userEmail ?? null,
    lockedAt: now,
    heartbeatAt: now,
    expiresAt,
    sessionId: sessionId ?? null,
  };

  if (redisEnabled()) {
    const redis = await getRedisInstance();
    const existing = await readRedisLock(templateId);

    if (existing && existing.lockedByUserId !== userId) {
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
        return getEditLockStatus(templateId, userId);
      }
    } else {
      await storeRedisLock(updated);
    }

    await publishEditLockEvent(templateId);
    return buildStatus(updated, userId);
  }

  const store = getEditLockStore();
  const existing = store.get(templateId);

  if (existing) {
    const normalized = toEditLockInfo(existing);
    if (!isExpired(normalized, now) && normalized.lockedByUserId !== userId) {
      return buildStatus(normalized, userId);
    }
  }

  store.set(templateId, updated);
  await publishEditLockEvent(templateId);
  return buildStatus(updated, userId);
};

export const takeoverEditLock = async ({
  templateId,
  userId,
  userName,
  userEmail,
  sessionId,
}: {
  templateId: string;
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  sessionId?: string | null;
}): Promise<EditLockStatus> => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + EDIT_LOCK_TTL_MS);
  const updated: EditLockInfo = {
    templateId,
    lockedByUserId: userId,
    lockedByName: userName ?? null,
    lockedByEmail: userEmail ?? null,
    lockedAt: now,
    heartbeatAt: now,
    expiresAt,
    sessionId: sessionId ?? null,
  };

  if (redisEnabled()) {
    await storeRedisLock(updated);
    await publishEditLockEvent(templateId);
    return buildStatus(updated, userId);
  }

  const store = getEditLockStore();
  store.set(templateId, updated);
  await publishEditLockEvent(templateId);
  return buildStatus(updated, userId);
};

export const heartbeatEditLock = async ({
  templateId,
  userId,
  sessionId,
}: {
  templateId: string;
  userId: string;
  sessionId?: string | null;
}): Promise<EditLockStatus> => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + EDIT_LOCK_TTL_MS);

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
  if (redisEnabled()) {
    return withRedisWatch(templateId, async (current, redis) => {
      if (!current) {
        const execResult = await redis.multi().exec();
        return execResult ? { released: false } : null;
      }

      if (current.lockedByUserId !== userId || (sessionId && current.sessionId !== sessionId)) {
        const execResult = await redis.multi().exec();
        return execResult ? { released: false } : null;
      }

      const execResult = await redis.multi().del(getEditLockKey(templateId)).exec();
      if (!execResult) {
        return null;
      }

      await publishEditLockEvent(templateId);
      return { released: true };
    });
  }

  const store = getEditLockStore();
  const existing = store.get(templateId);
  if (!existing) {
    return { released: false };
  }

  const normalized = toEditLockInfo(existing);
  if (normalized.lockedByUserId !== userId || (sessionId && normalized.sessionId !== sessionId)) {
    return { released: false };
  }

  store.delete(templateId);
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
