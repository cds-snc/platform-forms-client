import { getRedisInstance } from "@lib/integration/redisConnector";
import { logMessage } from "@lib/logger";

export interface Lockout2FAResponse {
  isLockedOut: boolean;
  remainingNumberOfAttemptsBeforeLockout: number;
}

const LOCKOUT_KEY = "auth:2fa:failed";
const MAX_FAILED_ATTEMPTS_ALLOWED = 5;

export async function registerFailed2FAAttempt(email: string): Promise<Lockout2FAResponse> {
  const redis = await getRedisInstance();
  const incrementedNumberOfFailedLoginAttempts = await redis.incr(`${LOCKOUT_KEY}:${email}`);

  const isLockedOut = incrementedNumberOfFailedLoginAttempts >= MAX_FAILED_ATTEMPTS_ALLOWED;

  if (isLockedOut) logMessage.warn(`2FA session was locked out for user: ${email}`);

  return {
    isLockedOut,
    remainingNumberOfAttemptsBeforeLockout: Math.max(
      0,
      Math.min(MAX_FAILED_ATTEMPTS_ALLOWED - incrementedNumberOfFailedLoginAttempts, 10)
    ),
  };
}

export async function clear2FALockout(email: string): Promise<void> {
  const redis = await getRedisInstance();
  await redis.del(`${LOCKOUT_KEY}:${email}`);
}
