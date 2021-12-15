import { createMocks } from "node-mocks-http";
import temporary from "../../../pages/api/token/temporary";
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

describe("TemporaryBearerToken tests", () => {
  beforeAll(() => {
    process.env.TOKEN_SECRET = "some_secret_some_secret_some_secret_some_secret";
    process.env.TOKEN_SECRET_WRONG = "wrong_secret_wrong_secret_wrong_secret_wrong_secret";
  });
  afterAll(() => {
    delete process.env.TOKEN_SECRET;
    delete process.env.TOKEN_SECRET_WRONG;
  });

  it("creates a temporary token and updates the database", async () => {
    const token = jwt.sign({ formID: "1" }, process.env.TOKEN_SECRET, { expiresIn: "1y" });
    const { req, res } = createMocks({
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        authorization: `Bearer ${token}`,
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
    const token = jwt.sign({ formID: "1" }, process.env.TOKEN_SECRET, { expiresIn: "1y" });
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        method: null,
      }),
    });

    await temporary(req, res);
    expect(res.statusCode).toEqual(400);
  });

  it("throws error with invalid bearer token", async () => {
    const token = jwt.sign({ formID: "1", exp: 1636501665 }, process.env.TOKEN_SECRET_WRONG);
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        method: null,
      }),
    });

    await temporary(req, res);
    expect(res.statusCode).toEqual(403);
  });
});
