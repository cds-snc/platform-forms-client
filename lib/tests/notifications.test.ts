import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@gcforms/database", () => ({
  prisma: {
    template: {
      findUnique: vi.fn(),
    },
  },
  prismaErrors: vi.fn((_err, fallback) => fallback),
}));

vi.mock("@lib/logger", () => ({
  logMessage: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Unused in isFormEligibleForNotifications but imported at module level in notifications.ts
vi.mock("@gcforms/connectors", () => ({
  notification: {
    sendDeferred: vi.fn(),
    sendImmediate: vi.fn(),
    enqueueDeferred: vi.fn(),
  },
}));

vi.mock("@lib/integration/redisConnector", async () => {
  const { default: Redis } = await import("ioredis-mock");
  const redis = new Redis();
  return {
    getRedisInstance: vi.fn(async () => redis),
  };
});

vi.mock("@lib/origin", () => ({
  getOrigin: vi.fn(),
}));

vi.mock("@i18n", () => ({
  serverTranslation: vi.fn(),
}));

import { isFormEligibleForNotifications, updateNotificationMarker } from "@lib/notifications";
import { prisma } from "@gcforms/database";
import { getRedisInstance } from "@lib/integration/redisConnector";

const mockFormId = "test-form-id";

// Helpers to set up the two sequential prisma.template.findUnique calls
const mockDeliveryOption = (deliveryOption: object | null) => {
  vi.mocked(prisma.template.findUnique).mockResolvedValueOnce(
    deliveryOption !== null ? ({ deliveryOption } as never) : null
  );
};

const mockNotificationUsers = (
  users: { id: string; email: string; notificationsTemplates: { id: string }[] }[]
) => {
  vi.mocked(prisma.template.findUnique).mockResolvedValueOnce({ users } as never);
};

describe("isFormEligibleForNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false when the form has a delivery option set (legacy email delivery form)", async () => {
    mockDeliveryOption({ emailAddress: "recipient@example.com" });

    const result = await isFormEligibleForNotifications(mockFormId);

    expect(result).toBe(false);
    // Should short-circuit — user query should never be called
    expect(prisma.template.findUnique).toHaveBeenCalledTimes(1);
  });

  it("returns false when the form template is not found when fetching users", async () => {
    mockDeliveryOption(null); // no delivery option → continue
    vi.mocked(prisma.template.findUnique).mockResolvedValueOnce(null); // template not found for users query

    const result = await isFormEligibleForNotifications(mockFormId);

    expect(result).toBe(false);
  });

  it("returns false when the form has no associated users", async () => {
    mockDeliveryOption(null);
    mockNotificationUsers([]);

    const result = await isFormEligibleForNotifications(mockFormId);

    expect(result).toBe(false);
  });

  it("returns false when no users have notifications enabled", async () => {
    mockDeliveryOption(null);
    mockNotificationUsers([
      { id: "user-1", email: "user1@example.com", notificationsTemplates: [] },
      { id: "user-2", email: "user2@example.com", notificationsTemplates: [] },
    ]);

    const result = await isFormEligibleForNotifications(mockFormId);

    expect(result).toBe(false);
  });

  it("returns true when at least one user has notifications enabled", async () => {
    mockDeliveryOption(null);
    mockNotificationUsers([
      { id: "user-1", email: "user1@example.com", notificationsTemplates: [{ id: mockFormId }] },
    ]);

    const result = await isFormEligibleForNotifications(mockFormId);

    expect(result).toBe(true);
  });

  it("returns true when some users have notifications enabled and others do not", async () => {
    mockDeliveryOption(null);
    mockNotificationUsers([
      { id: "user-1", email: "user1@example.com", notificationsTemplates: [] },
      { id: "user-2", email: "user2@example.com", notificationsTemplates: [{ id: mockFormId }] },
    ]);

    const result = await isFormEligibleForNotifications(mockFormId);

    expect(result).toBe(true);
  });
});

describe("updateNotificationMarker", () => {
  const redisKey = `notification:formId:${mockFormId}`;
  let redis: Awaited<ReturnType<typeof getRedisInstance>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    redis = await getRedisInstance();
    await redis.flushall();
  });

  it("returns FIRST_EMAIL and sets marker to SINGLE_EMAIL_SENT when no prior marker exists", async () => {
    const result = await updateNotificationMarker(mockFormId);

    expect(result).toBe("FIRST_EMAIL");
    expect(await redis.get(redisKey)).toBe("SINGLE_EMAIL_SENT");
  });

  it("returns SECOND_EMAIL and advances marker to MULTIPLE_EMAIL_SENT when marker is SINGLE_EMAIL_SENT", async () => {
    await redis.set(redisKey, "SINGLE_EMAIL_SENT");

    const result = await updateNotificationMarker(mockFormId);

    expect(result).toBe("SECOND_EMAIL");
    expect(await redis.get(redisKey)).toBe("MULTIPLE_EMAIL_SENT");
  });

  it("returns null and does not change the marker when marker is MULTIPLE_EMAIL_SENT", async () => {
    await redis.set(redisKey, "MULTIPLE_EMAIL_SENT");

    const result = await updateNotificationMarker(mockFormId);

    expect(result).toBeNull();
    expect(await redis.get(redisKey)).toBe("MULTIPLE_EMAIL_SENT");
  });
});
