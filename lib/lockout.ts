import { getRedisInstance } from "./integration/redisConnector";

export interface LockoutResponse {
  isLockedOut: boolean;
  remainingNumberOfAttemptsBeforeLockout?: number;
  numberOfSecondsBeforeLockoutExpires?: number;
}

const LOCKOUT_KEY = "auth:failed";
const MAX_FAILED_ATTEMPTS_ALLOWED = 10;
const LOCKOUT_DURATION_IN_SECONDS = 3600; // 1 hour

export async function isUserLockedOut(email: string): Promise<LockoutResponse> {
  const redis = await getRedisInstance();
  const value = await redis.get(`${LOCKOUT_KEY}:${email}`);

  if (value && parseInt(value) >= MAX_FAILED_ATTEMPTS_ALLOWED) {
    const lockoutTTL = await redis.ttl(`${LOCKOUT_KEY}:${email}`);
    return {
      isLockedOut: true,
      numberOfSecondsBeforeLockoutExpires: lockoutTTL,
    };
  } else
    return {
      isLockedOut: false,
      remainingNumberOfAttemptsBeforeLockout: value
        ? MAX_FAILED_ATTEMPTS_ALLOWED - parseInt(value)
        : MAX_FAILED_ATTEMPTS_ALLOWED,
    };
}

export async function registerFailedLoginAttempt(email: string): Promise<LockoutResponse> {
  const redis = await getRedisInstance();
  const value = await redis.get(`${LOCKOUT_KEY}:${email}`);

  if (value) {
    const incrementedNumberOfFailedLoginAttempts = await redis.incr(`${LOCKOUT_KEY}:${email}`);

    if (incrementedNumberOfFailedLoginAttempts >= MAX_FAILED_ATTEMPTS_ALLOWED) {
      await redis.expire(`${LOCKOUT_KEY}:${email}`, LOCKOUT_DURATION_IN_SECONDS);
      return {
        isLockedOut: false,
        numberOfSecondsBeforeLockoutExpires: LOCKOUT_DURATION_IN_SECONDS,
      };
    } else {
      return {
        isLockedOut: true,
        remainingNumberOfAttemptsBeforeLockout:
          MAX_FAILED_ATTEMPTS_ALLOWED - incrementedNumberOfFailedLoginAttempts,
      };
    }
  } else {
    await redis.incr(`${LOCKOUT_KEY}:${email}`);
    return {
      isLockedOut: true,
      remainingNumberOfAttemptsBeforeLockout: MAX_FAILED_ATTEMPTS_ALLOWED - 1,
    };
  }
}

export async function registerSuccessfulLoginAttempt(email: string): Promise<void> {
  const redis = await getRedisInstance();
  await redis.del(`${LOCKOUT_KEY}:${email}`);
}
