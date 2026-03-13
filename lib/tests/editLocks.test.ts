import Redis from "ioredis-mock";
import {
  acquireEditLock,
  getEditLockStatus,
  heartbeatEditLock,
  releaseEditLock,
  takeoverEditLock,
} from "@lib/editLocks";
import { getRedisInstance } from "@lib/integration/redisConnector";

jest.mock("@lib/integration/redisConnector", () => {
  const redis = new Redis();
  return {
    getRedisInstance: jest.fn(async () => redis),
    createRedisSubscriber: jest.fn(() => redis.duplicate()),
  };
});

describe("editLocks with redis", () => {
  const originalRedisUrl = process.env.REDIS_URL;

  beforeEach(async () => {
    process.env.REDIS_URL = "redis://test";
    const redis = await getRedisInstance();
    await redis.flushall();
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
});
