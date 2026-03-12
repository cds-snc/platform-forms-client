export const EDIT_LOCK_TTL_MS = 60_000;
export const EDIT_LOCK_HEARTBEAT_MS = 15_000;

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

type EditLockGlobal = typeof globalThis & {
  __editLockStore?: EditLockStore;
};

const getEditLockStore = (): EditLockStore => {
  const globalWithStore = globalThis as EditLockGlobal;
  if (!globalWithStore.__editLockStore) {
    globalWithStore.__editLockStore = new Map();
  }
  return globalWithStore.__editLockStore;
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
  const now = new Date();
  const store = getEditLockStore();
  const lock = store.get(templateId);

  if (!lock) {
    return { locked: false, lockedByOther: false, isOwner: false, lock: null };
  }

  const normalized = toEditLockInfo(lock);

  if (isExpired(normalized, now)) {
    store.delete(templateId);
    return { locked: false, lockedByOther: false, isOwner: false, lock: null };
  }

  const isOwner = !!userId && normalized.lockedByUserId === userId;
  return {
    locked: true,
    lockedByOther: !isOwner,
    isOwner,
    lock: normalized,
  };
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
  const store = getEditLockStore();
  const existing = store.get(templateId);

  if (existing) {
    const normalized = toEditLockInfo(existing);
    if (!isExpired(normalized, now) && normalized.lockedByUserId !== userId) {
      return {
        locked: true,
        lockedByOther: true,
        isOwner: false,
        lock: normalized,
      };
    }
  }

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
  store.set(templateId, updated);

  return {
    locked: true,
    lockedByOther: false,
    isOwner: true,
    lock: toEditLockInfo(updated),
  };
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
  const store = getEditLockStore();
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
  store.set(templateId, updated);

  return {
    locked: true,
    lockedByOther: false,
    isOwner: true,
    lock: toEditLockInfo(updated),
  };
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

  const store = getEditLockStore();
  const existing = store.get(templateId);
  if (!existing) {
    return { locked: false, lockedByOther: false, isOwner: false, lock: null };
  }

  const normalized = toEditLockInfo(existing);
  if (normalized.lockedByUserId !== userId || (sessionId && normalized.sessionId !== sessionId)) {
    return {
      locked: true,
      lockedByOther: true,
      isOwner: false,
      lock: normalized,
    };
  }

  const updated: EditLockInfo = {
    ...normalized,
    heartbeatAt: now,
    expiresAt,
  };
  store.set(templateId, updated);

  return {
    locked: true,
    lockedByOther: false,
    isOwner: true,
    lock: toEditLockInfo(updated),
  };
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
