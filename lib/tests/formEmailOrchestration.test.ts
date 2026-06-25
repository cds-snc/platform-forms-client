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

// Unused in isFormEligibleForEmails but imported at module level in notifications.ts
vi.mock("@gcforms/connectors", () => ({
  notification: {
    sendDeferred: vi.fn(),
    sendImmediate: vi.fn(),
    enqueueDeferred: vi.fn(),
  },
  GCNotifyConnector: {
    default: vi.fn(() => ({
      sendEmail: vi.fn(),
    })),
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

import { isFormEligibleForEmails, updateNotificationMarker } from "@lib/formEmailOrchestration";
import { prisma } from "@gcforms/database";
import { getRedisInstance } from "@lib/integration/redisConnector";

const mockFormId = "test-form-id";

// Helper to set up the single merged prisma.template.findUnique call
const mockTemplate = (
  options: {
    deliveryOption?: object | null;
    users?: { id: string; notificationsTemplates: { id: string }[] }[];
  } | null
) => {
  if (options === null) {
    vi.mocked(prisma.template.findUnique).mockResolvedValueOnce(null);
  } else {
    vi.mocked(prisma.template.findUnique).mockResolvedValueOnce({
      deliveryOption: options.deliveryOption ?? null,
      users: options.users ?? [],
    } as never);
  }
};

describe("isFormEligibleForEmails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false when the form has a delivery option set (legacy email delivery form)", async () => {
    mockTemplate({ deliveryOption: { emailAddress: "recipient@example.com" }, users: [] });

    const result = await isFormEligibleForEmails(mockFormId);

    expect(result).toBe(false);
    expect(prisma.template.findUnique).toHaveBeenCalledTimes(1);
  });

  it("returns false when the form template is not found", async () => {
    mockTemplate(null);

    const result = await isFormEligibleForEmails(mockFormId);

    expect(result).toBe(false);
  });

  it("returns false when the form has no associated users", async () => {
    mockTemplate({ users: [] });

    const result = await isFormEligibleForEmails(mockFormId);

    expect(result).toBe(false);
  });

  it("returns false when no users have notifications enabled", async () => {
    mockTemplate({
      users: [
        { id: "user-1", notificationsTemplates: [] },
        { id: "user-2", notificationsTemplates: [] },
      ],
    });

    const result = await isFormEligibleForEmails(mockFormId);

    expect(result).toBe(false);
  });

  it("returns true when at least one user has notifications enabled", async () => {
    mockTemplate({
      users: [{ id: "user-1", notificationsTemplates: [{ id: mockFormId }] }],
    });

    const result = await isFormEligibleForEmails(mockFormId);

    expect(result).toBe(true);
  });

  it("returns true when some users have notifications enabled and others do not", async () => {
    mockTemplate({
      users: [
        { id: "user-1", notificationsTemplates: [] },
        { id: "user-2", notificationsTemplates: [{ id: mockFormId }] },
      ],
    });

    const result = await isFormEligibleForEmails(mockFormId);

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

  it("returns FIRST_EMAIL and resets the marker when an unexpected value is present", async () => {
    await redis.set(redisKey, "");

    const result = await updateNotificationMarker(mockFormId);

    expect(result).toBe("FIRST_EMAIL");
    expect(await redis.get(redisKey)).toBe("SINGLE_EMAIL_SENT");
  });
});
