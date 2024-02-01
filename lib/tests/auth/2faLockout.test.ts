/**
 * @jest-environment node
 */

import Redis from "ioredis-mock";
import { registerFailed2FAAttempt, clear2FALockout } from "@lib/auth/2faLockout";

const redis = new Redis();

jest.mock("@lib/integration/redisConnector", () => ({
  getRedisInstance: jest.fn(() => redis),
}));

const TEST_EMAIL = "myEmail@email.com";

const registerPreviousFailedAttempts = async (attempts: number) => {
  const failedAttemps = [];
  for (let i = 0; i < attempts; i++) {
    failedAttemps.push(registerFailed2FAAttempt(TEST_EMAIL));
  }

  await Promise.all(failedAttemps);
};

describe("Test 2FA lockout library", () => {
  beforeEach(() => {
    redis.flushall();
  });

  it("Should not lock user out if below maximum number of failed attempts", async () => {
    await registerPreviousFailedAttempts(3);

    const response = await registerFailed2FAAttempt(TEST_EMAIL);

    expect(response.isLockedOut).toBe(false);
  });

  it("Should lock user out after maximum number of failed attempts", async () => {
    await registerPreviousFailedAttempts(4);

    const response = await registerFailed2FAAttempt(TEST_EMAIL);

    expect(response.isLockedOut).toBe(true);
  });

  it("registerFailed2FAAttempt should return information on remaining number of attempts before lockout", async () => {
    for (let i = 1; i < 5; i++) {
      // eslint-disable-next-line no-await-in-loop
      const lockoutResponse = await registerFailed2FAAttempt(TEST_EMAIL);
      expect(lockoutResponse.isLockedOut).toBe(false);
      expect(lockoutResponse.remainingNumberOfAttemptsBeforeLockout).toEqual(5 - i);
    }
  });

  it("Should unlock user if its associated lockout entry was cleared because a new validation code was generated", async () => {
    await registerPreviousFailedAttempts(1);

    const firstResponse = await registerFailed2FAAttempt(TEST_EMAIL);

    expect(firstResponse.isLockedOut).toBe(false);

    await clear2FALockout(TEST_EMAIL);

    await registerPreviousFailedAttempts(1);

    const secondResponse = await registerFailed2FAAttempt(TEST_EMAIL);

    expect(secondResponse.isLockedOut).toBe(false);
  });
});
