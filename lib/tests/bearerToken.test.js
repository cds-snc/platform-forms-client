import { createMocks } from "node-mocks-http";
import bearerToken from "@lib/middleware/bearerToken";
import executeQuery from "@lib/integration/queryManager";
import jwt from "jsonwebtoken";

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

describe("bearerToken tests", () => {
  beforeAll(() => {
    process.env.TOKEN_SECRET = "some_secret_some_secret_some_secret_some_secret";
  });
  afterAll(() => {
    delete process.env.TOKEN_SECRET;
  });

  it("contains a valid bearer token", async () => {
    const token = jwt.sign({ formID: "1" }, process.env.TOKEN_SECRET, { expiresIn: "1y" });
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    });

    executeQuery.mockReturnValue({
      rows: [{ bearerToken: "test.bearerToken" }],
      rowCount: 1,
    });

    const handler = async (req, res) => {
      res.statusCode = 200;
    };

    await bearerToken(handler)(req, res);
    expect(res.statusCode).toBe(200);
  });

  it("checks that there is no valid bearer token in the database", async () => {
    const token = jwt.sign({ formID: "1" }, process.env.TOKEN_SECRET, { expiresIn: "1y" });
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    });

    executeQuery.mockReturnValue({
      rows: [],
      rowCount: 0,
    });

    const handler = async (req, res) => {
      res.statusCode = 200;
    };

    await bearerToken(handler)(req, res);
    expect(res.statusCode).toBe(403);
  });

  it("checks that the authorization header does not contains a valid bearer token", async () => {
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
    const token = jwt.sign({ formID: "1", exp: 1636501665 }, process.env.TOKEN_SECRET);
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    });

    const handler = async (req, res) => {
      res.statusCode = 200;
    };

    await bearerToken(handler)(req, res);
    expect(res.statusCode).toBe(403);
  });
});
