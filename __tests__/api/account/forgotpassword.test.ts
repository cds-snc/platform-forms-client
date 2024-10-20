/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createMocks, RequestMethod } from "node-mocks-http";
import { getCsrfToken } from "@lib/client/csrfToken";
import { prismaMock } from "@jestUtils";
import {
  CognitoIdentityProviderClient,
  ForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import forgotpassword from "old_pages/api/account/forgotpassword";
import { logEvent } from "@lib/auditLogs";

const mockGetCSRFToken = jest.mocked(getCsrfToken, { shallow: true });
const mockedLogEvent = jest.mocked(logEvent, { shallow: true });
jest.mock("@lib/auditLogs");
jest.mock("next-auth/react");
jest.mock("@aws-sdk/client-cognito-identity-provider", () => ({
  CognitoIdentityProviderClient: jest.fn(),
  ForgotPasswordCommand: jest.fn(),
}));

describe("/account/confirmpassword", () => {
  afterEach(() => {
    mockGetCSRFToken.mockReset();
  });
  beforeAll(() => {
    process.env.COGNITO_APP_CLIENT_ID = "somemockvalue";
  });
  afterAll(() => {
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

        await forgotpassword(req, res);
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

      await forgotpassword(req, res);
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Access Denied",
      });
    });
  });
  describe("Forgot Password", () => {
    const mockedCognitoIdentityProviderClient: any = jest.mocked(CognitoIdentityProviderClient, {
      shallow: true,
    });
    const mockedConfirmForgotPasswordCommand: any = jest.mocked(ForgotPasswordCommand, {
      shallow: true,
    });
    const sendFunctionMock = jest.fn();
    afterEach(() => {
      mockedCognitoIdentityProviderClient.mockReset();
      mockedConfirmForgotPasswordCommand.mockReset();
      sendFunctionMock.mockReset();
    });
    it("handler returns 400 status code if username not provided", async () => {
      mockGetCSRFToken.mockResolvedValueOnce("valid_csrf");
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": "valid_csrf",
        },
      });

      await forgotpassword(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: "username needs to be provided in the body of the request",
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

      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: "asefeasdf",
      });

      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": "valid_csrf",
        },
        body: {
          username: "test",
        },
      });

      await forgotpassword(req, res);
      expect(res.statusCode).toBe(200);
      expect(mockedCognitoIdentityProviderClient).toBeCalledTimes(1);
      expect(mockedConfirmForgotPasswordCommand.mock.calls[0][0]).toEqual({
        ClientId: "somemockvalue",
        Username: "test",
      });
      expect(res._getData()).toEqual("");
      expect(mockedLogEvent).toBeCalledWith(
        "asefeasdf",
        { id: "asefeasdf", type: "User" },
        "UserPasswordReset"
      );
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
        },
      });

      await forgotpassword(req, res);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        message: "There is an error",
      });
      expect(mockedLogEvent).not.toHaveBeenCalled();
    });
  });
});
