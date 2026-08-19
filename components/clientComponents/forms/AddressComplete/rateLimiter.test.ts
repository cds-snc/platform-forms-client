import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

vi.mock("@root/lib/appSettings", () => ({
  getAppSetting: vi.fn(),
}));

vi.mock("@root/lib/integration/redisConnector", () => ({
  getRedisInstance: vi.fn(),
}));

vi.mock("@lib/logger", () => ({
  logMessage: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

import { getAppSetting } from "@root/lib/appSettings";
import { getRedisInstance } from "@root/lib/integration/redisConnector";
import { logMessage } from "@lib/logger";
import { checkRateLimited, incrementAndCheckRateLimiting } from "./rateLimiter";

const TEST_IP = "111.111.111.111";
const TEST_KEY = `address-complete:rate-limit:${TEST_IP}`;
const RATE_LIMIT_MAX = 2;
const RATE_LIMIT_WINDOW = 60;

const makePipeline = () => ({
  incr: vi.fn(),
  expire: vi.fn(),
  exec: vi.fn(),
});

const makeRedis = (pipeline: ReturnType<typeof makePipeline>) => ({
  get: vi.fn(),
  pipeline: vi.fn(() => pipeline),
});

describe("AddressComplete rate limiter", () => {
  let pipeline: ReturnType<typeof makePipeline>;
  let redis: ReturnType<typeof makeRedis>;

  beforeEach(() => {
    vi.clearAllMocks();
    pipeline = makePipeline();
    redis = makeRedis(pipeline);

    (getAppSetting as Mock).mockImplementation(async (setting: string) => {
      if (setting === "addressCompleteRetrieveRateLimitMax") return String(RATE_LIMIT_MAX);
      if (setting === "addressCompleteRateLimitWindowSeconds") return String(RATE_LIMIT_WINDOW);
      throw new Error(`Unexpected setting: ${setting}`);
    });
    (getRedisInstance as Mock).mockResolvedValue(redis);
    redis.get.mockResolvedValue("0");
    // Default pipeline result: first increment returns count 1, no error
    pipeline.exec.mockResolvedValue([
      [null, 1],
      [null, 1],
    ]);
  });

  describe("checkRateLimited", () => {
    it("returns false and does not increment when the stored count is below the limit", async () => {
      redis.get.mockResolvedValue("1");

      await expect(checkRateLimited(TEST_IP)).resolves.toBe(false);
      expect(redis.get).toHaveBeenCalledWith(TEST_KEY);
      expect(pipeline.incr).not.toHaveBeenCalled();
    });

    it("returns true and does not log when count is above the limit", async () => {
      redis.get.mockResolvedValue("3");

      await expect(checkRateLimited(TEST_IP)).resolves.toBe(true);
      expect(logMessage.warn).not.toHaveBeenCalled();
    });

    it("fails open and does not throw when Redis is unavailable", async () => {
      (getRedisInstance as Mock).mockRejectedValue(new Error("Redis connection refused"));

      await expect(checkRateLimited(TEST_IP)).resolves.toBe(false);
      expect(logMessage.error).toHaveBeenCalledOnce();
    });

    it("fails open and does not throw when a setting is invalid", async () => {
      (getAppSetting as Mock).mockResolvedValue("not-a-number");

      await expect(checkRateLimited(TEST_IP)).resolves.toBe(false);
      expect(logMessage.error).toHaveBeenCalledOnce();
    });
  });

  describe("incrementAndCheckRateLimiting", () => {
    it("increments the counter and returns false when below the limit", async () => {
      pipeline.exec.mockResolvedValue([
        [null, 1],
        [null, 1],
      ]);

      await expect(incrementAndCheckRateLimiting(TEST_IP)).resolves.toBe(false);
      expect(pipeline.incr).toHaveBeenCalledWith(TEST_KEY);
      expect(pipeline.expire).toHaveBeenCalledWith(TEST_KEY, RATE_LIMIT_WINDOW);
      // Does not perform a separate Redis GET — uses the pipeline result directly
      expect(redis.get).not.toHaveBeenCalled();
      expect(logMessage.warn).not.toHaveBeenCalled();
    });

    it("increments the counter, rate limits, and logs once when the count first crosses the limit", async () => {
      // count === max + 1 triggers the one-time warning
      pipeline.exec.mockResolvedValue([
        [null, RATE_LIMIT_MAX + 1],
        [null, 1],
      ]);

      await expect(incrementAndCheckRateLimiting(TEST_IP)).resolves.toBe(true);
      expect(pipeline.incr).toHaveBeenCalledWith(TEST_KEY);
      expect(pipeline.expire).toHaveBeenCalledWith(TEST_KEY, RATE_LIMIT_WINDOW);
      expect(redis.get).not.toHaveBeenCalled();
      expect(logMessage.warn).toHaveBeenCalledOnce();
    });

    it("fails open and does not throw when Redis is unavailable", async () => {
      (getRedisInstance as Mock).mockRejectedValue(new Error("Redis connection refused"));

      await expect(incrementAndCheckRateLimiting(TEST_IP)).resolves.toBe(false);
      expect(logMessage.error).toHaveBeenCalledOnce();
    });

    it("fails open and does not throw when a setting is invalid", async () => {
      (getAppSetting as Mock).mockResolvedValue("not-a-number");

      await expect(incrementAndCheckRateLimiting(TEST_IP)).resolves.toBe(false);
      expect(logMessage.error).toHaveBeenCalledOnce();
    });
  });

  describe("checkRateLimited regression: repeated Find checks do not increment or log", () => {
    it("reads Redis twice but never increments or warns on consecutive calls above the limit", async () => {
      redis.get.mockResolvedValue("3");

      await expect(checkRateLimited(TEST_IP)).resolves.toBe(true);
      await expect(checkRateLimited(TEST_IP)).resolves.toBe(true);

      expect(redis.get).toHaveBeenCalledTimes(2);
      expect(pipeline.incr).not.toHaveBeenCalled();
      expect(logMessage.warn).not.toHaveBeenCalled();
    });
  });
});
