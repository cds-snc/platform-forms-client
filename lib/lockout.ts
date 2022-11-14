import { getRedisInstance } from "./integration/redisConnector";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { LoggingAction } from "@lib/auth";
import { logMessage } from "./logger";

export interface LockoutResponse {
  isLockedOut: boolean;
  remainingNumberOfAttemptsBeforeLockout: number;
  numberOfSecondsBeforeLockoutExpires: number;
}

const LOCKOUT_KEY = "auth:failed";
const MAX_FAILED_ATTEMPTS_ALLOWED = 10;
const LOCKOUT_DURATION_IN_SECONDS = 3600; // 1 hour

export async function isUserLockedOut(email: string): Promise<LockoutResponse> {
  const redis = await getRedisInstance();
  const value = await redis.get(`${LOCKOUT_KEY}:${email}`);

  const attempts = value ? parseInt(value) : 1;

  if (attempts >= MAX_FAILED_ATTEMPTS_ALLOWED) {
    const lockoutTTL = await redis.ttl(`${LOCKOUT_KEY}:${email}`);
    return {
      isLockedOut: true,
      remainingNumberOfAttemptsBeforeLockout: 0,
      numberOfSecondsBeforeLockoutExpires: lockoutTTL,
    };
  } else
    return {
      isLockedOut: false,
      remainingNumberOfAttemptsBeforeLockout: Math.max(
        0,
        Math.min(MAX_FAILED_ATTEMPTS_ALLOWED - attempts, 10)
      ),
      numberOfSecondsBeforeLockoutExpires: 0,
    };
}

export async function registerFailedLoginAttempt(email: string): Promise<LockoutResponse> {
  const redis = await getRedisInstance();
  const incrementedNumberOfFailedLoginAttempts = await redis.incr(`${LOCKOUT_KEY}:${email}`);
  await redis.expire(`${LOCKOUT_KEY}:${email}`, LOCKOUT_DURATION_IN_SECONDS);

  const isLockedOut = incrementedNumberOfFailedLoginAttempts >= MAX_FAILED_ATTEMPTS_ALLOWED;

  isLockedOut && logLoginLockoutEvent(email);

  return {
    isLockedOut,
    remainingNumberOfAttemptsBeforeLockout: Math.max(
      0,
      Math.min(MAX_FAILED_ATTEMPTS_ALLOWED - incrementedNumberOfFailedLoginAttempts, 10)
    ),
    numberOfSecondsBeforeLockoutExpires: isLockedOut ? LOCKOUT_DURATION_IN_SECONDS : 0,
  };
}

export async function registerSuccessfulLoginAttempt(email: string): Promise<void> {
  const redis = await getRedisInstance();
  await redis.del(`${LOCKOUT_KEY}:${email}`);
}

async function logLoginLockoutEvent(email: string): Promise<void> {
  try {
    const apiUser = await prisma.apiUser.findFirst({
      where: {
        email: email,
      },
      select: {
        id: true,
      },
    });

    if (apiUser) {
      await prisma.apiAccessLog.create({
        data: {
          action: LoggingAction.LOCKED,
          userId: apiUser.id,
        },
      });
    } else {
      logMessage.warn(
        `An email address with no access to any form has been locked out. Email: ${email}`
      );
    }
  } catch (e) {
    prismaErrors(e, null);
  }
}
