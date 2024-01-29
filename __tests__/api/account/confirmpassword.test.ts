/**
 * @jest-environment node
 */

/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createMocks, RequestMethod } from "node-mocks-http";
import { getCsrfToken } from "@lib/client/csrfToken";
import { mocked } from "jest-mock";
import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import confirmpassword from "old_pages/api/account/confirmpassword";

const mockGetCSRFToken = mocked(getCsrfToken, { shallow: true });

jest.mock("next-auth/react");
jest.mock("@aws-sdk/client-cognito-identity-provider", () => ({
  CognitoIdentityProviderClient: jest.fn(),
  ConfirmForgotPasswordCommand: jest.fn(),
}));

describe("/account/confirmpassword", () => {
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

        await confirmpassword(req, res);
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

      await confirmpassword(req, res);
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Access Denied",
      });
    });
  });
  describe("Forgot Password Confirmation", () => {
    const mockedCognitoIdentityProviderClient: any = mocked(CognitoIdentityProviderClient, {
      shallow: true,
    });
    const mockedConfirmForgotPasswordCommand: any = mocked(ConfirmForgotPasswordCommand, {
      shallow: true,
    });
    const sendFunctionMock = jest.fn();
    afterEach(() => {
      mockedCognitoIdentityProviderClient.mockReset();
      mockedConfirmForgotPasswordCommand.mockReset();
      sendFunctionMock.mockReset();
    });
    it("handler returns 400 status code if username or confirmation code or password not provided", async () => {
      mockGetCSRFToken.mockResolvedValueOnce("valid_csrf");
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": "valid_csrf",
        },
      });

      await confirmpassword(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message:
          "username, password and security code needs to be provided in the body of the request",
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
          username: "test",
          password: "pass",
          confirmationCode: "1921231",
        },
      });

      await confirmpassword(req, res);
      expect(res.statusCode).toBe(200);
      expect(mockedCognitoIdentityProviderClient).toBeCalledTimes(1);
      expect(mockedConfirmForgotPasswordCommand.mock.calls[0][0]).toEqual({
        ClientId: "somemockvalue",
        Username: "test",
        Password: "pass",
        ConfirmationCode: "1921231",
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
          username: "test",
          password: "test",
          confirmationCode: "1921231",
        },
      });

      await confirmpassword(req, res);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: "There is an error",
      });
    });
  });
});
