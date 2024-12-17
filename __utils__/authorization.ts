jest.mock("@lib/privileges");

import { authorization, getAbility } from "@lib/privileges";
import { UserAbility } from "@lib/types";
import { AccessControlError } from "@lib/auth";

type MockedAuthFunction = {
  [key: string]: jest.Mock;
};

export const authorizationPass = (userID: string) => {
  const mockedAuth: MockedAuthFunction = jest.mocked(authorization);
  for (const property in authorization) {
    mockedAuth[property] = jest
      .fn()
      .mockImplementation(() => Promise.resolve({ user: { id: userID } }));
  }
};

export const authorizationFail = (userID: string) => {
  const mockedAuth: MockedAuthFunction = jest.mocked(authorization);
  getAbilityMock(userID);
  for (const property in authorization) {
    mockedAuth[property] = jest
      .fn()
      .mockImplementation(() => Promise.reject(new AccessControlError()));
  }
};

export const getAbilityMock = (userID: string) => {
  const mockedAbility = jest.mocked(getAbility);
  mockedAbility.mockImplementation(() =>
    Promise.resolve({
      userID,
    } as UserAbility)
  );
};
