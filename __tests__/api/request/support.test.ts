/**
 * @jest-environment node
 */
/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createMocks, RequestMethod } from "node-mocks-http";
import support from "@pages/api/request/support";
import { getCsrfToken } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { mocked } from "jest-mock";
import { Session } from "next-auth";

const mockGetCSRFToken = mocked(getCsrfToken, { shallow: true });

jest.mock("next-auth/react");

//Needed in the typescript version of the test so types are inferred correctly
const mockGetSession = jest.mocked(getServerSession, { shallow: true });
jest.mock("next-auth/next");

jest.mock("@lib/integration/freshdesk", () => ({
  createTicket: jest.fn(() => Promise.resolve()),
}));

describe("Support email API tests - WITHOUT an active session", () => {
  beforeEach(() => {
    mockGetCSRFToken.mockResolvedValueOnce("valid_csrf");
  });

  afterEach(() => {
    mockGetCSRFToken.mockReset();
  });

  runAPITests();
});

describe("Support email API tests - WITH an active session", () => {
  beforeEach(() => {
    const mockSession: Session = {
      expires: "1",
      user: {
        id: "1",
        email: "a@b.com",
        name: "Testing Forms",
        privileges: [],
        acceptableUse: true,
        hasSecurityQuestions: true,
      },
    };
    mockGetSession.mockResolvedValue(mockSession);
    mockGetCSRFToken.mockResolvedValueOnce("valid_csrf");
  });

  afterEach(() => {
    mockGetSession.mockReset();
  });

  runAPITests();
});

function runAPITests() {
  it("Should fail if CSRF token is not valid", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        "X-CSRF-Token": "invalid_csrf",
      },
      body: {
        supportType: "support",
        name: "name",
        email: "email@email.com",
        department: "Department",
        branch: "Branch",
        jobTitle: "Job Title",
        request: "request",
        description: "description",
      },
    });

    await support(req, res);

    expect(res.statusCode).toEqual(403);
  });

  it("Should succeed if CSRF token is valid", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": "valid_csrf",
        Origin: "http://localhost:3000",
      },
      body: {
        supportType: "support",
        name: "name",
        email: "email@email.com",
        department: "Department",
        branch: "Branch",
        jobTitle: "Job Title",
        request: "request",
        description: "description",
      },
    });

    await support(req, res);
    expect(res.statusCode).toEqual(200);
  });

  it.each(["GET", "PUT", "DELETE"])(
    "Should not be able to use the API with unsupported HTTP methods",
    async (httpMethod) => {
      const { req, res } = createMocks({
        method: httpMethod as RequestMethod,
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
          "X-CSRF-Token": "valid_csrf",
        },
        body: {
          supportType: "support",
          name: "name",
          email: "email@email.com",
          request: "request",
          department: "Department",
          branch: "Branch",
          jobTitle: "Job Title",
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
        "X-CSRF-Token": "valid_csrf",
      },
      body: {
        email: "email@email.com",
      },
    });

    await support(req, res);

    expect(res.statusCode).toEqual(400);
    expect(JSON.parse(res._getData())).toMatchObject({ error: "Malformed request" });
  });
}
