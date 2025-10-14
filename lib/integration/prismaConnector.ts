import { logMessage } from "@lib/logger";
import { initializeDbConnection, Prisma } from "@root/packages/database/src";

// See https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
// Needed to ensure we only instantiate Prisma Client once

const prismaClientSingleton = () => initializeDbConnection();
declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

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
    logMessage.info(e.message);
    return returnValue;
  }

  // Continue to raise the error if it is a different type of Error or not a handled Prisma Error.
  logMessage.error(JSON.stringify(e));
  throw e;
};
