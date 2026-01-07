import { describe, it, expect, vi, beforeEach } from "vitest";
import { authCheckAndThrow } from "@lib/actions";
import { sessionExists } from "@lib/middleware";
import { MiddlewareReturn, UserAbility } from "@lib/types";

vi.mock("@lib/actions");

const mockedAuth = vi.mocked(authCheckAndThrow);

describe("Test a session middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Shouldn't allow a request with an invalid session", async () => {
    mockedAuth.mockRejectedValueOnce(new Error("No session found"));
    const { response, next }: MiddlewareReturn = await sessionExists()();
    expect((await response?.json())?.error).toEqual("Unauthorized");
    expect(next).toBe(false);
  });
  it("Shouldn't allow a request for a deactivated user", async () => {
    const mockSession = {
      expires: "1",
      user: {
        id: "1",
        email: "test@cds.ca",
        name: "Testing session middleware",
        image: "null",
        deactivated: true,
        acceptableUse: false,
        hasSecurityQuestions: true,
        privileges: [],
      },
    };

    mockedAuth.mockResolvedValueOnce({ session: mockSession, ability: {} as UserAbility });

    const { next, response }: MiddlewareReturn = await sessionExists()();
    expect((await response?.json())?.error).toEqual("Unauthorized");
    expect(next).toBe(false);
  });

  it("Should allow a request with a valid session", async () => {
    const mockSession = {
      expires: "1",
      user: {
        id: "1",
        email: "test@cds.ca",
        name: "Testing session middleware",
        image: "null",
        deactivated: false,
        acceptableUse: true,
        hasSecurityQuestions: true,
        privileges: [],
      },
    };
    mockedAuth.mockResolvedValueOnce({ session: mockSession, ability: {} as UserAbility });
    const { next, response }: MiddlewareReturn = await sessionExists()();
    expect(response).toBeUndefined();
    expect(next).toBe(true);
  });
});
