/**
 * @jest-environment node
 */
/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createMocks, RequestMethod } from "node-mocks-http";
import { getCsrfToken } from "next-auth/react";
import { mocked } from "jest-mock";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import register from "pages/api/account/register";

const mockGetCSRFToken = mocked(getCsrfToken, { shallow: true });

jest.mock("next-auth/react");
jest.mock("@aws-sdk/client-cognito-identity-provider", () => ({
  CognitoIdentityProviderClient: jest.fn(),
  SignUpCommand: jest.fn(),
}));

describe("/signup/register", () => {
  afterEach(() => {
    mockGetCSRFToken.mockReset();
  });
  beforeAll(() => {
    process.env.COGNITO_REGION = "ca-central-1";
    process.env.COGNITO_APP_CLIENT_ID = "somemockvalue";
  });
  afterAll(() => {
    process.env.COGNITO_REGION = undefined;
    process.env.COGNITO_APP_CLIENT_ID = undefined;
  });
  describe("Access Control", () => {
    test.each(["GET", "PUT", "DELETE"])(
      "Should not allow an unaccepted method",
      async (httpVerb) => {
        const { req, res } = createMocks({
          method: httpVerb as RequestMethod,
          headers: {
            "Content-Type": "application/json",
          },
        });

        await register(req, res);
        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res._getData())).toMatchObject({ error: "HTTP Method Forbidden" });
      }
    );

    it("does not allow a non valid CSRF token", async () => {
      mockGetCSRFToken.mockResolvedValueOnce("valid_csrf");
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": "invalid_csrf",
        },
      });

      await register(req, res);
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Access Denied",
      });
    });
  });
  describe("Sign Up Registration", () => {
    const mockedCognitoIdentityProviderClient: any = mocked(CognitoIdentityProviderClient, {
      shallow: true,
    });
    const mockedSignUpCommand: any = mocked(SignUpCommand, { shallow: true });
    const sendFunctionMock = jest.fn();
    afterEach(() => {
      mockedCognitoIdentityProviderClient.mockReset();
      mockedSignUpCommand.mockReset();
      sendFunctionMock.mockReset();
    });
    it("handler returns 400 status code when username, password or name is not included", async () => {
      mockGetCSRFToken.mockResolvedValueOnce("valid_csrf");
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": "valid_csrf",
        },
      });
      await register(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: "username and password need to be provided in the body of the request",
      });
    });
    it("handler returns 400 status code when username is not part of the acceptable domain", async () => {
      mockGetCSRFToken.mockResolvedValueOnce("valid_csrf");

      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": "valid_csrf",
        },
        body: {
          username: "test@uknown_domain.com",
          password: "test",
          name: "test",
        },
      });
      await register(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: "username does not meet requirements",
      });
    });
    it("handler returns empty body and cognito status code when command succeeds", async () => {
      mockGetCSRFToken.mockResolvedValueOnce("valid_csrf");
      sendFunctionMock.mockImplementation(async () => {
        return {
          $metadata: {
            httpStatusCode: 200,
          },
        };
      });
      mockedCognitoIdentityProviderClient.mockImplementationOnce(() => ({
        send: sendFunctionMock,
      }));

      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": "valid_csrf",
        },
        body: {
          username: "test@domain.gc.ca",
          password: "test",
          name: "test",
        },
      });

      await register(req, res);
      expect(res.statusCode).toBe(200);
      expect(mockedCognitoIdentityProviderClient).toBeCalledTimes(1);
      expect(mockedSignUpCommand.mock.calls[0][0]).toEqual({
        ClientId: "somemockvalue",
        Username: "test@domain.gc.ca",
        Password: "test",
        UserAttributes: [
          {
            Name: "name",
            Value: "test",
          },
        ],
      });
      expect(res._getData()).toEqual("");
    });
    it("handles error when the cognito send function fails", async () => {
      mockGetCSRFToken.mockResolvedValueOnce("valid_csrf");
      sendFunctionMock.mockRejectedValue({
        toString: () => "There is an error",
        $metadata: {
          httpStatusCode: 400,
        },
      });
      mockedCognitoIdentityProviderClient.mockImplementationOnce(() => ({
        send: sendFunctionMock,
      }));

      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": "valid_csrf",
        },
        body: {
          username: "test@domain.gc.ca",
          password: "test",
          name: "test",
        },
      });

      await register(req, res);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: "There is an error",
      });
    });
  });
});
