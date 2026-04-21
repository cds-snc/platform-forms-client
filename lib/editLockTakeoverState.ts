import { getRedisInstance } from "@lib/integration/redisConnector";
import { EDIT_LOCK_PRE_TAKEOVER_SAVE_WAIT_MS } from "@lib/formBuilderEditLockPresence";

const EDIT_LOCK_TAKEOVER_SAVE_ACK_PREFIX = "edit-lock-takeover-save";
const EDIT_LOCK_TAKEOVER_PENDING_PREFIX = "edit-lock-takeover-pending";
const EDIT_LOCK_TAKEOVER_SAVE_ACK_POLL_MS = 100;

type EditLockTakeoverStateGlobal = typeof globalThis & {
  __editLockTakeoverSaveAcks?: Map<string, number>;
  __editLockPendingTakeovers?: Map<string, number>;
};

const redisEnabled = () => Boolean(process.env.REDIS_URL);

const getEditLockTakeoverSaveAcks = (): Map<string, number> => {
  const globalWithStore = globalThis as EditLockTakeoverStateGlobal;
  if (!globalWithStore.__editLockTakeoverSaveAcks) {
    globalWithStore.__editLockTakeoverSaveAcks = new Map();
  }
  return globalWithStore.__editLockTakeoverSaveAcks;
};

const getEditLockPendingTakeovers = (): Map<string, number> => {
  const globalWithStore = globalThis as EditLockTakeoverStateGlobal;
  if (!globalWithStore.__editLockPendingTakeovers) {
    globalWithStore.__editLockPendingTakeovers = new Map();
  }
  return globalWithStore.__editLockPendingTakeovers;
};

const getEditLockTakeoverSaveAcknowledgementKey = (templateId: string, sessionId: string) =>
  `${EDIT_LOCK_TAKEOVER_SAVE_ACK_PREFIX}:${templateId}:${sessionId}`;

const getEditLockTakeoverPendingKey = (templateId: string, sessionId: string) =>
  `${EDIT_LOCK_TAKEOVER_PENDING_PREFIX}:${templateId}:${sessionId}`;

const wait = async (timeMs: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, timeMs);
  });

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

  const key = getEditLockTakeoverSaveAcknowledgementKey(templateId, sessionId);

  if (redisEnabled()) {
    const redis = await getRedisInstance();
    await redis.del(key);
    return;
  }

  getEditLockTakeoverSaveAcks().delete(key);
};

export const acknowledgeEditLockTakeoverSave = async ({
  templateId,
  sessionId,
}: {
  templateId: string;
  sessionId?: string | null;
}) => {
  if (!sessionId) {
    return false;
  }

  const key = getEditLockTakeoverSaveAcknowledgementKey(templateId, sessionId);

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

  const key = getEditLockTakeoverSaveAcknowledgementKey(templateId, sessionId);

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

export const beginEditLockTakeover = async ({
  templateId,
  sessionId,
}: {
  templateId: string;
  sessionId?: string | null;
}) => {
  if (!sessionId) {
    return;
  }

  const key = getEditLockTakeoverPendingKey(templateId, sessionId);

  if (redisEnabled()) {
    const redis = await getRedisInstance();
    await redis.set(key, "1", "PX", EDIT_LOCK_PRE_TAKEOVER_SAVE_WAIT_MS);
    return;
  }

  getEditLockPendingTakeovers().set(key, Date.now() + EDIT_LOCK_PRE_TAKEOVER_SAVE_WAIT_MS);
};

export const clearEditLockTakeover = async ({
  templateId,
  sessionId,
}: {
  templateId: string;
  sessionId?: string | null;
}) => {
  if (!sessionId) {
    return;
  }

  const key = getEditLockTakeoverPendingKey(templateId, sessionId);

  if (redisEnabled()) {
    const redis = await getRedisInstance();
    await redis.del(key);
    return;
  }

  getEditLockPendingTakeovers().delete(key);
};

export const hasPendingEditLockTakeover = async ({
  templateId,
  sessionId,
}: {
  templateId: string;
  sessionId?: string | null;
}) => {
  if (!sessionId) {
    return false;
  }

  const key = getEditLockTakeoverPendingKey(templateId, sessionId);

  if (redisEnabled()) {
    const redis = await getRedisInstance();
    return (await redis.get(key)) === "1";
  }

  const expiresAt = getEditLockPendingTakeovers().get(key);
  if (!expiresAt) {
    return false;
  }

  if (expiresAt <= Date.now()) {
    getEditLockPendingTakeovers().delete(key);
    return false;
  }

  return true;
};
