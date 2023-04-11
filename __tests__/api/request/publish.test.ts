/**
 * @jest-environment node
 */
/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createMocks, RequestMethod } from "node-mocks-http";
import publish from "@pages/api/request/publish";
import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";

//Needed in the typescript version of the test so types are inferred correctly
const mockGetSession = jest.mocked(getServerSession, { shallow: true });
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

describe("Request publishing permission API tests (without active session)", () => {
  it("Should not be able to use the API without an active session", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        managerEmail: "manager@cds-snc.ca",
        department: "department",
      },
    });

    await publish(req, res);

    expect(res.statusCode).toEqual(401);
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
          managerEmail: "manager@cds-snc.ca",
          department: "department",
        },
      });

      await publish(req, res);

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
        managerEmail: "manager@cds-snc.ca",
      },
    });

    await publish(req, res);

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
        managerEmail: "manager@cds-snc.ca",
        department: "department",
        goals: "do something",
      },
    });

    await publish(req, res);

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
        managerEmail: "manager@cds-snc.ca",
        department: "department",
        goals: "do something",
      },
    });

    await publish(req, res);

    expect(res.statusCode).toEqual(500);
    expect(JSON.parse(res._getData())).toMatchObject({ error: "Failed to send request" });
  });
});
