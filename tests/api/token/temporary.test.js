import { createMocks } from "node-mocks-http";
import temporary from "../../../pages/api/token/temporary";
import executeQuery from "@lib/integration/queryManager";

jest.mock("next-auth/client");
jest.mock("@lib/integration/queryManager");

jest.mock("@lib/integration/dbConnector", () => {
  const mockClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return jest.fn(() => mockClient);
});

describe("TemporaryBearerToken tests", () => {
  beforeAll(() => {
    process.env.TOKEN_SECRET =
      "MLMv7j0TuYARvmNMmWXo6fKvM4o6nv/aUi9ryX38ZH+L1bkrnD1ObOQ8JAUmHCBq7Iy7otZcyAagBLHVKvvYaIpmMuxmARQ97jUVG16Jkpkp1wXOPsrF9zwew6TpczyHkHgX5EuLg2MeBuiT/qJACs1J0apruOOJCg/gOtkjB4c=";
  });
  afterAll(() => {
    delete process.env.TOKEN_SECRET;
  });

  it("works as expected", async () => {
    const { req, res } = createMocks({
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        authorization:
          "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NzAwOTE2NjUsImZvcm1JRCI6MX0.pxwKv_aG4lEHgK1Ex1IM1RjU4KlrZasxmBL1hUxQqPQ",
      },
      body: JSON.stringify({
        method: "POST",
        email: "test@cds-snc.ca",
      }),
    });

    executeQuery.mockReturnValue({
      rows: [{ id: "1", email: "test@cds-snc.ca", active: true }],
      rowCount: 1,
    });

    await temporary(req, res);
    expect(res.statusCode).toEqual(200);
  });

  it("throws error with invalid payload", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        authorization:
          "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NzAwOTE2NjUsImZvcm1JRCI6MX0.pxwKv_aG4lEHgK1Ex1IM1RjU4KlrZasxmBL1hUxQqPQ",
      },
      body: JSON.stringify({
        method: null,
      }),
    });

    await temporary(req, res);
    expect(res.statusCode).toEqual(400);
  });

  it("throws error with invalid bearer token", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        authorization:
          "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjEwMDAwMDAwMDAsInRlc3QiOiJ0ZXN0In0.ZFJFHQcR7ugOYi0nN9E_8yqxJJgUkyjtejVGYqgSHkc",
      },
      body: JSON.stringify({
        method: null,
      }),
    });

    await temporary(req, res);
    expect(res.statusCode).toEqual(403);
  });
});
