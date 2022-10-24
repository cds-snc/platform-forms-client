/**
 * @jest-environment node
 */

import { createMocks } from "node-mocks-http";
import acceptableUse from "@pages/api/acceptableuse";
import { setAcceptableUse } from "@lib/acceptableUseCache";
import { getCsrfToken } from "next-auth/react";
import { unstable_getServerSession } from "next-auth/next";
import { Session } from "next-auth";

jest.mock("next-auth/next");
jest.mock("next-auth/react");
jest.mock("@lib/acceptableUseCache");
const mockedSetAcceptableUse = jest.mocked(setAcceptableUse, { shallow: true });
const mockedGetCsrfToken = jest.mocked(getCsrfToken, { shallow: true });
//Needed in the typescript version of the test so types are inferred correclty
const mockGetSession = jest.mocked(unstable_getServerSession, { shallow: true });

describe("Test acceptable use endpoint", () => {
  beforeEach(() => {
    const mockSession: Session = {
      expires: "1",
      user: {
        id: "1",
        email: "forms@cds.ca",
        name: "forms user",
        privileges: [],
      },
    };

    mockGetSession.mockResolvedValue(mockSession);
  });
  afterEach(() => mockGetSession.mockReset());
  mockedGetCsrfToken.mockResolvedValue("CsrfToken");
  it("Should set acceptableuse value to true for userID 1 and return 200", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        "x-csrf-token": "CsrfToken",
      },
      body: {
        userID: 1,
      },
    });
    await acceptableUse(req, res);
    expect(res.statusCode).toBe(200);
  });

  it("Should return 401 for unauthenticated user", async () => {
    mockGetSession.mockReset();
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        "x-csrf-token": "CsrfToken",
      },
      body: {
        userID: undefined,
      },
    });
    await acceptableUse(req, res);
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ error: "Unauthorized" }));
  });

  it("Should throw an error and return 500 status code", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        "x-csrf-token": "CsrfToken",
      },
      body: {
        userID: 2,
      },
    });

    mockedSetAcceptableUse.mockRejectedValue(Error("Could not connect to cache"));

    await acceptableUse(req, res);
    expect(res.statusCode).toBe(500);
  });
});
