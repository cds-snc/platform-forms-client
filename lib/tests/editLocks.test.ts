import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@gcforms/database", () => ({
  prisma: {
    template: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@lib/cache/formCache", () => ({
  formCache: {
    cacheAvailable: true,
    check: vi.fn(async () => null),
    set: vi.fn(),
    invalidate: vi.fn(),
  },
}));

import {
  acknowledgeEditLockTakeoverSave,
  acquireEditLock,
  clearEditLockTakeoverSaveAcknowledgement,
  getEditLockAssignedPendingUsersCountCacheKey,
  getEditLockAssignedUsersCountCacheKey,
  getEditLockStatus,
  getTemplateCollaboratorCount,
  heartbeatEditLock,
  invalidateTemplateEditLockUserCountCache,
  releaseEditLock,
  shouldEnforceTemplateEditLock,
  shouldEnforceTemplateEditLockWithVerifiedUserCount,
  shouldEnableTemplateEditLock,
  takeoverEditLock,
  waitForEditLockTakeoverSaveAcknowledgement,
} from "@lib/editLocks";
import { formCache } from "@lib/cache/formCache";
import { prisma } from "@gcforms/database";
import { getRedisInstance } from "@lib/integration/redisConnector";
import type { FormProperties, PublicFormRecord } from "@lib/types";

vi.mock("@lib/integration/redisConnector", async () => {
  const { default: Redis } = await import("ioredis-mock");
  const redis = new Redis();

  return {
    getRedisInstance: vi.fn(async () => redis),
  };
});

describe("editLocks with redis", () => {
  const originalRedisUrl = process.env.REDIS_URL;
  const originalAppEnv = process.env.APP_ENV;

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.REDIS_URL = "redis://test";
    process.env.APP_ENV = "development";
    const redisInstance = await getRedisInstance();
    await redisInstance.flushall();
    await redisInstance.set("flag:lockedEditing", "1");
    vi.mocked(formCache.check).mockResolvedValue(null);
  });

  afterAll(() => {
    if (originalRedisUrl === undefined) {
      delete process.env.REDIS_URL;
    } else {
      process.env.REDIS_URL = originalRedisUrl;
    }

    if (originalAppEnv === undefined) {
      delete process.env.APP_ENV;
      return;
    }

    process.env.APP_ENV = originalAppEnv;
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

  it("waits for the current editor to acknowledge takeover save completion", async () => {
    await acquireEditLock({
      templateId: "form-5",
      userId: "user-1",
      userName: "User One",
      sessionId: "session-1",
    });

    await clearEditLockTakeoverSaveAcknowledgement({
      templateId: "form-5",
      sessionId: "session-1",
    });

    const waitForSave = waitForEditLockTakeoverSaveAcknowledgement({
      templateId: "form-5",
      sessionId: "session-1",
      timeoutMs: 500,
    });

    await acknowledgeEditLockTakeoverSave({
      templateId: "form-5",
      userId: "user-1",
      sessionId: "session-1",
    });

    await expect(waitForSave).resolves.toBe(true);
  });

  it("reuses the template cache for publish state and caches only the user-count threshold", async () => {
    const findUniqueMock = prisma.template.findUnique as unknown as ReturnType<typeof vi.fn>;

    const cachedTemplate: PublicFormRecord = {
      id: "form-6",
      form: {} as FormProperties,
      isPublished: false,
      securityAttribute: "Unclassified",
    };

    vi.mocked(formCache.check).mockResolvedValue(cachedTemplate);

    findUniqueMock.mockResolvedValue({
      isPublished: false,
      _count: {
        users: 2,
        invitations: 0,
      },
    });

    await expect(shouldEnforceTemplateEditLock("form-6")).resolves.toBe(true);
    await expect(shouldEnforceTemplateEditLock("form-6")).resolves.toBe(true);
    expect(prisma.template.findUnique).toHaveBeenCalledTimes(1);

    await invalidateTemplateEditLockUserCountCache("form-6");

    findUniqueMock.mockResolvedValue({
      isPublished: false,
      _count: {
        users: 1,
        invitations: 0,
      },
    });

    await expect(shouldEnforceTemplateEditLock("form-6")).resolves.toBe(false);
    expect(prisma.template.findUnique).toHaveBeenCalledTimes(2);
  });

  it("disables edit locking for draft forms with fewer than two assigned users", () => {
    expect(
      shouldEnableTemplateEditLock({
        allowLockedEditing: true,
        templateId: "form-8",
        isPublished: false,
        assignedUserCount: 1,
      })
    ).toBe(false);

    expect(
      shouldEnableTemplateEditLock({
        allowLockedEditing: true,
        templateId: "form-8",
        isPublished: false,
        assignedUserCount: 2,
      })
    ).toBe(true);
  });

  it("enables edit locking when one assigned user and one pending invitation can edit", async () => {
    const findUniqueMock = prisma.template.findUnique as unknown as ReturnType<typeof vi.fn>;

    vi.mocked(formCache.check).mockResolvedValue(null);

    findUniqueMock.mockResolvedValue({
      isPublished: false,
      _count: {
        users: 1,
        invitations: 1,
      },
    });

    await expect(shouldEnforceTemplateEditLock("form-8")).resolves.toBe(true);
  });

  it("revalidates a cached multi-user threshold when fresh assigned-user enforcement is required", async () => {
    const findUniqueMock = prisma.template.findUnique as unknown as ReturnType<typeof vi.fn>;

    const cachedTemplate: PublicFormRecord = {
      id: "form-7",
      form: {} as FormProperties,
      isPublished: false,
      securityAttribute: "Unclassified",
    };

    vi.mocked(formCache.check).mockResolvedValue(cachedTemplate);

    const redisInstance = await getRedisInstance();
    await redisInstance.set("edit-lock:assigned-users:form-7", "1");

    findUniqueMock.mockResolvedValue({
      isPublished: false,
      _count: {
        users: 1,
      },
      invitations: [],
    });

    await expect(shouldEnforceTemplateEditLockWithVerifiedUserCount("form-7")).resolves.toBe(false);
    expect(prisma.template.findUnique).toHaveBeenCalledTimes(1);
  });

  describe("getTemplateCollaboratorCount", () => {
    beforeEach(async () => {
      const redis = await getRedisInstance();
      await redis.del(
        getEditLockAssignedUsersCountCacheKey("form-cc"),
        getEditLockAssignedPendingUsersCountCacheKey("form-cc")
      );
    });

    it("returns userCount and pendingUserCount from the database on a cache miss", async () => {
      vi.mocked(prisma.template.findUnique).mockResolvedValue({
        isPublished: false,
        _count: { users: 3, invitations: 2 },
      } as never);

      const result = await getTemplateCollaboratorCount("form-cc");
      expect(result).toEqual({ userCount: 3, pendingUserCount: 2 });
    });

    it("returns cached values without hitting the database on a cache hit", async () => {
      const redis = await getRedisInstance();
      await redis.set(getEditLockAssignedUsersCountCacheKey("form-cc"), "5");
      await redis.set(getEditLockAssignedPendingUsersCountCacheKey("form-cc"), "1");

      const result = await getTemplateCollaboratorCount("form-cc");
      expect(result).toEqual({ userCount: 5, pendingUserCount: 1 });
      expect(prisma.template.findUnique).not.toHaveBeenCalled();
    });

    it("populates the Redis cache after a database fetch", async () => {
      vi.mocked(prisma.template.findUnique).mockResolvedValue({
        isPublished: false,
        _count: { users: 2, invitations: 1 },
      } as never);

      await getTemplateCollaboratorCount("form-cc");

      const redis = await getRedisInstance();
      expect(await redis.get(getEditLockAssignedUsersCountCacheKey("form-cc"))).toBe("2");
      expect(await redis.get(getEditLockAssignedPendingUsersCountCacheKey("form-cc"))).toBe("1");
    });

    it("returns { userCount: null, pendingUserCount: null } when the template does not exist", async () => {
      vi.mocked(prisma.template.findUnique).mockResolvedValue(null);

      const result = await getTemplateCollaboratorCount("form-cc");
      expect(result).toEqual({ userCount: null, pendingUserCount: null });
    });

    it("returns { userCount: null, pendingUserCount: null } when the database query throws an error", async () => {
      vi.mocked(prisma.template.findUnique).mockRejectedValue(new Error("db error"));

      const result = await getTemplateCollaboratorCount("form-cc");
      expect(result).toEqual({ userCount: null, pendingUserCount: null });
    });

    it("treats a partial cache miss (only one key present) as a miss and fetches from database", async () => {
      const redis = await getRedisInstance();
      await redis.set(getEditLockAssignedUsersCountCacheKey("form-cc"), "4");
      // pendingUserCount key absent

      vi.mocked(prisma.template.findUnique).mockResolvedValue({
        isPublished: false,
        _count: { users: 4, invitations: 3 },
      } as never);

      const result = await getTemplateCollaboratorCount("form-cc");
      expect(result).toEqual({ userCount: 4, pendingUserCount: 3 });
      expect(prisma.template.findUnique).toHaveBeenCalledTimes(1);
    });
  });

});
