import { createMocks } from "node-mocks-http";
import acceptableUse from "@pages/api/acceptableuse";
import * as acceptableUseCache from "@lib/acceptableUseCache";
import { getCsrfToken } from "next-auth/react";

jest.mock("next-auth/react");
jest.mock("@lib/acceptableUseCache");
const mockedAcceptableUseCache = jest.mocked(acceptableUseCache, true);
const { setAcceptableUse } = mockedAcceptableUseCache;

describe("Test acceptable use endpoint", () => {
  getCsrfToken.mockReturnValue("CsrfToken");

  it("Should set acceptableuse value to true for userID 1 and return 200", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        "x-csrf-token": "CsrfToken",
      },
      body: {
        userID: 1,
      },
    });
    await acceptableUse(req, res);
    expect(res.statusCode).toBe(200);
  });

  it("Should return 404 for undefined userID", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        "x-csrf-token": "CsrfToken",
      },
      body: {
        userID: undefined,
      },
    });
    await acceptableUse(req, res);
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ error: "Bad request" }));
  });

  it("Should throw an error and return 500 status code", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        "x-csrf-token": "CsrfToken",
      },
      body: {
        userID: 2,
      },
    });

    setAcceptableUse.mockImplementationOnce(() => {
      throw new Error("Could not connect to cache");
    });
    await acceptableUse(req, res);
    expect(res.statusCode).toBe(500);
  });
});
