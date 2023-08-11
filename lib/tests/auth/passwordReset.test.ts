/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { prismaMock } from "@jestUtils";
import { sendPasswordResetLink } from "@lib/auth/passwordReset";
import { logMessage } from "@lib/logger";
import { userHasSecurityQuestions } from "@lib/auth/securityQuestions/securityQuestions";
import { generateVerificationCode } from "@lib/auth/2fa";

jest.mock("@lib/logger");
const mockLogMessage = jest.mocked(logMessage, { shallow: true });

jest.mock("@lib/auth/securityQuestions/securityQuestions");
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
        await sendPasswordResetLink("email");
      }).rejects.toThrowError(
        new Error("Failed to send password reset link. Reason: missing security questions.")
      );
    });

    it("Succeeds TBD", async () => {
      (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({});

      mockUserHasSecurityQuestions.mockResolvedValueOnce(true);

      mockGenerateVerificationCode.mockResolvedValueOnce("code");

      IsGCNotifyServiceAvailable = false;

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
    //
  });
});
