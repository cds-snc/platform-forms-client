import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  acquireEditLock,
  getEditLockStatus,
  heartbeatEditLock,
  releaseEditLock,
  requestEditLockTakeoverSave,
  subscribeToEditLockEvents,
  takeoverEditLock,
} from "@lib/editLocks";
import { getRedisInstance } from "@lib/integration/redisConnector";

vi.mock("@lib/integration/redisConnector", async () => {
  const { default: Redis } = await import("ioredis-mock");
  const redis = new Redis();

  return {
    getRedisInstance: vi.fn(async () => redis),
    createRedisSubscriber: vi.fn(() => redis.duplicate()),
  };
});

describe("editLocks with redis", () => {
  const originalRedisUrl = process.env.REDIS_URL;

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.REDIS_URL = "redis://test";
    const redisInstance = await getRedisInstance();
    await redisInstance.flushall();
  });

  afterAll(() => {
    if (originalRedisUrl === undefined) {
      delete process.env.REDIS_URL;
      return;
    }

    process.env.REDIS_URL = originalRedisUrl;
  });

  it("allows another editor to take over an existing lock", async () => {
    await acquireEditLock({
      templateId: "form-1",
      userId: "user-1",
      userName: "User One",
      sessionId: "session-1",
    });

    const lockedStatus = await getEditLockStatus("form-1", "user-2");
    expect(lockedStatus.isOwner).toBe(false);
    expect(lockedStatus.lockedByOther).toBe(true);
    expect(lockedStatus.lock?.lockedByUserId).toBe("user-1");

    const takeoverStatus = await takeoverEditLock({
      templateId: "form-1",
      userId: "user-2",
      userName: "User Two",
      sessionId: "session-2",
    });

    expect(takeoverStatus.isOwner).toBe(true);
    expect(takeoverStatus.lock?.lockedByUserId).toBe("user-2");

    const previousOwnerStatus = await getEditLockStatus("form-1", "user-1");
    expect(previousOwnerStatus.isOwner).toBe(false);
    expect(previousOwnerStatus.lockedByOther).toBe(true);
    expect(previousOwnerStatus.lock?.lockedByUserId).toBe("user-2");
  });

  it("blocks heartbeat and release for another user", async () => {
    await acquireEditLock({
      templateId: "form-2",
      userId: "user-1",
      userName: "User One",
      sessionId: "session-1",
    });

    const blockedHeartbeat = await heartbeatEditLock({
      templateId: "form-2",
      userId: "user-2",
      sessionId: "session-2",
    });
    expect(blockedHeartbeat.isOwner).toBe(false);
    expect(blockedHeartbeat.lockedByOther).toBe(true);

    const blockedRelease = await releaseEditLock({
      templateId: "form-2",
      userId: "user-2",
      sessionId: "session-2",
    });
    expect(blockedRelease.released).toBe(false);

    const released = await releaseEditLock({
      templateId: "form-2",
      userId: "user-1",
      sessionId: "session-1",
    });
    expect(released.released).toBe(true);

    const unlockedStatus = await getEditLockStatus("form-2", "user-1");
    expect(unlockedStatus.locked).toBe(false);
  });

  it("updates activity metadata on heartbeat", async () => {
    await acquireEditLock({
      templateId: "form-3",
      userId: "user-1",
      userName: "User One",
      sessionId: "session-1",
    });

    const activityAt = new Date("2026-03-17T12:00:00.000Z");
    const heartbeatStatus = await heartbeatEditLock({
      templateId: "form-3",
      userId: "user-1",
      sessionId: "session-1",
      presence: {
        lastActivityAt: activityAt,
        visibilityState: "hidden",
        presenceStatus: "away",
      },
    });

    expect(heartbeatStatus.lock?.lastActivityAt).toEqual(activityAt);
    expect(heartbeatStatus.lock?.visibilityState).toBe("hidden");
    expect(heartbeatStatus.lock?.presenceStatus).toBe("away");
  });

  it("emits a takeover save request before ownership changes in memory mode", async () => {
    const previousRedisUrl = process.env.REDIS_URL;
    delete process.env.REDIS_URL;

    await acquireEditLock({
      templateId: "form-4",
      userId: "user-1",
      userName: "User One",
      sessionId: "session-1",
    });

    const events: string[] = [];
    const unsubscribe = subscribeToEditLockEvents("form-4", (event) => {
      events.push(event.type);
    });

    try {
      await requestEditLockTakeoverSave("form-4");

      const status = await getEditLockStatus("form-4", "user-1");
      expect(status.isOwner).toBe(true);
      expect(status.lock?.lockedByUserId).toBe("user-1");
      expect(events).toEqual(["takeover-requested"]);
    } finally {
      unsubscribe();
      process.env.REDIS_URL = previousRedisUrl;
    }
  });
});