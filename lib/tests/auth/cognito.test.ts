/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import Redis from "ioredis-mock";
import { mockClient } from "aws-sdk-client-mock";
import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminInitiateAuthResponse,
  CognitoIdentityProviderServiceException,
} from "@aws-sdk/client-cognito-identity-provider";
import { prismaMock } from "@jestUtils";
import {
  initiateSignIn,
  begin2FAAuthentication,
  requestNew2FAVerificationCode,
  validate2FAVerificationCode,
  Validate2FAVerificationCodeResultStatus,
} from "@lib/auth";
import { Base } from "__utils__/permissions";
import { generateVerificationCode, sendVerificationCode } from "@lib/auth/2fa";
import { registerFailed2FAAttempt, clear2FALockout } from "@lib/auth/2faLockout";
import { logEvent } from "@lib/auditLogs";

const redis = new Redis();
jest.mock("@lib/integration/redisConnector", () => ({
  getRedisInstance: jest.fn(() => redis),
}));

const cognitoMock = mockClient(CognitoIdentityProviderClient);

jest.mock("@lib/auth/2fa");
const mockGenerateVerificationCode = jest.mocked(generateVerificationCode, {
  shallow: true,
});
const mockSendVerificationCode = jest.mocked(sendVerificationCode, {
  shallow: true,
});

jest.mock("@lib/auth/2faLockout");
const mockRegisterFailed2FAAttempt = jest.mocked(registerFailed2FAAttempt, {
  shallow: true,
});
const mockClear2FALockout = jest.mocked(clear2FALockout, {
  shallow: true,
});

jest.mock("@lib/auditLogs");
const mockLogEvent = jest.mocked(logEvent, { shallow: true });

/*
JWT token including:
{
  "sub": "f4f7cedb-0f0b-4390-91a2-69e8c8a29f67",
  "name": "Test User",
  "email": "test@test.com"
}
*/
const mockedCognitoToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNGY3Y2VkYi0wZjBiLTQzOTAtOTFhMi02OWU4YzhhMjlmNjciLCJuYW1lIjoiVGVzdCBVc2VyIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIn0.7BofsW0I0SRMb1BWgDuRV_CupOttdsOJXE4JV6kYhyc";

describe("Test Cognito library", () => {
  beforeEach(() => {
    redis.flushall();
  });

  describe("initiateSignIn", () => {
    it("Should return email with token if Cognito was able to authenticate the user", async () => {
      const cognitoMockedResponse: AdminInitiateAuthResponse = {
        AuthenticationResult: {
          IdToken: mockedCognitoToken,
        },
      };

      cognitoMock.on(AdminInitiateAuthCommand).resolves(cognitoMockedResponse);

      const signInResponse = await initiateSignIn({
        username: "test@test.com",
        password: "testtest",
      });

      expect(signInResponse?.email).toEqual("test@test.com");
      expect(signInResponse?.token).toEqual(mockedCognitoToken);
    });

    it("Should return null if Cognito was not able to authenticate the user", async () => {
      const cognitoMockedResponse: AdminInitiateAuthResponse = {
        AuthenticationResult: {
          IdToken: undefined,
        },
      };

      cognitoMock.on(AdminInitiateAuthCommand).resolves(cognitoMockedResponse);

      const signInResponse = await initiateSignIn({
        username: "test@test.com",
        password: "testtest",
      });

      expect(signInResponse).toBeNull();
    });

    it("Should throw error and create audit log if Cognito returns Password attempts exceeded exception", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: "3",
        name: "user_1",
        email: "fads@asdf.ca",
        privileges: Base,
      });

      cognitoMock.on(AdminInitiateAuthCommand).rejects(
        new CognitoIdentityProviderServiceException({
          name: "NotAuthorizedException",
          message: "Password attempts exceeded",
          $fault: "client",
          $metadata: {},
        })
      );

      await expect(async () => {
        await initiateSignIn({
          username: "test@test.com",
          password: "testtest",
        });
      }).rejects.toThrowError(new Error("NotAuthorizedException: Password attempts exceeded"));

      expect(mockLogEvent).toHaveBeenCalledWith(
        "3",
        { id: "3", type: "User" },
        "UserTooManyFailedAttempts",
        "Password attempts exceeded for test@test.com"
      );
    });
  });

  describe("begin2FAAuthentication", () => {
    it("Should generate a verification code and save it in the database", async () => {
      const mockedId = "f4f7cedb-0f0b-4390-91a2-69e8c8a29f67";

      (prismaMock.cognitoCustom2FA.upsert as jest.MockedFunction<any>).mockResolvedValue({
        id: mockedId,
      });

      const verificationCode = await generateVerificationCode();
      mockGenerateVerificationCode.mockResolvedValueOnce(verificationCode);

      const begin2FAAuthenticationResponse = await begin2FAAuthentication({
        email: "test@test.com",
        token: mockedCognitoToken,
      });

      expect(prismaMock.cognitoCustom2FA.upsert).toHaveBeenCalledWith({
        where: {
          email: "test@test.com",
        },
        update: expect.objectContaining({
          cognitoToken: mockedCognitoToken,
          verificationCode: verificationCode,
        }),
        create: expect.objectContaining({
          email: "test@test.com",
          cognitoToken: mockedCognitoToken,
          verificationCode: verificationCode,
        }),
        select: {
          id: true,
        },
      });

      expect(mockClear2FALockout).toHaveBeenCalled();

      expect(mockSendVerificationCode).toHaveBeenCalled();

      expect(begin2FAAuthenticationResponse).toEqual(mockedId);
    });
  });

  describe("requestNew2FAVerificationCode", () => {
    it("Should generate a new verification code and update the database entry associated to the email address", async () => {
      const mockedId = "f4f7cedb-0f0b-4390-91a2-69e8c8a29f67";

      const verificationCode = await generateVerificationCode();
      mockGenerateVerificationCode.mockResolvedValueOnce(verificationCode);

      await requestNew2FAVerificationCode(mockedId, "test@test.com");

      expect(prismaMock.cognitoCustom2FA.update).toHaveBeenCalledWith({
        where: {
          id_email: {
            id: mockedId,
            email: "test@test.com",
          },
        },
        data: {
          verificationCode: verificationCode,
        },
      });

      expect(mockSendVerificationCode).toHaveBeenCalled();
    });
  });

  describe("validate2FAVerificationCode", () => {
    it("Should return VALID if email and verification code are both correct", async () => {
      const mockedId = "f4f7cedb-0f0b-4390-91a2-69e8c8a29f67";
      const mockedVerificationCode = "a1é3_8";

      (prismaMock.cognitoCustom2FA.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        cognitoToken: mockedCognitoToken,
        verificationCode: mockedVerificationCode,
        expires: new Date(Date.now() + 10000),
      });

      const validate2FAVerificationCodeResponse = await validate2FAVerificationCode(
        mockedId,
        "test@test.com",
        mockedVerificationCode
      );

      expect(validate2FAVerificationCodeResponse).toEqual({
        status: Validate2FAVerificationCodeResultStatus.VALID,
        decodedCognitoToken: {
          id: "f4f7cedb-0f0b-4390-91a2-69e8c8a29f67",
          name: "Test User",
          email: "test@test.com",
        },
      });

      expect(prismaMock.cognitoCustom2FA.deleteMany).toHaveBeenCalledWith({
        where: {
          email: "test@test.com",
        },
      });

      expect(mockClear2FALockout).toHaveBeenCalled();
    });

    it("Should return INVALID if email and/or authentication flow token code are invalid and number of attempts is below maximum allowed", async () => {
      (prismaMock.cognitoCustom2FA.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

      mockRegisterFailed2FAAttempt.mockResolvedValueOnce({
        isLockedOut: false,
        remainingNumberOfAttemptsBeforeLockout: 1,
      });

      const validate2FAVerificationCodeResponse = await validate2FAVerificationCode(
        "fakeId",
        "test@test.com",
        "fakeVerificationCode"
      );

      expect(validate2FAVerificationCodeResponse).toEqual({
        status: Validate2FAVerificationCodeResultStatus.INVALID,
      });
    });

    it("Should return INVALID if verification code is incorrect and number of attempts is below maximum allowed", async () => {
      const mockedId = "f4f7cedb-0f0b-4390-91a2-69e8c8a29f67";
      const mockedVerificationCode = "a1é3_8";

      (prismaMock.cognitoCustom2FA.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        cognitoToken: mockedCognitoToken,
        verificationCode: mockedVerificationCode,
        expires: new Date(Date.now() + 10000),
      });

      mockRegisterFailed2FAAttempt.mockResolvedValueOnce({
        isLockedOut: false,
        remainingNumberOfAttemptsBeforeLockout: 1,
      });

      const validate2FAVerificationCodeResponse = await validate2FAVerificationCode(
        mockedId,
        "test@test.com",
        "wrongVerificationCode"
      );

      expect(validate2FAVerificationCodeResponse).toEqual({
        status: Validate2FAVerificationCodeResultStatus.INVALID,
      });
    });

    it("Should return LOCKED_OUT if email and/or verification code are incorrect and number of attempts is equal or greater than maximum allowed", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: "3",
        name: "user_1",
        email: "fads@asdf.ca",
        privileges: Base,
      });

      (prismaMock.cognitoCustom2FA.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

      mockRegisterFailed2FAAttempt.mockResolvedValueOnce({
        isLockedOut: true,
        remainingNumberOfAttemptsBeforeLockout: 0,
      });

      const validate2FAVerificationCodeResponse = await validate2FAVerificationCode(
        "fakeId",
        "test@test.com",
        "fakeVerificationCode"
      );

      expect(validate2FAVerificationCodeResponse).toEqual({
        status: Validate2FAVerificationCodeResultStatus.LOCKED_OUT,
      });

      expect(prismaMock.cognitoCustom2FA.deleteMany).toHaveBeenCalledWith({
        where: {
          email: "test@test.com",
        },
      });

      expect(mockClear2FALockout).toHaveBeenCalled();

      expect(mockLogEvent).toHaveBeenCalledWith(
        "3",
        { id: "3", type: "User" },
        "UserTooManyFailedAttempts",
        "2FA attempts exceeded for test@test.com"
      );
    });

    it("Should return EXPIRED if verification code has expired (2FA session is no longer valid)", async () => {
      const mockedId = "f4f7cedb-0f0b-4390-91a2-69e8c8a29f67";
      const mockedVerificationCode = "a1é3_8";

      (prismaMock.cognitoCustom2FA.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        cognitoToken: mockedCognitoToken,
        verificationCode: mockedVerificationCode,
        expires: new Date(Date.now() - 10000),
      });

      const validate2FAVerificationCodeResponse = await validate2FAVerificationCode(
        mockedId,
        "test@test.com",
        mockedVerificationCode
      );

      expect(validate2FAVerificationCodeResponse).toEqual({
        status: Validate2FAVerificationCodeResultStatus.EXPIRED,
      });

      expect(prismaMock.cognitoCustom2FA.deleteMany).toHaveBeenCalledWith({
        where: {
          email: "test@test.com",
        },
      });

      expect(mockClear2FALockout).toHaveBeenCalled();
    });
  });
});
