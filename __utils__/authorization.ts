jest.mock("@lib/privileges");

import { authorization, getAbility } from "@lib/privileges";
import { UserAbility } from "@lib/types";
import { AccessControlError } from "@lib/auth";

type MockedAuthFunction = {
  [key: string]: jest.Mock;
};

export const mockAuthorizationPass = (userID: string) => {
  const mockedAuth: MockedAuthFunction = jest.mocked(authorization);
  for (const property in authorization) {
    mockedAuth[property] = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ user: { id: userID } }));
  }
};

export const mockAuthorizationFail = (userID: string) => {
  const mockedAuth: MockedAuthFunction = jest.mocked(authorization);
  mockGetAbility(userID);
  for (const property in authorization) {
    mockedAuth[property] = jest
      .fn()
      .mockImplementation(() => Promise.reject(new AccessControlError()));
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
