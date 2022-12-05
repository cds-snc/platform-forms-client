/**
 * @jest-environment node
 */
/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createMocks, RequestMethod } from "node-mocks-http";
import support from "@pages/api/request/support";
import { unstable_getServerSession } from "next-auth/next";
import { Session } from "next-auth";

//Needed in the typescript version of the test so types are inferred correclty
const mockGetSession = jest.mocked(unstable_getServerSession, { shallow: true });
jest.mock("next-auth/next");

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

describe("Request support API test (without active session)", () => {
  it("Should be able to use the API without an active session", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        supportType: "support",
        name: "name",
        email: "email@email.com",
        request: "request",
        description: "description",
      },
    });

    await support(req, res);

    expect(res.statusCode).toEqual(200);
  });
});

describe("Request publishing permission API tests (with active session)", () => {
  beforeEach(() => {
    const mockSession: Session = {
      expires: "1",
      user: {
        id: "1",
        email: "a@b.com",
        name: "Testing Forms",
        privileges: [],
      },
    };

    mockGetSession.mockResolvedValue(mockSession);
  });

  afterEach(() => {
    mockGetSession.mockReset();
  });

  it.each(["GET", "PUT", "DELETE"])(
    "Should not be able to use the API with unsupported HTTP methods",
    async (httpMethod) => {
      const { req, res } = createMocks({
        method: httpMethod as RequestMethod,
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          supportType: "support",
          name: "name",
          email: "email@email.com",
          request: "request",
          description: "description",
        },
      });

      await support(req, res);

      expect(res.statusCode).toEqual(403);
    }
  );

  it("Should not be able to use the API if payload is invalid", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        email: "email@email.com",
      },
    });

    await support(req, res);

    expect(res.statusCode).toEqual(404);
    expect(JSON.parse(res._getData())).toMatchObject({ error: "Malformed request" });
  });

  it("Should succeed if payload is valid", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        supportType: "support",
        name: "name",
        email: "email@email.com",
        request: "request",
        description: "description",
      },
    });

    await support(req, res);

    expect(res.statusCode).toEqual(200);
  });

  it("Should fail if GC Notify service is unavailable", async () => {
    IsGCNotifyServiceAvailable = false;

    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        supportType: "support",
        name: "name",
        email: "email@email.com",
        request: "request",
        description: "description",
      },
    });

    await support(req, res);

    expect(res.statusCode).toEqual(500);
    expect(JSON.parse(res._getData())).toMatchObject({
      error: "Internal Service Error: Failed to send request",
    });
  });
});
