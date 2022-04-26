import { createMocks } from "node-mocks-http";
import client from "next-auth/client";
import enable from "@pages/api/flags/[key]/enable";
import disable from "@pages/api/flags/[key]/disable";
import { logAdminActivity } from "@lib/adminLogs";

jest.mock("next-auth/client");

jest.mock("@lib/adminLogs", () => ({
  logAdminActivity: jest.fn(),
}));

describe("Flags API endpoint", () => {
  describe("Enable", () => {
    it("Should log admin activity if API call completed successfully", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms user", admin: true, id: 1 },
      };
      client.getSession.mockReturnValue(mockSession);

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
      });

      await enable(req, res);

      expect(res.statusCode).toBe(200);
      expect(logAdminActivity).toHaveBeenCalledWith(
        1,
        "Update",
        "EnableFeature",
        "Feature: undefined has been enabled"
      );
    });
  });

  describe("Disable", () => {
    it("Should log admin activity if API call completed successfully", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms user", admin: true, id: 1 },
      };
      client.getSession.mockReturnValue(mockSession);

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
      });

      await disable(req, res);

      expect(res.statusCode).toBe(200);
      expect(logAdminActivity).toHaveBeenCalledWith(
        1,
        "Update",
        "DisableFeature",
        "Feature: undefined has been disabled"
      );
    });
  });
});
