/**
 * @jest-environment node
 */

import { auth } from "@lib/auth/nextAuth";
import { sessionExists } from "@lib/middleware";
import { MiddlewareReturn } from "@lib/types";
import { Session } from "next-auth";

const mockedAuth = auth as unknown as jest.MockedFunction<
  () => Promise<Omit<Session, "expires"> | null>
>;

describe("Test a session middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Shouldn't allow a request with an invalid session", async () => {
    mockedAuth.mockResolvedValueOnce(null);
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

    mockedAuth.mockResolvedValueOnce(mockSession);

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
    mockedAuth.mockResolvedValueOnce(mockSession);
    const { next, response }: MiddlewareReturn = await sessionExists()();
    expect(response).toBeUndefined();
    expect(next).toBe(true);
  });
});
