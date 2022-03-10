import { createMocks } from "node-mocks-http";
import temporary from "@pages/api/token/temporary";
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

let IsGCNotifyServiceAvailable = true;

const mockSendEmail = {
  sendEmail: jest.fn(() => {
    if (IsGCNotifyServiceAvailable) {
      return Promise.resolve();
    } else {
      return Promise.reject(new Error("something went wrong"));
    }
  }),
};

jest.mock("notifications-node-client", () => ({
  NotifyClient: jest.fn(() => mockSendEmail),
}));

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
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        authorization: `Bearer ${token}`,
      },
      body: {
        email: "test@cds-snc.ca",
      },
    });

    executeQuery.mockImplementation((client, sql) => {
      if (sql.includes('SELECT bearer_token as "bearerToken" FROM templates')) {
        return {
          rows: [{ bearerToken: token }],
          rowCount: 1,
        };
      } else {
        return {
          rows: [{ id: "1", email: "test@cds-snc.ca", active: true }],
          rowCount: 1,
        };
      }
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
      },
      body: JSON.stringify({
        method: null,
      }),
    });

    await temporary(req, res);
    expect(res.statusCode).toEqual(403);
  });

  it("throws error with invalid bearer token", async () => {
    const token = jwt.sign({ formID: "1" }, process.env.TOKEN_SECRET_WRONG, { expiresIn: "1y" });
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

  it("throws error with GC Notify service unavailable", async () => {
    IsGCNotifyServiceAvailable = false;

    const token = jwt.sign({ formID: "1" }, process.env.TOKEN_SECRET, { expiresIn: "1y" });
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        authorization: `Bearer ${token}`,
      },
      body: {
        email: "test@cds-snc.ca",
      },
    });

    executeQuery.mockImplementation((client, sql) => {
      if (sql.includes('SELECT bearer_token as "bearerToken" FROM templates')) {
        return {
          rows: [{ bearerToken: token }],
          rowCount: 1,
        };
      } else {
        return {
          rows: [{ id: "1", email: "test@cds-snc.ca", active: true }],
          rowCount: 1,
        };
      }
    });

    await temporary(req, res);
    expect(res.statusCode).toEqual(500);
  });
});
