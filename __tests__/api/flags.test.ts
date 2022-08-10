/**
 * @jest-environment node
 */
import { createMocks } from "node-mocks-http";
import { getServerSession } from "next-auth/next";
import enable from "@pages/api/flags/[key]/enable";
import disable from "@pages/api/flags/[key]/disable";
import check from "@pages/api/flags/[key]/check";
import checkAllFlags from "@pages/api/flags";
import defaultFlags from "../../flag_initialization/default_flag_settings.json";
import * as flags from "@lib/flags";
import { UserRole } from "@lib/types/user-types";
jest.mock("next-auth/next");

//Needed in the typescript version of the test so types are inferred correclty
const mockGetSession = jest.mocked(getServerSession, true);

jest.mock("@lib/flags");

const mockedFlags = jest.mocked(flags, true);

const { checkOne, checkAll, enableFlag, disableFlag } = mockedFlags;

describe("Flags API endpoint", () => {
  describe("Authenticated", () => {
    beforeEach(() => {
      const mockSession = {
        expires: "1",
        user: {
          email: "forms@cds.ca",
          name: "forms user",
          role: UserRole.Administrator,
          userId: "1",
        },
      };
      mockGetSession.mockResolvedValue(mockSession);
    });
    afterEach(() => {
      mockGetSession.mockReset();
    });

    it("Enable a feature flag", async () => {
      enableFlag.mockImplementation(jest.fn());
      checkAll.mockResolvedValue(defaultFlags);

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

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toMatchObject(defaultFlags);
      expect(enableFlag).toHaveBeenCalledWith("featureFlag");
    });

    it("Disable a feature flag", async () => {
      disableFlag.mockImplementation(jest.fn());
      checkAll.mockResolvedValue(defaultFlags);

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

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toMatchObject(defaultFlags);
      expect(disableFlag).toHaveBeenCalledWith("featureFlag");
    });
  });

  describe("Unauthenticated", () => {
    it("Check a feature flag", async () => {
      (checkOne as jest.Mock).mockReturnValue(true);

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        url: "/api/flags/featureFlag/check",
        query: {
          key: "featureFlag",
        },
      });

      await check(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toMatchObject({ status: true });
      expect(checkOne).toHaveBeenCalledWith("featureFlag");
    });
    it("Gets a list of all feature flags", async () => {
      checkAll.mockResolvedValue(defaultFlags);

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
      expect(res._getJSONData()).toMatchObject(defaultFlags);
    });
  });
});
