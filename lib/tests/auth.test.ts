/**
 * @jest-environment node
 */

import { requireAuthentication } from "@lib/auth/auth";
import { Base, mockUserPrivileges } from "__utils__/permissions";

import { auth } from "@lib/auth/nextAuth";
import { Session } from "next-auth";

const mockedAuth = auth as unknown as jest.MockedFunction<
  () => Promise<Omit<Session, "expires"> | null>
>;

describe("requireAuthentication", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    mockedAuth.mockReset();
  });
  it("Redirects users without a session to login screen", async () => {
    // No user session exists
    mockedAuth.mockResolvedValue(null);

    await expect(requireAuthentication()).rejects.toHaveProperty("url", "/en/auth/login");
    //expect(mockedRedirect).toHaveBeenCalledWith("/en/auth/login");
  });
  it("Redirects users with a deactivated account to the deactivated-account page", async () => {
    mockedAuth.mockResolvedValue({
      user: {
        email: "test@cds.ca",
        name: "test",
        image: "null",
        id: "1",
        privileges: mockUserPrivileges(Base, { user: { id: "1" } }),
        acceptableUse: false,
        deactivated: true,
        hasSecurityQuestions: true,
      },
    });
    await expect(requireAuthentication()).rejects.toHaveProperty(
      "url",
      "/en/auth/account-deactivated"
    );
  });
  it("Redirects users to acceptable use page when not yet accepted", async () => {
    mockedAuth.mockResolvedValue({
      user: {
        email: "test@cds.ca",
        name: "test",
        image: "null",
        id: "1",
        privileges: mockUserPrivileges(Base, { user: { id: "1" } }),
        acceptableUse: false,
        hasSecurityQuestions: true,
      },
    });

    await expect(requireAuthentication()).rejects.toHaveProperty(
      "url",
      "/en/auth/policy?referer=/forms"
    );
  });
});
