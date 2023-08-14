/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { prismaMock } from "@jestUtils";
import {
  PasswordResetExpiredLink,
  PasswordResetInvalidLink,
  getPasswordResetAuthenticatedUserEmailAddress,
  sendPasswordResetLink,
} from "@lib/auth/passwordReset";
import { logMessage } from "@lib/logger";
import { userHasSecurityQuestions } from "@lib/auth/securityQuestions";
import { generateVerificationCode } from "@lib/auth/2fa";

jest.mock("@lib/logger");
const mockLogMessage = jest.mocked(logMessage, { shallow: true });

jest.mock("@lib/auth/securityQuestions");
const mockUserHasSecurityQuestions = jest.mocked(userHasSecurityQuestions, { shallow: true });

jest.mock("@lib/auth/2fa");
const mockGenerateVerificationCode = jest.mocked(generateVerificationCode, {
  shallow: true,
});

let IsGCNotifyServiceAvailable = true;

const mockSendEmail = {
  sendEmail: jest.fn(() => {
    if (IsGCNotifyServiceAvailable) {
      return Promise.resolve();
    } else {
      return Promise.reject(new Error("something went wrong"));
    }
  }),
};

jest.mock("@lib/integration/notifyConnector", () => ({
  getNotifyInstance: jest.fn(() => mockSendEmail),
}));

describe("Test Password Reset library", () => {
  describe("Test sendPasswordResetLink function", () => {
    it("Succeeds even if email does not exist", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce(null);

      await sendPasswordResetLink("email");

      expect(mockLogMessage.warn.mock.calls[0][0]).toBe(
        "Someone requested a reset password link with an email address that does not exist (email)"
      );
    });

    it("Throws exception if user did not set up security questions", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({});

      mockUserHasSecurityQuestions.mockResolvedValueOnce(false);

      await expect(async () => {
        await sendPasswordResetLink("email@test.com");
      }).rejects.toThrowError(
        new Error(
          "Failed to send password reset link. Reason: Missing security questions for user email@test.com."
        )
      );
    });

    it("Throws exception if GC Notify service is not working properly", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({});

      mockUserHasSecurityQuestions.mockResolvedValueOnce(true);

      mockGenerateVerificationCode.mockResolvedValueOnce("code");

      IsGCNotifyServiceAvailable = false;

      await expect(async () => {
        await sendPasswordResetLink("email");
      }).rejects.toThrowError(
        new Error(
          "Failed to send password reset link. Reason: Notify failed to send the password reset email."
        )
      );
    });

    it("Works as expected and triggers database update + GC Notify request", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({});

      mockUserHasSecurityQuestions.mockResolvedValueOnce(true);

      mockGenerateVerificationCode.mockResolvedValueOnce("code");

      IsGCNotifyServiceAvailable = true;

      await sendPasswordResetLink("email");

      expect(prismaMock.magicLink.upsert).toHaveBeenCalledWith({
        where: {
          identifier: "email",
        },
        update: expect.objectContaining({
          token: "code",
        }),
        create: expect.objectContaining({
          identifier: "email",
          token: "code",
        }),
      });

      expect(mockSendEmail.sendEmail).toHaveBeenCalled();
    });
  });

  describe("Test getPasswordResetAuthenticatedUserEmailAddress function", () => {
    it("Throws exception if password reset token is invalid", async () => {
      (prismaMock.magicLink.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce(null);

      await expect(async () => {
        await getPasswordResetAuthenticatedUserEmailAddress("token");
      }).rejects.toThrowError(PasswordResetInvalidLink);
    });

    it("Throws exception if password reset token is expired", async () => {
      (prismaMock.magicLink.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
        identifier: "email",
        token: "token",
        expires: new Date(Date.now() - 10000),
      });

      await expect(async () => {
        await getPasswordResetAuthenticatedUserEmailAddress("token");
      }).rejects.toThrowError(PasswordResetExpiredLink);

      expect(prismaMock.magicLink.deleteMany).toHaveBeenCalledWith({
        where: {
          identifier: "email",
          token: "token",
        },
      });
    });

    it("Works as expected and returns identifier linked to given token", async () => {
      (prismaMock.magicLink.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
        identifier: "my custom identifier",
        token: "token",
        expires: new Date(Date.now() + 10000),
      });

      const sut = await getPasswordResetAuthenticatedUserEmailAddress("token");

      expect(sut).toEqual("my custom identifier");

      expect(prismaMock.magicLink.deleteMany).toHaveBeenCalledWith({
        where: {
          identifier: "my custom identifier",
          token: "token",
        },
      });
    });
  });
});
