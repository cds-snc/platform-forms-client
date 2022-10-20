import { PrismaClient, Prisma } from "@prisma/client";
import { logMessage } from "@lib/logger";

// See https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
// Needed to ensure we only instantiate Prisma Client once

interface CustomNodeJsGlobal {
  prisma: PrismaClient;
}
declare const global: CustomNodeJsGlobal;

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

/**
 * Filters Prisma Connection and DB errors
 * @param e Error object
 * @param returnValue Value to return back to called function
 * @returns returnValue object if Prisma Error otherwise raise error
 */
export const prismaErrors = <Error, T>(e: Error, returnValue?: T): T => {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    logMessage.warn(e as Error);
    if (returnValue !== undefined) return returnValue;
  }
  // If we're in test mode ignore that we cannot connect to the Prisma Backend
  if (process.env.NODE_ENV === "test" && e instanceof Prisma.PrismaClientInitializationError) {
    if (returnValue !== undefined) return returnValue;
  }
  logMessage.error(e as Error);
  throw e;
};
