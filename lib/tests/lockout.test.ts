import Redis from "ioredis-mock";
import {
  isUserLockedOut,
  registerFailedLoginAttempt,
  registerSuccessfulLoginAttempt,
} from "@lib/lockout";

const redis = new Redis();

jest.mock("@lib/integration/redisConnector", () => ({
  getRedisInstance: jest.fn(() => redis),
}));

const TEST_EMAIL = "myEmail@email.com";

describe("Test Login lockout implementation", () => {
  beforeEach(() => {
    redis.flushall();
    jest.useRealTimers();
  });

  it("Should allow user to log in when no failed attempt has been registered", async () => {
    const lockoutResponse = await isUserLockedOut(TEST_EMAIL);
    expect(lockoutResponse.isLockedOut).toBe(false);
  });

  it("Should allow user to log in even if a few failed attempts have been registered", async () => {
    for (let i = 0; i < 9; i++) {
      await registerFailedLoginAttempt(TEST_EMAIL);
    }

    const lockoutResponse = await isUserLockedOut(TEST_EMAIL);

    expect(lockoutResponse.isLockedOut).toBe(false);
  });

  it("Should not allow user to log in after 10 failed attempts have been registered", async () => {
    for (let i = 0; i < 10; i++) {
      await registerFailedLoginAttempt(TEST_EMAIL);
    }

    const lockoutResponse = await isUserLockedOut(TEST_EMAIL);

    expect(lockoutResponse.isLockedOut).toBe(true);
  });

  it("Should allow user to try to log in for several times if a successful attempt has occured between failed ones", async () => {
    for (let i = 0; i < 9; i++) {
      await registerFailedLoginAttempt(TEST_EMAIL);
    }

    const firstlockoutResponse = await isUserLockedOut(TEST_EMAIL);

    expect(firstlockoutResponse.isLockedOut).toBe(false);

    await registerSuccessfulLoginAttempt(TEST_EMAIL);

    for (let i = 0; i < 9; i++) {
      await registerFailedLoginAttempt(TEST_EMAIL);
    }

    const secondlockoutResponse = await isUserLockedOut(TEST_EMAIL);

    expect(secondlockoutResponse.isLockedOut).toBe(false);
  });

  it("Should allow user to log in 1 hour after the tenth failed attempt", async () => {
    for (let i = 0; i < 10; i++) {
      await registerFailedLoginAttempt(TEST_EMAIL);
    }

    const firstlockoutResponse = await isUserLockedOut(TEST_EMAIL);

    expect(firstlockoutResponse.isLockedOut).toBe(true);

    const newDate = new Date();
    newDate.setHours(newDate.getHours() + 1);
    newDate.setMinutes(newDate.getMinutes() + 1);
    jest.useFakeTimers().setSystemTime(newDate);

    const secondlockoutResponse = await isUserLockedOut(TEST_EMAIL);

    expect(secondlockoutResponse.isLockedOut).toBe(false);
  });

  it("Should not allow user to log in 58 minutes after the tenth failed attempt", async () => {
    for (let i = 0; i < 10; i++) {
      await registerFailedLoginAttempt(TEST_EMAIL);
    }

    const firstlockoutResponse = await isUserLockedOut(TEST_EMAIL);

    expect(firstlockoutResponse.isLockedOut).toBe(true);

    const newDate = new Date();
    newDate.setMinutes(newDate.getMinutes() + 59);
    jest.useFakeTimers().setSystemTime(newDate);

    const secondlockoutResponse = await isUserLockedOut(TEST_EMAIL);

    expect(secondlockoutResponse.isLockedOut).toBe(true);
  });

  it("isUserLockedOut should return information on remaining number of attempts before lockout", async () => {
    for (let i = 1; i < 10; i++) {
      await registerFailedLoginAttempt(TEST_EMAIL);

      const lockoutResponse = await isUserLockedOut(TEST_EMAIL);
      expect(lockoutResponse.isLockedOut).toBe(false);
      expect(lockoutResponse.remainingNumberOfAttemptsBeforeLockout).toBe(10 - i);
      expect(lockoutResponse.numberOfSecondsBeforeLockoutExpires).toBe(undefined);
    }
  });

  it("isUserLockedOut should return information on lockout expiry time", async () => {
    for (let i = 0; i < 10; i++) {
      await registerFailedLoginAttempt(TEST_EMAIL);
    }

    const firstlockoutResponse = await isUserLockedOut(TEST_EMAIL);

    expect(firstlockoutResponse.isLockedOut).toBe(true);
    expect(firstlockoutResponse.numberOfSecondsBeforeLockoutExpires).toBe(3600);
    expect(firstlockoutResponse.remainingNumberOfAttemptsBeforeLockout).toBe(undefined);

    const newDate = new Date();
    newDate.setMinutes(newDate.getMinutes() + 50);
    jest.useFakeTimers().setSystemTime(newDate);

    const secondlockoutResponse = await isUserLockedOut(TEST_EMAIL);
    expect(secondlockoutResponse.isLockedOut).toBe(true);
    expect(secondlockoutResponse.numberOfSecondsBeforeLockoutExpires).toBe(600);
  });

  it("registerFailedLoginAttempt should return information on remaining number of attempts before lockout", async () => {
    for (let i = 1; i < 10; i++) {
      const lockoutResponse = await registerFailedLoginAttempt(TEST_EMAIL);
      expect(lockoutResponse.isLockedOut).toBe(true);
      expect(lockoutResponse.remainingNumberOfAttemptsBeforeLockout).toBe(10 - i);
      expect(lockoutResponse.numberOfSecondsBeforeLockoutExpires).toBe(undefined);
    }
  });

  it("registerFailedLoginAttempt should return information on lockout expiry time", async () => {
    for (let i = 0; i < 10; i++) {
      await registerFailedLoginAttempt(TEST_EMAIL);
    }

    const lockoutResponse = await registerFailedLoginAttempt(TEST_EMAIL);

    expect(lockoutResponse.isLockedOut).toBe(false);
    expect(lockoutResponse.numberOfSecondsBeforeLockoutExpires).toBe(3600);
    expect(lockoutResponse.remainingNumberOfAttemptsBeforeLockout).toBe(undefined);
  });
});
