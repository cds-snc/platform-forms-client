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
 * Filters Prisma Connection vs DB errors
 * @param e Error object
 * @param returnValue Value to return back to called function
 * @returns returnValue object
 */
export const prismaErrors = <Error, T>(e: Error, returnValue: T): T => {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    logMessage.warn(e as Error);
  }
  if (process.env.APP_ENV !== "test") logMessage.error(e as Error);
  return returnValue;
};
