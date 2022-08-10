/**
 * @jest-environment node
 */

import { createMocks } from "node-mocks-http";
import temporary from "@pages/api/token/temporary";
import jwt, { Secret } from "jsonwebtoken";
import { prismaMock } from "@jestUtils";
import { getTokenById } from "@pages/api/id/[form]/bearer";

jest.mock("next-auth/react");
jest.mock("@pages/api/id/[form]/bearer");
const mockedGetTokenById = jest.mocked(getTokenById, true);

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
    const token = jwt.sign({ formID: "1" }, process.env.TOKEN_SECRET as Secret, {
      expiresIn: "1y",
    });
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
    mockedGetTokenById.mockResolvedValue({ bearerToken: token });
    (prismaMock.formUser.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      templateId: 1,
      email: "test@cds-snc.ca",
      active: true,
    });
    prismaMock.formUser.update.mockResolvedValue({
      id: "3",
      templateId: "1",
      email: "test@cds-snc.ca",
      temporaryToken: token,
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
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
    expect(res.statusCode).toEqual(403);
  });

  it("throws error with invalid bearer token", async () => {
    const token = jwt.sign({ formID: "1" }, process.env.TOKEN_SECRET_WRONG as Secret, {
      expiresIn: "1y",
    });
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
    expect(res.statusCode).toEqual(403);
  });

  it("throws error with GC Notify service unavailable", async () => {
    IsGCNotifyServiceAvailable = false;

    const token = jwt.sign({ formID: "1" }, process.env.TOKEN_SECRET as Secret, {
      expiresIn: "1y",
    });
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
    mockedGetTokenById.mockResolvedValue({ bearerToken: token });
    (prismaMock.formUser.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      templateId: 1,
      email: "test@cds-snc.ca",
      active: true,
    });
    prismaMock.formUser.update.mockResolvedValue({
      id: "3",
      templateId: "1",
      email: "test@cds-snc.ca",
      temporaryToken: token,
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await temporary(req, res);
    expect(res.statusCode).toEqual(500);
    expect(JSON.parse(res._getData())).toMatchObject({
      error: "GC Notify service failed to send temporary token",
    });
  });
});
