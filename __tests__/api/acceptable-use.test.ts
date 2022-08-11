import { createMocks } from "node-mocks-http";
import acceptableUse from "@pages/api/acceptableuse";
import { acceptableUseCache } from "@lib/cache";

jest.mock("@lib/cache");
const mockedAcceptableUseCache = jest.mocked(acceptableUseCache, true);
const { set } = mockedAcceptableUseCache;

describe("Test acceptable use endpoint", () => {
  it("Should save userID to redis cache", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        userID: 1,
      },
    });

    await acceptableUse(req, res);
    expect(res.statusCode).toBe(200);
  });

  it("Should return 404 if userID is undefined", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        userID: undefined,
      },
    });
    await acceptableUse(req, res);
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ error: "Bad request" }));
  });

  it("Should return 500 for any cache errors", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        userID: 2,
      },
    });

    set.mockImplementationOnce(() => {
      throw new Error("Could not connect to cache");
    });
    await acceptableUse(req, res);
    expect(res.statusCode).toBe(500);
  });
});
