/**
 * @jest-environment node
 */
/* eslint-disable  @typescript-eslint/no-explicit-any */
import Redis from "ioredis-mock";
import { createMocks } from "node-mocks-http";
import temporary from "@pages/api/token/temporary";
import jwt, { Secret } from "jsonwebtoken";
import { prismaMock } from "@jestUtils";

const redis = new Redis();

jest.mock("@lib/integration/redisConnector", () => ({
  getRedisInstance: jest.fn(() => redis),
}));

jest.mock("next-auth/react");
jest.mock("@pages/api/id/[form]/bearer");

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

jest.mock("@lib/integration/notifyConnector", () => ({
  getNotifyInstance: jest.fn(() => mockSendEmail),
}));

describe.skip("TemporaryBearerToken tests", () => {
  beforeAll(() => {
    process.env.TOKEN_SECRET = "some_secret_some_secret_some_secret_some_secret";
    process.env.TOKEN_SECRET_WRONG = "wrong_secret_wrong_secret_wrong_secret_wrong_secret";
  });

  afterAll(() => {
    delete process.env.TOKEN_SECRET;
    delete process.env.TOKEN_SECRET_WRONG;
  });

  it("creates a temporary token and updates the database", async () => {
    const token = jwt.sign(
      { formID: "1test0form00000id000asdf11" },
      process.env.TOKEN_SECRET as Secret,
      {
        expiresIn: "1y",
      }
    );
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
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      bearerToken: token,
    });

    (prismaMock.apiUser.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      templateId: 1,
      email: "test@cds-snc.ca",
      active: true,
    });
    prismaMock.apiUser.update.mockResolvedValue({
      id: "3",
      templateId: "1",
      email: "test@cds-snc.ca",
      temporaryToken: token,
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
      lastLogin: new Date(),
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
      body: {
        method: null,
      },
    });

    await temporary(req, res);
    expect(res.statusCode).toEqual(400);
  });

  it("throws error with invalid form access token", async () => {
    const token = jwt.sign(
      { formID: "test0form00000id000asdf11" },
      process.env.TOKEN_SECRET_WRONG as Secret,
      {
        expiresIn: "1y",
      }
    );
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

    // Mock bearer token not being found
    prismaMock.template.findUnique.mockResolvedValue(null);

    await temporary(req, res);
    expect(res.statusCode).toEqual(401);
  });

  it("throws error when GC Notify service is unavailable", async () => {
    IsGCNotifyServiceAvailable = false;

    const token = jwt.sign(
      { formID: "test0form00000id000asdf11" },
      process.env.TOKEN_SECRET as Secret,
      {
        expiresIn: "1y",
      }
    );
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
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      bearerToken: token,
    });
    (prismaMock.apiUser.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      templateId: 1,
      email: "test@cds-snc.ca",
      active: true,
    });
    prismaMock.apiUser.update.mockResolvedValue({
      id: "3",
      templateId: "1",
      email: "test@cds-snc.ca",
      temporaryToken: token,
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
      lastLogin: new Date(),
    });

    await temporary(req, res);
    expect(res.statusCode).toEqual(500);
  });

  it("throws error when the authorization header does not contains a valid form access token", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {
        email: "test@cds-snc.ca",
      },
    });

    await temporary(req, res);
    expect(res.statusCode).toEqual(401);
  });

  it("throws error when using expired form access token", async () => {
    const token = jwt.sign(
      { formID: "test0form00000id000asdf11", exp: 1636501665 },
      process.env.TOKEN_SECRET as Secret
    );

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
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      bearerToken: token,
    });
    (prismaMock.apiUser.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      templateId: 1,
      email: "test@cds-snc.ca",
      active: true,
    });
    prismaMock.apiUser.update.mockResolvedValue({
      id: "3",
      templateId: "1",
      email: "test@cds-snc.ca",
      temporaryToken: token,
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
      lastLogin: new Date(),
    });

    await temporary(req, res);
    expect(res.statusCode).toEqual(401);
  });
});
