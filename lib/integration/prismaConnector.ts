import { PrismaClient, Prisma } from "@prisma/client";
import { logMessage } from "@lib/logger";

// See https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
// Needed to ensure we only instantiate Prisma Client once

export const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Filters Prisma Connection and DB errors
 * @param e Error object
 * @param returnValue Value to return back to called function
 * @returns returnValue object if Prisma Error otherwise raise error
 */
export const prismaErrors = <Error, T>(e: Error, returnValue: T): T => {
  // If we're in test mode ignore that we cannot connect to the Prisma Backend
  if (process.env.APP_ENV === "test" && e instanceof Prisma.PrismaClientInitializationError) {
    return returnValue;
  }

  // Return the backup value if a Prisma Error occurs
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    logMessage.warn(e as Error);
    return returnValue;
  }

  // Continue to raise the error if it is a different type of Error or not a handled Prisma Error.
  logMessage.error(e as Error);
  throw e;
};
