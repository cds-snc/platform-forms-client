import { AccessControlError, authorization } from "@lib/privileges";
jest.mock("@lib/privileges");

type MockedAuthFunction = {
  [key: string]: jest.Mock;
};

export const authorizationPass = () => {
  const mockedAuth: MockedAuthFunction = jest.mocked(authorization);
  for (const property in authorization) {
    mockedAuth[property] = jest.fn().mockReturnValue(Promise.resolve());
  }
};

export const authorizationFail = () => {
  const mockedAuth: MockedAuthFunction = jest.mocked(authorization);
  for (const property in authorization) {
    mockedAuth[property] = jest.fn().mockRejectedValue(new AccessControlError("userId"));
  }
};
