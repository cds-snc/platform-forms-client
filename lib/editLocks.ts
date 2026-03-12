import { prisma } from "@lib/integration/prismaConnector";

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

type EditLockRecord = EditLockInfo & {
  id: string;
  lockedByName: string | null;
  lockedByEmail: string | null;
  sessionId: string | null;
};

type EditLockUpsertArgs = {
  where: { templateId: string };
  create: Omit<EditLockRecord, "id">;
  update: Partial<Omit<EditLockRecord, "id">>;
};

type EditLockUpdateArgs = {
  where: { templateId: string };
  data: Partial<Omit<EditLockRecord, "id">>;
};

type EditLockDeleteManyArgs = {
  where: { templateId: string };
};

type EditLockClient = {
  findUnique: (args: { where: { templateId: string } }) => Promise<EditLockRecord | null>;
  upsert: (args: EditLockUpsertArgs) => Promise<EditLockRecord>;
  update: (args: EditLockUpdateArgs) => Promise<EditLockRecord>;
  deleteMany: (args: EditLockDeleteManyArgs) => Promise<{ count: number }>;
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

const getLockClient = (client: unknown = prisma): EditLockClient => {
  const typed = client as { templateEditLock: EditLockClient };
  return typed.templateEditLock;
};

const isExpired = (lock: EditLockInfo, now: Date) => lock.expiresAt.getTime() <= now.getTime();

const normalizeLock = (lock: EditLockRecord): EditLockInfo => ({
  templateId: lock.templateId,
  lockedByUserId: lock.lockedByUserId,
  lockedByName: lock.lockedByName ?? null,
  lockedByEmail: lock.lockedByEmail ?? null,
  lockedAt: lock.lockedAt,
  heartbeatAt: lock.heartbeatAt,
  expiresAt: lock.expiresAt,
  sessionId: lock.sessionId ?? null,
});

export const getEditLockStatus = async (
  templateId: string,
  userId?: string
): Promise<EditLockStatus> => {
  const lockClient = getLockClient();
  const now = new Date();
  const lock = await lockClient.findUnique({ where: { templateId } });

  if (!lock) {
    return { locked: false, lockedByOther: false, isOwner: false, lock: null };
  }

  const normalized = normalizeLock(lock);

  if (isExpired(normalized, now)) {
    await lockClient.deleteMany({ where: { templateId } });
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

  return prisma.$transaction(async (tx) => {
    const lockClient = getLockClient(tx);
    const existing = await lockClient.findUnique({ where: { templateId } });

    if (existing) {
      const normalized = normalizeLock(existing);
      if (!isExpired(normalized, now) && normalized.lockedByUserId !== userId) {
        return {
          locked: true,
          lockedByOther: true,
          isOwner: false,
          lock: normalized,
        };
      }
    }

    const updated = await lockClient.upsert({
      where: { templateId },
      create: {
        templateId,
        lockedByUserId: userId,
        lockedByName: userName ?? null,
        lockedByEmail: userEmail ?? null,
        lockedAt: now,
        heartbeatAt: now,
        expiresAt,
        sessionId: sessionId ?? null,
      },
      update: {
        lockedByUserId: userId,
        lockedByName: userName ?? null,
        lockedByEmail: userEmail ?? null,
        lockedAt: now,
        heartbeatAt: now,
        expiresAt,
        sessionId: sessionId ?? null,
      },
    });

    return {
      locked: true,
      lockedByOther: false,
      isOwner: true,
      lock: normalizeLock(updated),
    };
  });
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

  const lockClient = getLockClient();
  const updated = await lockClient.upsert({
    where: { templateId },
    create: {
      templateId,
      lockedByUserId: userId,
      lockedByName: userName ?? null,
      lockedByEmail: userEmail ?? null,
      lockedAt: now,
      heartbeatAt: now,
      expiresAt,
      sessionId: sessionId ?? null,
    },
    update: {
      lockedByUserId: userId,
      lockedByName: userName ?? null,
      lockedByEmail: userEmail ?? null,
      lockedAt: now,
      heartbeatAt: now,
      expiresAt,
      sessionId: sessionId ?? null,
    },
  });

  return {
    locked: true,
    lockedByOther: false,
    isOwner: true,
    lock: normalizeLock(updated),
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
  const lockClient = getLockClient();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + EDIT_LOCK_TTL_MS);

  const existing = await lockClient.findUnique({ where: { templateId } });
  if (!existing) {
    return { locked: false, lockedByOther: false, isOwner: false, lock: null };
  }

  const normalized = normalizeLock(existing);
  if (normalized.lockedByUserId !== userId || (sessionId && normalized.sessionId !== sessionId)) {
    return {
      locked: true,
      lockedByOther: true,
      isOwner: false,
      lock: normalized,
    };
  }

  const updated = await lockClient.update({
    where: { templateId },
    data: {
      heartbeatAt: now,
      expiresAt,
    },
  });

  return {
    locked: true,
    lockedByOther: false,
    isOwner: true,
    lock: normalizeLock(updated),
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
  const lockClient = getLockClient();
  const existing = await lockClient.findUnique({ where: { templateId } });
  if (!existing) {
    return { released: false };
  }

  const normalized = normalizeLock(existing);
  if (normalized.lockedByUserId !== userId || (sessionId && normalized.sessionId !== sessionId)) {
    return { released: false };
  }

  await lockClient.deleteMany({ where: { templateId } });
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
