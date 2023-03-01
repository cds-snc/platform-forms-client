/**
 * @jest-environment node
 */
import { createMocks } from "node-mocks-http";
import { getServerSession } from "next-auth/next";
import enable from "@pages/api/flags/[key]/enable";
import disable from "@pages/api/flags/[key]/disable";
import check from "@pages/api/flags/[key]/check";
import checkAllFlags from "@pages/api/flags";
import { ViewApplicationSettings, ManageApplicationSettings } from "__utils__/permissions";
import Redis from "ioredis-mock";
const redis = new Redis();

jest.mock("@lib/integration/redisConnector", () => ({
  getRedisInstance: jest.fn(() => redis),
}));

jest.mock("next-auth/next");

//Needed in the typescript version of the test so types are inferred correclty
const mockGetSession = jest.mocked(getServerSession, { shallow: true });

describe("Flags API endpoint", () => {
  beforeAll(() => {
    // Adding URL to process.env because we are mocking out Redis for these tests
    process.env.REDIS_URL = "test_url";
  });
  afterAll(() => {
    delete process.env.REDIS_URL;
  });
  describe("Authenticated", () => {
    describe("ViewApplicationSettings", () => {
      beforeEach(async () => {
        const mockSession = {
          expires: "1",
          user: {
            email: "forms@cds.ca",
            name: "forms user",
            id: "1",
            privileges: ViewApplicationSettings,
          },
        };
        mockGetSession.mockResolvedValue(mockSession);
        // Intialize mockRedis with default flags
        const testFlags = {
          flag1: true,
          flag2: false,
        };
        const promises = [];
        for (const [key, value] of Object.entries(testFlags)) {
          promises.push(
            redis
              .multi()
              .sadd("flags", key)
              .set(`flag:${key}`, value ? "1" : "0")
              .exec()
          );
        }
        await Promise.all(promises);
      });
      afterEach(() => {
        redis.flushall();
        mockGetSession.mockReset();
      });

      it("Enable a feature flag", async () => {
        const { req, res } = createMocks({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:3000",
          },
          url: "/api/flags/featureFlag/enable",
          query: {
            key: "featureFlag",
          },
        });

        await enable(req, res);

        expect(res.statusCode).toBe(403);
        expect(res._getJSONData()).toMatchObject({ error: "Forbidden" });
      });

      it("Disable a feature flag", async () => {
        const { req, res } = createMocks({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:3000",
          },
          url: "/api/flags/featureFlag/disable",
          query: {
            key: "featureFlag",
          },
        });

        await disable(req, res);

        expect(res.statusCode).toBe(403);
        expect(res._getJSONData()).toMatchObject({ error: "Forbidden" });
      });
      it("Gets a list of all feature flags", async () => {
        const { req, res } = createMocks({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:3000",
          },
          url: "/api/flags/",
        });

        await checkAllFlags(req, res);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toMatchObject({ flag1: true, flag2: false });
      });
    });
    describe("ManageApplicationSettings", () => {
      beforeEach(async () => {
        const mockSession = {
          expires: "1",
          user: {
            email: "forms@cds.ca",
            name: "forms user",
            id: "1",
            privileges: ManageApplicationSettings,
          },
        };
        mockGetSession.mockResolvedValue(mockSession);

        // Intialize mockRedis with default flags
        const testFlags = {
          flag1: true,
          flag2: false,
        };
        const promises = [];
        for (const [key, value] of Object.entries(testFlags)) {
          promises.push(
            redis
              .multi()
              .sadd("flags", key)
              .set(`flag:${key}`, value ? "1" : "0")
              .exec()
          );
        }
        await Promise.all(promises);
      });
      afterEach(() => {
        redis.flushall();
        mockGetSession.mockReset();
      });

      it("Enable a feature flag", async () => {
        const { req, res } = createMocks({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:3000",
          },
          url: "/api/flags/flag2/enable",
          query: {
            key: "flag2",
          },
        });

        await enable(req, res);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toMatchObject({ flag2: true });
      });

      it("Disable a feature flag", async () => {
        const { req, res } = createMocks({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:3000",
          },
          url: "/api/flags/flag1/disable",
          query: {
            key: "flag1",
          },
        });

        await disable(req, res);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toMatchObject({ flag1: false });
      });
      it("Gets a list of all feature flags", async () => {
        const { req, res } = createMocks({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:3000",
          },
          url: "/api/flags/",
        });

        await checkAllFlags(req, res);

        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toMatchObject({ flag1: true, flag2: false });
      });
    });
  });

  describe("Unauthenticated", () => {
    beforeAll(async () => {
      // Intialize mockRedis with default flags
      const testFlags = {
        flag1: true,
        flag2: false,
      };
      const promises = [];
      for (const [key, value] of Object.entries(testFlags)) {
        promises.push(
          redis
            .multi()
            .sadd("flags", key)
            .set(`flag:${key}`, value ? "1" : "0")
            .exec()
        );
      }
      await Promise.all(promises);
    });
    afterAll(() => {
      redis.flushall();
    });

    it("Check a feature flag", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        url: "/api/flags/flag1/check",
        query: {
          key: "flag1",
        },
      });

      await check(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toMatchObject({ status: true });
    });
  });
});
