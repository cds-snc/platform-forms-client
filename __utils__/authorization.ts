import { vi, type Mock } from "vitest";
import { authorization, getAbility } from "@lib/privileges";
import { UserAbility } from "@lib/types";
import { AccessControlError } from "@lib/auth/errors";

type MockedAuthFunction = {
  [key: string]: Mock;
};

export const mockAuthorizationPass = (userId: string) => {
  const mockedAuth = authorization as unknown as MockedAuthFunction;
  for (const property in authorization) {
    if (typeof mockedAuth[property] === "function") {
      mockedAuth[property] = vi
        .fn()
        .mockImplementation(() => Promise.resolve({ user: { id: userId } }));
    }
  }
};

export const mockAuthorizationFail = (userId: string) => {
  mockGetAbility(userId);
  const mockedAuth = authorization as unknown as MockedAuthFunction;
  for (const property in authorization) {
    if (typeof mockedAuth[property] === "function") {
      mockedAuth[property] = vi
        .fn()
        .mockImplementation(() =>
          Promise.reject(new AccessControlError(userId, "AccessControlError"))
        );
    }
  }
};

export const mockGetAbility = (userID: string, email = "test.user@cds-snc.ca") => {
  const mockedAbility = vi.mocked(getAbility);
  mockedAbility.mockImplementation(() =>
    Promise.resolve({
      user: {
        id: userID,
        email,
      },
    } as UserAbility)
  );
};
