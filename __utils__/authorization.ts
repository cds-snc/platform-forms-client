jest.mock("@lib/privileges");

import { authorization, getAbility } from "@lib/privileges";
import { UserAbility } from "@lib/types";
import { AccessControlError } from "@lib/auth/errors";

type MockedAuthFunction = {
  [key: string]: jest.Mock;
};

export const mockAuthorizationPass = (userId: string) => {
  const mockedAuth: MockedAuthFunction = jest.mocked(authorization);
  for (const property in authorization) {
    mockedAuth[property] = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ user: { id: userId } }));
  }
};

export const mockAuthorizationFail = (userId: string) => {
  const mockedAuth: MockedAuthFunction = jest.mocked(authorization);
  mockGetAbility(userId);
  for (const property in authorization) {
    mockedAuth[property] = jest
      .fn()
      .mockImplementation(() => Promise.reject(new AccessControlError(userId)));
  }
};

export const mockGetAbility = (userID: string, email = "test.user@cds-snc.ca") => {
  const mockedAbility = jest.mocked(getAbility);
  mockedAbility.mockImplementation(() =>
    Promise.resolve({
      user: {
        id: userID,
        email,
      },
    } as UserAbility)
  );
};
