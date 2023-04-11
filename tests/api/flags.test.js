import { createMocks } from "node-mocks-http";
import client from "next-auth/client";
import enable from "@pages/api/flags/[key]/enable";
import disable from "@pages/api/flags/[key]/disable";
import check from "@pages/api/flags/[key]/check";
import checkAllFlags from "@pages/api/flags";
import defaultFlags from "../../flag_initialization/default_flag_settings.json";
import { enableFlag, disableFlag, checkAll, checkOne } from "@lib/flags";
jest.mock("next-auth/client");
jest.mock("@lib/flags");

describe("Flags API endpoint", () => {
  it("Enable a feature flag", async () => {
    enableFlag.mockImplementation(() => {});
    checkAll.mockReturnValue(defaultFlags);

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
    disableFlag.mockImplementation(() => {});
    checkAll.mockReturnValue(defaultFlags);

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
  it("Check a feature flag", async () => {
    checkOne.mockReturnValue(true);

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
    checkAll.mockReturnValue(defaultFlags);

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
