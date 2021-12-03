import { createMocks } from "node-mocks-http";
import bearerToken from "../middleware/bearerToken";

describe("bearerToken tests", () => {
  beforeAll(() => {
    process.env.TOKEN_SECRET =
      "MLMv7j0TuYARvmNMmWXo6fKvM4o6nv/aUi9ryX38ZH+L1bkrnD1ObOQ8JAUmHCBq7Iy7otZcyAagBLHVKvvYaIpmMuxmARQ97jUVG16Jkpkp1wXOPsrF9zwew6TpczyHkHgX5EuLg2MeBuiT/qJACs1J0apruOOJCg/gOtkjB4c=";
  });
  afterAll(() => {
    delete process.env.TOKEN_SECRET;
  });

  it("contains a valid bearer token", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization:
          "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NzAwOTE2NjUsInRlc3QiOiJ0ZXN0In0.emQOmEtFmg16QulAI2MD_0O5o5X1-xScsaTEVsAHA3k",
      },
      body: JSON.stringify({
        method: "INSERT",
      }),
    });

    const handler = async (req, res) => {
      res.statusCode = 200;
    };

    await bearerToken(handler)(req, res);
    expect(res.statusCode).toBe(200);
  });

  it("does not contains a valid bearer token", async () => {
    const { req, res } = createMocks({
      method: "POST",
    });

    const handler = async (req, res) => {
      res.statusCode = 200;
    };

    await bearerToken(handler)(req, res);
    expect(res.statusCode).toBe(403);
  });

  it("rejects an expired bearer token", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization:
          "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjEwMDAwMDAwMDAsInRlc3QiOiJ0ZXN0In0.ZFJFHQcR7ugOYi0nN9E_8yqxJJgUkyjtejVGYqgSHkc",
      },
      body: JSON.stringify({
        method: "INSERT",
      }),
    });

    const handler = async (req, res) => {
      res.statusCode = 200;
    };

    await bearerToken(handler)(req, res);
    expect(res.statusCode).toBe(403);
  });
});
