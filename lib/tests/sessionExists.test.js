/**
 * @jest-environment node
 */

import { createMocks } from "node-mocks-http";
import { unstable_getServerSession } from "next-auth/next";
import { sessionExists } from "@lib/middleware";
import { UserRole } from "@prisma/client";

jest.mock("next-auth/next");

describe("Test a session middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Shouldn't allow a request with an invalid session", async () => {
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    await sessionExists()(req, res);
    expect(JSON.parse(res._getData()).error).toEqual("Access Denied");
    expect(res.statusCode).toBe(403);
  });

  it("Shouldn't allow a request without being admin", async () => {
    const mockSession = {
      expires: "1",
      user: {
        email: "test@cds.ca",
        name: "Testing session middleware",
        image: "null",
        role: UserRole.PROGRAM_ADMINISTRATOR,
      },
    };
    unstable_getServerSession.mockReturnValueOnce(mockSession);
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    await sessionExists()(req, res);
    expect(res.statusCode).toBe(403);
  });

  it("Should allow a request with being admin", async () => {
    const mockSession = {
      expires: "1",
      user: {
        email: "test@cds.ca",
        name: "Testing session middleware",
        image: "null",
        role: UserRole.ADMINISTRATOR,
      },
    };
    unstable_getServerSession.mockReturnValueOnce(mockSession);
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    await sessionExists()(req, res);
    expect(res.statusCode).toBe(200);
  });

  it("Shouldn't allow a request method that requires authentication", async () => {
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    await sessionExists(["GET"])(req, res);
    expect(res.statusCode).toBe(403);
  });

  it("Should allow a request method that doesn't requires authentication", async () => {
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    await sessionExists(["POST"])(req, res);
    expect(res.statusCode).toBe(200);
  });
});
