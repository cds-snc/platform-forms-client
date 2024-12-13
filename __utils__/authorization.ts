import { AccessControlError, authorization, getAbility } from "@lib/privileges";
import { UserAbility } from "@lib/types";

type MockedAuthFunction = {
  [key: string]: jest.Mock;
};

export const authorizationPass = (userID: string) => {
  const mockedAuth: MockedAuthFunction = jest.mocked(authorization);
  for (const property in authorization) {
    mockedAuth[property] = jest.fn().mockReturnValue(Promise.resolve({ user: { id: userID } }));
  }
};

export const authorizationFail = (userID: string) => {
  const mockedAuth: MockedAuthFunction = jest.mocked(authorization);
  for (const property in authorization) {
    mockedAuth[property] = jest.fn().mockRejectedValue(new AccessControlError(userID));
  }
};

export const getAbilityMock = (userID: string) => {
  const mockedAbility = jest.mocked(getAbility);
  mockedAbility.mockResolvedValue({
    userID,
  } as UserAbility);
};
